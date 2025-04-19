"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function getAllInvoices() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, invoices: [] };
  const userId = parseInt(session.user.id);

  try {
    const client = await pool.connect();
    const res = await client.query(`SELECT * FROM fakturor WHERE "userId" = $1 ORDER BY id DESC`, [
      userId,
    ]);
    const fakturor = res.rows;

    for (const faktura of fakturor) {
      const artiklarRes = await client.query(`SELECT * FROM fakturarad WHERE "fakturaId" = $1`, [
        faktura.id,
      ]);
      faktura.artiklar = artiklarRes.rows;
    }

    client.release();
    return { success: true, invoices: fakturor };
  } catch (error: any) {
    console.error("❌ Error fetching invoices:", error.message);
    return { success: false, invoices: [] };
  }
}

export async function saveInvoice(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Ingen inloggad användare");
  const userId = parseInt(session.user.id);

  const fakturaId = formData.get("id")?.toString();
  const artiklar = JSON.parse(formData.get("artiklar")?.toString() || "[]");

  const f = (key: string) => formData.get(key)?.toString() || null;
  const d = (key: string) => new Date(formData.get(key)?.toString() || new Date());

  const fakturaData = [
    userId,
    f("fakturanummer"),
    d("fakturadatum"),
    d("forfallodatum"),
    f("betalningsmetod"),
    f("betalningsvillkor"),
    f("drojsmalsranta"),
    f("leverans"),
    f("kommentar"),
    f("kundId") ? parseInt(f("kundId")!) : null,
    f("nummer"),
    f("momsvisning"),
  ];

  try {
    const client = await pool.connect();
    let faktura;

    if (fakturaId) {
      await client.query(`DELETE FROM fakturarader WHERE "fakturaId" = $1`, [fakturaId]);
      await client.query(
        `UPDATE fakturor SET
          "userId" = $1, fakturanummer = $2, fakturadatum = $3, forfallodatum = $4,
          betalningsmetod = $5, betalningsvillkor = $6, drojsmalsranta = $7,
          leverans = $8, kommentar = $9, "kundId" = $10, nummer = $11, momsvisning = $12
         WHERE id = $13`,
        [...fakturaData, fakturaId]
      );
      faktura = { id: fakturaId };
      console.log("✅ Uppdaterade faktura med ID:", fakturaId);
    } else {
      const res = await client.query(
        `INSERT INTO fakturor (
          "userId", fakturanummer, fakturadatum, forfallodatum,
          betalningsmetod, betalningsvillkor, drojsmalsranta,
          leverans, kommentar, "kundId", nummer, momsvisning
        ) VALUES (${Array.from({ length: 12 }, (_, i) => `$${i + 1}`).join(", ")})
        RETURNING id`,
        fakturaData
      );
      faktura = res.rows[0];
      console.log("✅ Skapade ny faktura med ID:", faktura.id);
    }

    // Spara rader
    for (const rad of artiklar) {
      await client.query(
        `INSERT INTO fakturarader ("fakturaId", beskrivning, antal, "prisPerEnhet", moms, valuta, typ)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [faktura.id, rad.beskrivning, rad.antal, rad.prisPerEnhet, rad.moms, rad.valuta, rad.typ]
      );
    }

    console.log("📦 Faktura sparad med data:", fakturaData);
    client.release();
    revalidatePath("/fakturor");
    return { success: true, id: faktura.id };
  } catch (error) {
    console.error("❌ Error vid sparande av faktura:", error);
    return { success: false, error };
  }
}

export async function deleteInvoice(fakturaId: number) {
  try {
    const client = await pool.connect();
    await client.query(`DELETE FROM fakturarader WHERE fakturaId = $1`, [fakturaId]);
    await client.query(`DELETE FROM fakturor WHERE id = $1`, [fakturaId]);
    client.release();
    return { success: true };
  } catch (error) {
    console.error("❌ deleteInvoice error:", error);
    return { success: false, error };
  }
}

export async function updateFakturanummer(id: number, nyttNummer: string) {
  try {
    const client = await pool.connect();
    await client.query(`UPDATE fakturor SET fakturanummer = $1 WHERE id = $2`, [nyttNummer, id]);
    client.release();
    return { success: true };
  } catch (error) {
    console.error("❌ updateFakturanummer error:", error);
    return { success: false, error };
  }
}

export async function sparaNyKund(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };
  const userId = parseInt(session.user.id);

  const f = (key: string) => formData.get(key)?.toString() ?? "";

  try {
    const client = await pool.connect();
    await client.query(
      `
      INSERT INTO kunder (
        "userId", kundtyp, kundnamn, kundnummer, kundorgnummer, kundmomsnummer,
        kundadress1, kundadress2, kundpostnummer, kundstad
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        userId,
        f("kundtyp"),
        f("kundnamn"),
        f("kundnummer"),
        f("kundorgnummer"),
        f("kundmomsnummer"),
        f("kundadress1"),
        f("kundadress2"),
        f("kundpostnummer"),
        f("kundstad"),
      ]
    );

    client.release();
    return { success: true };
  } catch (error) {
    console.error("❌ Kunde inte spara kund:", error);
    return { success: false, error };
  }
}

export async function hämtaSparadeKunder() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = parseInt(session.user.id);
  const client = await pool.connect();

  try {
    const res = await client.query(`SELECT * FROM kunder WHERE "userId" = $1 ORDER BY id DESC`, [
      userId,
    ]);
    return res.rows;
  } catch (error) {
    console.error("❌ Fel vid hämtning av kunder:", error);
    return [];
  } finally {
    client.release();
  }
}

export async function hämtaSparadeFakturor() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = parseInt(session.user.id);
  const client = await pool.connect();

  try {
    const res = await client.query(
      `SELECT id, fakturanummer, fakturadatum, "kundId" FROM fakturor WHERE "userId" = $1 ORDER BY id DESC`,
      [userId]
    );

    return res.rows;
  } catch (error) {
    console.error("❌ Fel vid hämtning av fakturor:", error);
    return [];
  } finally {
    client.release();
  }
}

export async function hämtaFakturaMedRader(fakturaId: number) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const client = await pool.connect();
  try {
    const fakturaRes = await client.query(
      `SELECT * FROM fakturor WHERE id = $1 AND "userId" = $2`,
      [fakturaId, parseInt(session.user.id)]
    );

    const raderRes = await client.query(
      `SELECT * FROM fakturarader WHERE "fakturaId" = $1 ORDER BY id ASC`,
      [fakturaId]
    );

    const faktura = fakturaRes.rows[0];
    const artiklar = raderRes.rows;

    return {
      faktura,
      artiklar,
    };
  } catch (err) {
    console.error("❌ Kunde inte hämta faktura:", err);
    return null;
  } finally {
    client.release();
  }
}

export async function getKundById(kundId: number) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM kunder WHERE id = $1 AND "userId" = $2`, [
      kundId,
      parseInt(session.user.id),
    ]);
    return res.rows[0] ?? null;
  } catch (err) {
    console.error("❌ Kunde inte hämta kund:", err);
    return null;
  } finally {
    client.release();
  }
}
