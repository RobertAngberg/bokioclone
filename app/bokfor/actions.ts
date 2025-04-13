"use server";

import { Pool } from "pg";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

type ExtrafältRad = {
  debet?: number;
  kredit?: number;
  label?: string;
};

export async function extractDataFromOCR(text: string) {
  console.log("🧠 Extracting data from OCR text:", text);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            'Extract date and amount from OCR text. Respond with *raw* JSON only (no markdown, no triple backticks). Format: { "datum": "YYYY-MM-DD", "belopp": 1234.56 }.',
        },
        { role: "user", content: text },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (content && content.startsWith("{")) {
      const parsed = JSON.parse(content);
      console.log("✅ OCR extracted:", parsed);
      return parsed;
    }

    console.warn("⚠️ GPT unstructured content:", content);
    return { datum: "", belopp: 0 };
  } catch (error) {
    console.error("❌ extractDataFromOCR error:", error);
    return { datum: "", belopp: 0 };
  }
}

export async function getKontoklass(kontonummer: string) {
  try {
    const client = await pool.connect();
    const query = "SELECT kontoklass FROM konton WHERE kontonummer = $1";
    const res = await client.query(query, [kontonummer]);

    console.log("🔎 SQL result:", res.rows);
    client.release();

    if (res.rows.length === 0) {
      console.warn("⛔ Konto inte funnet för kontonummer:", kontonummer);
      return null;
    }

    return res.rows[0].kontoklass;
  } catch (error) {
    console.error("❌ getKontoklass error:", error);
    return null;
  }
}

export async function saveTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Ingen användare inloggad");
  const userId = parseInt(session.user.id);

  const transaktionsdatum = formData.get("transaktionsdatum")?.toString().trim() || "";
  const kommentar = formData.get("kommentar")?.toString().trim() || "";
  const fil = formData.get("fil") as File | null;
  const filename = fil ? fil.name : "";

  const valtFörvalRaw = formData.get("valtFörval")?.toString();
  if (!valtFörvalRaw) throw new Error("⛔ Saknar valda förval");
  const valtFörval = JSON.parse(valtFörvalRaw);

  const moms = parseFloat(formData.get("moms")?.toString().trim() || "0");
  const beloppUtanMoms = parseFloat(formData.get("beloppUtanMoms")?.toString().trim() || "0");

  const extrafältRaw = formData.get("extrafält")?.toString();
  const extrafält = extrafältRaw ? (JSON.parse(extrafältRaw) as Record<string, ExtrafältRad>) : {};

  // 📦 Logga allt
  console.log("📦 Spara transaktion...");
  console.log("🗓️ Datum:", transaktionsdatum);
  console.log("🧾 Kommentar:", kommentar);
  console.log("📁 Filnamn:", filename);
  console.log("💰 Moms:", moms);
  console.log("💡 Belopp utan moms:", beloppUtanMoms);
  console.log("🗂️ valtFörval:", valtFörval);
  console.log("🧩 extrafält:", extrafält);

  let belopp = parseFloat(formData.get("belopp")?.toString().trim() || "0");

  // 🚨 Justera belopp för specialförval
  if (valtFörval.specialtyp === "Importmoms" || valtFörval.specialtyp === "AmorteringBanklån") {
    const specialBelopp = extrafält?.["1930"]?.kredit ?? extrafält?.["1930"]?.debet ?? 0;
    belopp = parseFloat(specialBelopp.toString());
  }

  const client = await pool.connect();
  try {
    // 📝 Kontobeskrivning = alltid förvalets namn
    const kontobeskrivning = valtFörval.namn || "";

    const insertTransactionQuery = `
      INSERT INTO transaktioner (
        transaktionsdatum, kontobeskrivning, kontotyp, belopp, fil, kommentar, "userId"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING transaktions_id
    `;

    const res = await client.query(insertTransactionQuery, [
      new Date(transaktionsdatum),
      kontobeskrivning,
      valtFörval.typ,
      belopp,
      filename,
      kommentar,
      userId,
    ]);

    const transaktionsId = res.rows[0].transaktions_id;
    console.log("🆔 transaktions_id:", transaktionsId);

    // ===================== SPECIALFALL: IMPORTMOMS =====================
    if (valtFörval.specialtyp === "Importmoms") {
      console.log("🟡 Hanterar specialförval: Importmoms");

      for (const [kontonummer, data] of Object.entries(extrafält)) {
        const kontoRes = await client.query(
          "SELECT konto_id FROM konton WHERE kontonummer::text = $1",
          [kontonummer]
        );

        if (kontoRes.rows.length === 0) {
          console.warn(`⛔ Konto ${kontonummer} hittades inte i databasen`);
          continue;
        }

        const konto_id = kontoRes.rows[0].konto_id;
        const debet = Number(data.debet ?? 0);
        const kredit = Number(data.kredit ?? 0);

        console.log(`📘 Konto ${kontonummer} (${data.label}) – Debet: ${debet}, Kredit: ${kredit}`);

        await client.query(
          `INSERT INTO transaktionsposter (transaktions_id, konto_id, debet, kredit)
           VALUES ($1, $2, $3, $4)`,
          [transaktionsId, konto_id, debet, kredit]
        );
      }

      console.log("✅ Alla extrafält sparade");
    }

    // ===================== VANLIGA FÖRVAL =====================
    else {
      const getBelopp = (konto: any, typ: "debet" | "kredit") => {
        const nr = konto.kontonummer?.toString() ?? "";
        const andel = konto.andelAv;

        if (andel === "moms") return moms;
        if (andel === "utanMoms") return beloppUtanMoms;
        if (andel === "hela") return belopp;

        const alwaysFull = ["4531", "4535", "4500", "4010", "4400"];
        if (alwaysFull.includes(nr)) return belopp;

        const prefix = nr[0];
        if (typ === "debet") {
          if (prefix === "1") return belopp;
          if (prefix === "2") return moms;
          return beloppUtanMoms;
        }
        if (typ === "kredit") {
          if (prefix === "1") return belopp;
          if (prefix === "2") return moms;
          if (prefix === "3") return beloppUtanMoms;
        }

        return 0;
      };

      console.log("🟢 Sparar normalt förval");

      for (const konto of valtFörval.konton) {
        const kontonummer = konto.kontonummer?.toString().trim();
        if (!kontonummer) continue;

        const kontoRes = await client.query(
          "SELECT konto_id FROM konton WHERE kontonummer::text = $1",
          [kontonummer]
        );

        if (kontoRes.rows.length === 0) {
          console.warn(`⛔ Konto ${kontonummer} hittades inte`);
          continue;
        }

        const konto_id = kontoRes.rows[0].konto_id;
        const debet = konto.debet ? getBelopp(konto, "debet") : 0;
        const kredit = konto.kredit ? getBelopp(konto, "kredit") : 0;

        console.log(`📘 Konto ${kontonummer} – Debet: ${debet}, Kredit: ${kredit}`);

        await client.query(
          `INSERT INTO transaktionsposter (transaktions_id, konto_id, debet, kredit)
           VALUES ($1, $2, $3, $4)`,
          [transaktionsId, konto_id, debet, kredit]
        );
      }

      console.log("✅ Vanliga rader sparade");
    }

    client.release();
    revalidatePath("/grundbok");

    return { success: true, id: transaktionsId };
  } catch (error) {
    client.release();
    console.error("❌ saveTransaction error:", error);
    return { success: false, error };
  }
}
