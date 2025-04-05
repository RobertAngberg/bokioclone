"use server";

import { Pool } from "pg";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Funktion för att spara transaktion
export async function saveTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Ingen användare inloggad");
  }
  const userId = parseInt(session.user.id);

  const transaktionsdatum = formData.get("transaktionsdatum")?.toString().trim() || "";
  const kommentar = formData.get("kommentar")?.toString().trim() || "";
  const kontonummer = formData.get("kontonummer")?.toString().trim() || "";
  const kontobeskrivning = formData.get("kontobeskrivning")?.toString().trim() || "";
  const belopp = parseFloat(formData.get("belopp")?.toString().trim() || "0");
  const moms = parseFloat(formData.get("moms")?.toString().trim() || "0");
  const beloppUtanMoms = parseFloat(formData.get("beloppUtanMoms")?.toString().trim() || "0");
  const fil = formData.get("fil") as File | null;
  const filename = fil ? fil.name : "";

  try {
    const client = await pool.connect();
    const kontoRes = await client.query("SELECT * FROM konton WHERE kontonummer = $1", [
      kontonummer,
    ]);
    const företagskontoRes = await client.query("SELECT * FROM konton WHERE kontonummer = $1", [
      "1930",
    ]);
    const momsKontoRes = await client.query("SELECT * FROM konton WHERE kontonummer = $1", [
      "2640",
    ]);
    const utgåendeMomsKontoRes = await client.query("SELECT * FROM konton WHERE kontonummer = $1", [
      "2610",
    ]);

    if (kontoRes.rows.length === 0) throw new Error("⛔ Konto not found");
    if (
      företagskontoRes.rows.length === 0 ||
      momsKontoRes.rows.length === 0 ||
      utgåendeMomsKontoRes.rows.length === 0
    ) {
      throw new Error("⛔ Required standard accounts not found");
    }

    const kontotyp = kontoRes.rows[0].kontotyp;

    const transaktionsposter =
      kontotyp === "Utgift"
        ? [
            { konto_id: företagskontoRes.rows[0].konto_id, debet: 0, kredit: belopp },
            { konto_id: momsKontoRes.rows[0].konto_id, debet: moms, kredit: 0 },
            { konto_id: kontoRes.rows[0].konto_id, debet: beloppUtanMoms, kredit: 0 },
          ]
        : [
            { konto_id: företagskontoRes.rows[0].konto_id, debet: belopp, kredit: 0 },
            { konto_id: utgåendeMomsKontoRes.rows[0].konto_id, debet: 0, kredit: moms },
            { konto_id: kontoRes.rows[0].konto_id, debet: 0, kredit: beloppUtanMoms },
          ];

    const insertTransactionQuery = `
INSERT INTO transaktioner (
  transaktionsdatum, kontobeskrivning, kontotyp, belopp, fil, kommentar, "userId"
) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING transaktions_id
    `;
    const res = await client.query(insertTransactionQuery, [
      new Date(transaktionsdatum),
      kontobeskrivning,
      kontotyp,
      belopp,
      filename,
      kommentar,
      userId,
    ]);
    const transaktionsId = res.rows[0].transaktions_id;

    for (let post of transaktionsposter) {
      await client.query(
        "INSERT INTO transaktionsposter (transaktions_id, konto_id, debet, kredit) VALUES ($1, $2, $3, $4)",
        [transaktionsId, post.konto_id, post.debet, post.kredit]
      );
    }

    client.release();

    revalidatePath("/grundbok");
    return {
      success: true,
      id: transaktionsId,
    };
  } catch (error) {
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
