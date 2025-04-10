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

  const valtFörvalRaw = formData.get("valtFörval")?.toString();
  if (!valtFörvalRaw) throw new Error("⛔ Saknar valda förval");
  const valtFörval = JSON.parse(valtFörvalRaw);

  // 🟡 Nytt: hämta extrafält
  const extrafältRaw = formData.get("extrafält")?.toString();
  const extrafält = extrafältRaw ? JSON.parse(extrafältRaw) : {};

  // 🟢 Uppdaterad getBelopp med extrafält
  const getBelopp = (konto: any, typ: "debet" | "kredit") => {
    const nr = konto.kontonummer?.toString() ?? "";
    const andel = konto.andelAv;

    if (nr === "2615" && typ === "kredit" && extrafält["ingående fiktiv moms"]) {
      return parseFloat(extrafält["ingående fiktiv moms"]);
    }

    if (nr === "4545" && typ === "debet" && extrafält["tull och spedition"]) {
      return parseFloat(extrafält["tull och spedition"]);
    }

    if (nr === "4549" && typ === "kredit" && extrafält["övriga skatter"]) {
      return parseFloat(extrafält["övriga skatter"]);
    }

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
      valtFörval.typ,
      belopp,
      filename,
      kommentar,
      userId,
    ]);

    const transaktionsId = res.rows[0].transaktions_id;

    for (const konto of valtFörval.konton) {
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
      const debet = konto.debet ? getBelopp(konto, "debet") : 0;
      const kredit = konto.kredit ? getBelopp(konto, "kredit") : 0;

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
      return JSON.parse(content);
    }

    console.warn("⚠️ GPT unstructured content:", content);
    return { datum: "", belopp: 0 };
  } catch (error) {
    console.error("❌ extractDataFromOCR error:", error);
    return { datum: "", belopp: 0 };
  }
}

const calculateBelopp = (
  konto: any,
  typ: "debet" | "kredit",
  extrafält: Record<string, string>,
  belopp: number,
  moms: number,
  beloppUtanMoms: number
) => {
  const nr = konto.kontonummer?.toString() ?? "";
  const andel = konto.andelAv;

  if (nr === "2615" && typ === "kredit" && extrafält["ingående_fiktiv_moms"]) {
    return parseFloat(extrafält["ingående_fiktiv_moms"]);
  }

  if (nr === "4545" && typ === "debet" && extrafält["tull_och_spedition"]) {
    return parseFloat(extrafält["tull_och_spedition"]);
  }

  if (nr === "4549" && typ === "kredit" && extrafält["övriga_skatter"]) {
    return parseFloat(extrafält["övriga_skatter"]);
  }

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
    console.error("❌ kontoklass error:", error);
    return null;
  }
}
