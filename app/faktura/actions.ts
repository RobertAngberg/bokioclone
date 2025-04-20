"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function getAllInvoices() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, invoices: [] };
  const userId = parseInt(session.user.id);

  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM fakturor WHERE "userId" = $1 ORDER BY id DESC`, [
      userId,
    ]);
    const fakturor = res.rows;

    for (const faktura of fakturor) {
      const artiklarRes = await client.query(`SELECT * FROM fakturarader WHERE "fakturaId" = $1`, [
        faktura.id,
      ]);
      faktura.artiklar = artiklarRes.rows;
    }

    return { success: true, invoices: fakturor };
  } catch (error: any) {
    console.error("❌ Error fetching invoices:", error.message);
    return { success: false, invoices: [] };
  } finally {
    client.release();
  }
}

export async function saveInvoice(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  const userId = parseInt(session.user.id);
  const client = await pool.connect();

  try {
    const artiklar = JSON.parse((formData.get("artiklar") as string) || "[]");

    const fakturadatum = formData.get("fakturadatum")?.toString();
    const forfallodatum = formData.get("forfallodatum")?.toString();

    const insertFaktura = await client.query(
      `
      INSERT INTO fakturor (
        "userId", fakturanummer, fakturadatum, forfallodatum,
        betalningsmetod, betalningsvillkor, drojsmalsranta,
        leverans, kommentar, "kundId", nummer, momsvisning
      ) VALUES (
        $1, $2, $3::timestamp, $4::timestamp,
        $5, $6, $7,
        $8, $9, $10, $11, $12
      )
      RETURNING id
    `,
      [
        userId,
        formData.get("fakturanummer"),
        fakturadatum,
        forfallodatum,
        formData.get("betalningsmetod"),
        formData.get("betalningsvillkor"),
        formData.get("drojsmalsranta"),
        formData.get("leverans"),
        formData.get("kommentar"),
        formData.get("kundId") ? parseInt(formData.get("kundId")!.toString()) : null,
        formData.get("nummer"),
        formData.get("momsvisning"),
      ]
    );

    const fakturaId = insertFaktura.rows[0].id;

    for (const rad of artiklar) {
      await client.query(
        `
        INSERT INTO fakturarader (
          "fakturaId", beskrivning, antal, "prisPerEnhet", moms, valuta, typ
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
        [
          fakturaId,
          rad.beskrivning,
          rad.antal.toString(),
          rad.prisPerEnhet.toString(),
          rad.moms.toString(),
          rad.valuta,
          rad.typ,
        ]
      );
    }

    return { success: true, id: fakturaId };
  } catch (err) {
    console.error("❌ saveInvoice error:", err);
    return { success: false };
  } finally {
    client.release();
  }
}

export async function deleteInvoice(fakturaId: number) {
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM fakturarader WHERE "fakturaId" = $1`, [fakturaId]);
    await client.query(`DELETE FROM fakturor WHERE id = $1`, [fakturaId]);
    return { success: true };
  } catch (error) {
    console.error("❌ deleteInvoice error:", error);
    return { success: false, error };
  } finally {
    client.release();
  }
}

export async function updateFakturanummer(id: number, nyttNummer: string) {
  const client = await pool.connect();
  try {
    await client.query(`UPDATE fakturor SET fakturanummer = $1 WHERE id = $2`, [nyttNummer, id]);
    return { success: true };
  } catch (error) {
    console.error("❌ updateFakturanummer error:", error);
    return { success: false, error };
  } finally {
    client.release();
  }
}

export async function sparaNyKund(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };
  const userId = parseInt(session.user.id);

  const f = (key: string) => formData.get(key)?.toString() ?? "";

  const client = await pool.connect();
  try {
    await client.query(
      `
      INSERT INTO kunder (
        "userId", kundtyp, kundnamn, kundorgnummer, kundnummer, kundmomsnummer,
        kundadress1, kundadress2, kundpostnummer, kundstad, kundemail
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `,
      [
        userId,
        f("kundtyp"),
        f("kundnamn"),
        f("kundorgnummer"),
        f("kundnummer"),
        f("kundmomsnummer"),
        f("kundadress1"),
        f("kundadress2"),
        f("kundpostnummer"),
        f("kundstad"),
        f("kundemail"),
      ]
    );

    return { success: true };
  } catch (err) {
    console.error("❌ Kunde inte spara kund:", err);
    return { success: false };
  } finally {
    client.release();
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
      `
      SELECT
        f.id,
        f.fakturanummer,
        f.fakturadatum,
        f."kundId",
        k.kundnamn
      FROM fakturor f
      LEFT JOIN kunder k ON f."kundId" = k.id
      WHERE f."userId" = $1
      ORDER BY f.id DESC
      `,
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

export async function hämtaFakturaMedRader(id: number) {
  const client = await pool.connect();

  try {
    const fakturaRes = await client.query(
      `
      SELECT
        f.id,
        f."userId",
        f.fakturanummer,
        f.fakturadatum,
        f.forfallodatum,
        f.betalningsmetod,
        f.betalningsvillkor,
        f.drojsmalsranta,
        f.leverans,
        f.kommentar,
        f."kundId",
        f.nummer,
        f.momsvisning,
        f."createdAt",

        -- Kunduppgifter
        k.kundtyp,
        k.kundnamn,
        k.kundnummer,
        k.kundorgnummer AS "kundorganisationsnummer",
        k.kundmomsnummer AS "kundvatnummer",
        k.kundadress1 AS "kundadress",
        k.kundadress2,
        k.kundpostnummer,
        k.kundstad,
        k.kundemail

      FROM fakturor f
      LEFT JOIN kunder k ON f."kundId" = k.id
      WHERE f.id = $1
      `,
      [id]
    );

    if (fakturaRes.rows.length === 0) return null;

    const faktura = fakturaRes.rows[0];

    const raderRes = await client.query(
      `
      SELECT *
      FROM fakturarader
      WHERE "fakturaId" = $1
      `,
      [id]
    );

    const artiklar = raderRes.rows.map((rad) => ({
      beskrivning: rad.beskrivning,
      antal: parseFloat(rad.antal),
      prisPerEnhet: parseFloat(rad.prisPerEnhet),
      moms: parseFloat(rad.moms),
      valuta: rad.valuta,
      typ: rad.typ === "tjänst" ? "tjänst" : "vara",
    }));

    return {
      faktura: {
        ...faktura,
        fakturadatum: faktura.fakturadatum?.toISOString().slice(0, 10),
        forfallodatum: faktura.forfallodatum?.toISOString().slice(0, 10),
      },
      artiklar,
    };
  } catch (error) {
    console.error("❌ hämtaFakturaMedRader error:", error);
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
