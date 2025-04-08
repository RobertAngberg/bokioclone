"use server";

import { Pool } from "pg";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function saveTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Ingen användare inloggad");
  const userId = parseInt(session.user.id);

  const transaktionsdatum = formData.get("transaktionsdatum")?.toString().trim() || "";
  const kommentar = formData.get("kommentar")?.toString().trim() || "";
  const kontobeskrivning = formData.get("kontobeskrivning")?.toString().trim() || "";
  const belopp = parseFloat(formData.get("belopp")?.toString().trim() || "0");
  const moms = parseFloat(formData.get("moms")?.toString().trim() || "0");
  const beloppUtanMoms = parseFloat(formData.get("beloppUtanMoms")?.toString().trim() || "0");
  const fil = formData.get("fil") as File | null;
  const filename = fil ? fil.name : "";

  const valdaFörvalRaw = formData.get("valdaFörval")?.toString();
  if (!valdaFörvalRaw) throw new Error("⛔ Saknar valda förval");
  const valdaFörval = JSON.parse(valdaFörvalRaw);

  const momssats = parseFloat(valdaFörval.momssats ?? 0.25);

  const getBelopp = (konto: any, typ: "debet" | "kredit") => {
    const andel = konto.andelAv;
    if (andel === "moms") return moms;
    if (andel === "utanMoms") return beloppUtanMoms;
    if (andel === "hela") return belopp;

    if (!konto.kontonummer) return 0;
    const prefix = konto.kontonummer.slice(0, 1);

    if (typ === "debet") {
      if (prefix === "1") return belopp;
      if (prefix === "2") return moms;
      return beloppUtanMoms;
    }
    if (typ === "kredit") {
      if (prefix === "3") return beloppUtanMoms;
      if (prefix === "2") return moms;
      return belopp;
    }
    return 0;
  };

  const client = await pool.connect();
  try {
    const insertTransactionQuery = `
      INSERT INTO transaktioner (
        transaktionsdatum, kontobeskrivning, kontotyp, belopp, fil, kommentar, "userId"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING transaktions_id
    `;

    const res = await client.query(insertTransactionQuery, [
      new Date(transaktionsdatum),
      kontobeskrivning,
      valdaFörval.typ,
      belopp,
      filename,
      kommentar,
      userId,
    ]);
    const transaktionsId = res.rows[0].transaktions_id;

    for (const konto of valdaFörval.konton) {
      const kontonummer = konto.kontonummer?.toString().trim();
      if (!kontonummer) continue;

      const kontoRes = await client.query(
        "SELECT konto_id FROM konton WHERE kontonummer::text = $1",
        [kontonummer]
      );

      if (kontoRes.rows.length === 0) {
        throw new Error(`⛔ Konto not found: ${kontonummer}`);
      }

      const konto_id = kontoRes.rows[0].konto_id;
      const debet =
        konto.debet === true || typeof konto.debet === "string" ? getBelopp(konto, "debet") : 0;
      const kredit =
        konto.kredit === true || typeof konto.kredit === "string" ? getBelopp(konto, "kredit") : 0;

      await client.query(
        "INSERT INTO transaktionsposter (transaktions_id, konto_id, debet, kredit) VALUES ($1, $2, $3, $4)",
        [transaktionsId, konto_id, debet, kredit]
      );
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

export async function searchAccount(searchText: string) {
  if (!searchText) return null;

  try {
    const client = await pool.connect();

    const res = await client.query(
      `
      SELECT id, namn, beskrivning, kategori, konton, typ
      FROM förval
      WHERE EXISTS (
        SELECT 1 FROM unnest(sökord) AS s WHERE s ILIKE $1
      )
      LIMIT 1
      `,
      [`%${searchText}%`]
    );

    client.release();

    if (res.rows.length === 0) return null;

    return res.rows[0];
  } catch (error) {
    console.error("❌ searchAccount error:", error);
    return null;
  }
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function extractDataFromOCR(text: string) {
  try {
    const response = await client.chat.completions.create({
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
      return JSON.parse(content);
    }

    console.warn("⚠️ GPT unstructured content:", content);
    return { datum: "", belopp: 0 };
  } catch (error) {
    console.error("❌ extractDataFromOCR error:", error);
    return { datum: "", belopp: 0 };
  }
}

export async function getKontotyp(kontonummer: string) {
  try {
    const client = await pool.connect();
    const query = "SELECT kontotyp FROM konton WHERE kontonummer = $1";
    const res = await client.query(query, [kontonummer]);

    client.release();

    if (res.rows.length === 0) {
      console.warn("⛔ Konto inte funnet för kontonummer:", kontonummer);
      return null;
    }

    return res.rows[0].kontotyp;
  } catch (error) {
    console.error("❌ getKontotyp error:", error);
    return null;
  }
}

export async function validateAllForval() {
  const client = await pool.connect();

  try {
    const res = await client.query("SELECT * FROM förval ORDER BY namn");
    const felaktiga: { namn: string; id: number; debet: number; kredit: number }[] = [];

    for (const rad of res.rows) {
      const konton = typeof rad.konton === "string" ? JSON.parse(rad.konton) : rad.konton;
      const belopp = 100;
      const moms = parseFloat(rad.momssats ?? 0.25) * belopp;
      const utanMoms = belopp - moms;

      let debetSum = 0;
      let kreditSum = 0;

      for (const konto of konton) {
        const nr = konto.kontonummer?.toString().trim();
        if (!nr) continue;
        const prefix = nr.slice(0, 1);

        let val = 0;
        if (konto.andelAv === "moms") val = moms;
        else if (konto.andelAv === "utanMoms") val = utanMoms;
        else if (konto.andelAv === "hela") val = belopp;
        else {
          if (konto.kredit) val = prefix === "3" ? utanMoms : prefix === "2" ? moms : belopp;
          if (konto.debet) val = prefix === "1" ? belopp : prefix === "2" ? moms : utanMoms;
        }

        if (konto.debet) debetSum += val;
        if (konto.kredit) kreditSum += val;
      }

      // Jämför med max två decimaler
      if (Math.abs(debetSum - kreditSum) > 0.01) {
        felaktiga.push({
          namn: rad.namn,
          id: rad.id,
          debet: +debetSum.toFixed(2),
          kredit: +kreditSum.toFixed(2),
        });
      }
    }

    client.release();
    return felaktiga;
  } catch (err) {
    client.release();
    console.error("❌ validateAllForval error:", err);
    return [];
  }
}
