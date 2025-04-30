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
  const belopp = parseFloat(formData.get("belopp")?.toString().trim() || "0");

  const extrafältRaw = formData.get("extrafält")?.toString();
  const extrafält = extrafältRaw ? (JSON.parse(extrafältRaw) as Record<string, ExtrafältRad>) : {};

  const client = await pool.connect();
  try {
    const kontobeskrivning = valtFörval.namn || "";

    // 1. Skapa huvudtransaktion
    const insertTransactionQuery = `
      INSERT INTO transaktioner (
        transaktionsdatum, kontobeskrivning, belopp, fil, kommentar, "userId"
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    const res = await client.query(insertTransactionQuery, [
      new Date(transaktionsdatum),
      kontobeskrivning,
      belopp,
      filename,
      kommentar,
      userId,
    ]);

    const transaktionsId = res.rows[0].id;
    console.log("🆔 transaktions_id:", transaktionsId);

    // 2. Om extrafält finns: bokför endast extrafält
    if (Object.keys(extrafält).length > 0) {
      for (const [kontonummer, data] of Object.entries(extrafält)) {
        const kontoRes = await client.query("SELECT id FROM konton WHERE kontonummer::text = $1", [
          kontonummer,
        ]);

        if (kontoRes.rows.length === 0) {
          console.warn(`⛔ Konto ${kontonummer} hittades inte (extrafält)`);
          continue;
        }

        const kontoId = kontoRes.rows[0].id;
        const debet = Number(data.debet ?? 0);
        const kredit = Number(data.kredit ?? 0);

        if (debet === 0 && kredit === 0) continue;

        console.log(`➕ Extrafält ${kontonummer}: Debet ${debet}, Kredit ${kredit}`);

        await client.query(
          `INSERT INTO transaktionsposter (transaktions_id, konto_id, debet, kredit)
           VALUES ($1, $2, $3, $4)`,
          [transaktionsId, kontoId, debet, kredit]
        );
      }
    } else {
      // 3. Annars: använd valtFörval.konton
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

      for (const konto of valtFörval.konton) {
        const kontonummer = konto.kontonummer?.toString().trim();
        if (!kontonummer) continue;

        const kontoRes = await client.query("SELECT id FROM konton WHERE kontonummer::text = $1", [
          kontonummer,
        ]);

        if (kontoRes.rows.length === 0) {
          console.warn(`⛔ Konto ${kontonummer} hittades inte`);
          continue;
        }

        const kontoId = kontoRes.rows[0].id;
        const debet = konto.debet ? getBelopp(konto, "debet") : 0;
        const kredit = konto.kredit ? getBelopp(konto, "kredit") : 0;

        if (debet === 0 && kredit === 0) continue;

        console.log(`📘 Konto ${kontonummer} – Debet: ${debet}, Kredit: ${kredit}`);

        await client.query(
          `INSERT INTO transaktionsposter (transaktions_id, konto_id, debet, kredit)
           VALUES ($1, $2, $3, $4)`,
          [transaktionsId, kontoId, debet, kredit]
        );
      }
    }

    client.release();
    revalidatePath("/grundbok");

    return { success: true, id: transaktionsId };
  } catch (error) {
    client.release();
    console.error("❌ saveTransaction error:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function taBortTransaktion(id: number) {
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM transaktioner WHERE id = $1`, [id]);
  } finally {
    client.release();
  }
}

export async function loggaFavoritförval(forvalId: number) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    console.warn("⛔ Ingen användare inloggad vid loggaFavoritförval");
    return;
  }

  try {
    await pool.query(
      `
      INSERT INTO favoritförval (user_id, forval_id, antal, senaste)
      VALUES ($1, $2, 1, NOW())
      ON CONFLICT (user_id, forval_id)
      DO UPDATE SET antal = favoritförval.antal + 1, senaste = NOW()
      `,
      [userId, forvalId]
    );
    console.log(`🌟 Favoritförval uppdaterad för user ${userId}, förval ${forvalId}`);
  } catch (error) {
    console.error("❌ loggaFavoritförval error:", error);
  }
}

export async function hamtaFavoritforval(): Promise<any[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    console.warn("⛔ Ingen användare inloggad vid hamtaFavoritforval");
    return [];
  }

  try {
    const result = await pool.query(
      `
      SELECT f.*
      FROM favoritförval ff
      JOIN förval f ON ff.forval_id = f.id
      WHERE ff.user_id = $1
      ORDER BY ff.antal DESC, ff.senaste DESC
      LIMIT 10
      `,
      [userId]
    );

    console.log(`📥 Hittade ${result.rows.length} favoritförval för user ${userId}`);
    return result.rows;
  } catch (error) {
    console.error("❌ hamtaFavoritforval error:", error);
    return [];
  }
}

export async function fetchAllaForval(filters?: { sök?: string; kategori?: string; typ?: string }) {
  let query = "SELECT * FROM förval";
  const values: any[] = [];
  const conditions: string[] = [];

  if (filters?.sök) {
    conditions.push(
      `(LOWER(namn) LIKE $${values.length + 1} OR LOWER(beskrivning) LIKE $${values.length + 1})`
    );
    values.push(`%${filters.sök.toLowerCase()}%`);
  }

  if (filters?.kategori) {
    conditions.push(`kategori = $${values.length + 1}`);
    values.push(filters.kategori);
  }

  if (filters?.typ) {
    conditions.push(`LOWER(typ) = $${values.length + 1}`);
    values.push(filters.typ.toLowerCase());
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += ` ORDER BY namn`;

  const res = await pool.query(query, values);
  return res.rows;
}

export async function fetchFavoritforval() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = parseInt(session.user.id);

  const query = `
    SELECT f.*
    FROM favoritförval ff
    JOIN förval f ON ff.forval_id = f.id
    WHERE ff.user_id = $1
    ORDER BY ff.antal DESC
    LIMIT 5
  `;

  const client = await pool.connect();
  try {
    const res = await client.query(query, [userId]);
    return res.rows;
  } finally {
    client.release();
  }
}
