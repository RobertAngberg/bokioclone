"use server";

import { auth } from "@/auth";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export type Artikel = {
  id?: number;
  beskrivning: string;
  antal: number;
  prisPerEnhet: number;
  moms: number;
  valuta: string;
  typ: "vara" | "tjanst";
};

export async function saveInvoice(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };
  const userId = parseInt(session.user.id);
  const client = await pool.connect();

  const formatDate = (str: string | null) => {
    if (!str) return null;
    const d = new Date(str);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
      .getDate()
      .toString()
      .padStart(2, "0")}`;
  };

  try {
    const artiklarRaw = formData.get("artiklar") as string;
    const artiklar = JSON.parse(artiklarRaw || "[]") as Artikel[];

    const fakturadatum = formatDate(formData.get("fakturadatum")?.toString() ?? null);
    const forfallodatum = formatDate(formData.get("forfallodatum")?.toString() ?? null);
    const fakturaIdRaw = formData.get("id");
    const isUpdate = !!fakturaIdRaw;
    const fakturaId = isUpdate ? parseInt(fakturaIdRaw!.toString(), 10) : undefined;

    if (isUpdate && fakturaId) {
      await client.query(`DELETE FROM fakturarader WHERE faktura_id = $1`, [fakturaId]);

      await client.query(
        `UPDATE fakturor SET
          fakturanummer = $1,
          fakturadatum = $2::date,
          forfallodatum = $3::date,
          betalningsmetod = $4,
          betalningsvillkor = $5,
          drojsmalsranta = $6,
          "kundId" = $7,
          nummer = $8
        WHERE id = $9 AND "userId" = $10`,
        [
          formData.get("fakturanummer"),
          fakturadatum,
          forfallodatum,
          formData.get("betalningsmetod"),
          formData.get("betalningsvillkor"),
          formData.get("drojsmalsranta"),
          formData.get("kundId") ? parseInt(formData.get("kundId")!.toString()) : null,
          formData.get("nummer"),
          fakturaId,
          userId,
        ]
      );

      for (const rad of artiklar) {
        await client.query(
          `INSERT INTO fakturarader (faktura_id, beskrivning, antal, pris_per_enhet, moms, valuta, typ)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [fakturaId, rad.beskrivning, rad.antal, rad.prisPerEnhet, rad.moms, rad.valuta, rad.typ]
        );
      }

      return { success: true, id: fakturaId };
    } else {
      let fakturanummer = formData.get("fakturanummer")?.toString();
      if (!fakturanummer) {
        const latest = await client.query(
          `SELECT MAX(CAST(fakturanummer AS INTEGER)) AS max FROM fakturor WHERE "userId" = $1`,
          [userId]
        );
        fakturanummer = ((latest.rows[0].max || 0) + 1).toString();
      }

      const insertF = await client.query(
        `INSERT INTO fakturor (
          "userId", fakturanummer, fakturadatum, forfallodatum,
          betalningsmetod, betalningsvillkor, drojsmalsranta,
          "kundId", nummer
        ) VALUES ($1, $2, $3::date, $4::date, $5, $6, $7, $8, $9)
        RETURNING id`,
        [
          userId,
          fakturanummer,
          fakturadatum,
          forfallodatum,
          formData.get("betalningsmetod"),
          formData.get("betalningsvillkor"),
          formData.get("drojsmalsranta"),
          formData.get("kundId") ? parseInt(formData.get("kundId")!.toString()) : null,
          formData.get("nummer"),
        ]
      );

      const newId = insertF.rows[0].id;

      for (const rad of artiklar) {
        await client.query(
          `INSERT INTO fakturarader (faktura_id, beskrivning, antal, pris_per_enhet, moms, valuta, typ)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [newId, rad.beskrivning, rad.antal, rad.prisPerEnhet, rad.moms, rad.valuta, rad.typ]
        );
      }

      return { success: true, id: newId };
    }
  } catch (err) {
    console.error("❌ saveInvoice error:", err);
    return { success: false };
  } finally {
    client.release();
  }
}

export async function sparaFavoritArtikel(artikel: Artikel) {
  try {
    const existing = await pool.query(
      `SELECT id FROM fakturarader
       WHERE faktura_id IS NULL
         AND beskrivning = $1
         AND antal = $2
         AND pris_per_enhet = $3
         AND moms = $4
         AND valuta = $5
         AND typ = $6
       LIMIT 1`,
      [
        artikel.beskrivning,
        artikel.antal.toString(),
        artikel.prisPerEnhet.toString(),
        artikel.moms.toString(),
        artikel.valuta,
        artikel.typ,
      ]
    );

    if (existing.rows.length > 0) {
      console.log("ℹ️ Artikeln finns redan som favorit, sparas inte igen.");
      return { success: true, alreadyExists: true };
    }

    await pool.query(
      `INSERT INTO fakturarader (faktura_id, beskrivning, antal, pris_per_enhet, moms, valuta, typ)
       VALUES (NULL, $1, $2, $3, $4, $5, $6)`,
      [
        artikel.beskrivning,
        artikel.antal.toString(),
        artikel.prisPerEnhet.toString(),
        artikel.moms.toString(),
        artikel.valuta,
        artikel.typ,
      ]
    );

    return { success: true };
  } catch (err) {
    console.error("❌ Kunde inte spara favoritartikel:", err);
    return { success: false };
  }
}

export async function deleteFaktura(id: number) {
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM fakturarader WHERE faktura_id = $1`, [id]);
    await client.query(`DELETE FROM fakturor WHERE id = $1`, [id]);
    return { success: true };
  } catch (err) {
    console.error("❌ deleteFaktura error:", err);
    return { success: false };
  } finally {
    client.release();
  }
}

export async function deleteKund(id: number) {
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM kunder WHERE id = $1`, [id]);
    return { success: true };
  } catch (err) {
    console.error("❌ deleteKund error:", err);
    return { success: false };
  } finally {
    client.release();
  }
}

export async function hämtaSparadeKunder() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = parseInt(session.user.id, 10);

  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM kunder WHERE "userId" = $1 ORDER BY id DESC`, [
      userId,
    ]);
    return res.rows;
  } catch (err) {
    console.error("❌ hämtaSparadeKunder error:", err);
    return [];
  } finally {
    client.release();
  }
}

export async function hämtaSparadeFakturor() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const userId = parseInt(session.user.id, 10);

  const client = await pool.connect();
  try {
    const res = await client.query(
      `
      SELECT
        f.id, f.fakturanummer, f.fakturadatum, f."kundId",
        k.kundnamn
      FROM fakturor f
      LEFT JOIN kunder k ON f."kundId" = k.id
      WHERE f."userId" = $1
      ORDER BY f.id DESC
      `,
      [userId]
    );
    return res.rows;
  } catch (err) {
    console.error("❌ hämtaSparadeFakturor error:", err);
    return [];
  } finally {
    client.release();
  }
}

export async function deleteFavoritArtikel(id: number) {
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM fakturarader WHERE id = $1 AND faktura_id IS NULL`, [id]);
    return { success: true };
  } catch (err) {
    console.error("❌ deleteFavoritArtikel error:", err);
    return { success: false };
  } finally {
    client.release();
  }
}

export async function getAllInvoices() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, invoices: [] };
  const userId = parseInt(session.user.id, 10);
  const client = await pool.connect();

  try {
    const res = await client.query(`SELECT * FROM fakturor WHERE "userId" = $1 ORDER BY id DESC`, [
      userId,
    ]);
    const fakturor = res.rows;

    for (const f of fakturor) {
      const r = await client.query(`SELECT * FROM fakturarader WHERE faktura_id = $1`, [f.id]);
      f.artiklar = r.rows.map((rad) => ({
        ...rad,
        prisPerEnhet: Number(rad.pris_per_enhet),
      }));
    }

    return { success: true, invoices: fakturor };
  } catch (err) {
    console.error("❌ getAllInvoices error:", err);
    return { success: false, invoices: [] };
  } finally {
    client.release();
  }
}

export async function hämtaFakturaMedRader(id: number) {
  const client = await pool.connect();
  try {
    const faktRes = await client.query(
      `
      SELECT
        f.id, f."userId", f.fakturanummer, f.fakturadatum, f.forfallodatum,
        f.betalningsmetod, f.betalningsvillkor, f.drojsmalsranta,
        f."kundId", f.nummer,

        k.kundnamn,
        k.kundnummer,
        k.kundorgnummer AS kundorganisationsnummer,
        k.kundmomsnummer,
        k.kundadress1 AS kundadress,
        k.kundpostnummer,
        k.kundstad,
        k.kundemail

      FROM fakturor f
      LEFT JOIN kunder k ON f."kundId" = k.id
      WHERE f.id = $1
      `,
      [id]
    );

    if (!faktRes.rows[0]) {
      console.log("❌ Ingen faktura hittades med ID:", id);
      return null;
    }

    const faktura = faktRes.rows[0];

    const radRes = await client.query(`SELECT * FROM fakturarader WHERE faktura_id = $1`, [id]);

    const artiklar = radRes.rows.map((r) => ({
      beskrivning: r.beskrivning,
      antal: Number(r.antal),
      prisPerEnhet: Number(r.pris_per_enhet),
      moms: Number(r.moms),
      valuta: r.valuta,
      typ: r.typ === "tjänst" ? "tjanst" : "vara",
    }));

    return { faktura, artiklar };
  } catch (err) {
    console.error("❌ hämtaFakturaMedRader error:", err);
    return null;
  } finally {
    client.release();
  }
}

export async function hämtaSparadeArtiklar(): Promise<Artikel[]> {
  try {
    const res = await pool.query(`
      SELECT id, beskrivning, antal, pris_per_enhet, moms, valuta, typ
      FROM fakturarader
      WHERE faktura_id IS NULL
      ORDER BY beskrivning ASC
    `);

    return res.rows.map((row) => ({
      id: row.id,
      beskrivning: row.beskrivning,
      antal: Number(row.antal),
      prisPerEnhet: Number(row.pris_per_enhet),
      moms: Number(row.moms),
      valuta: row.valuta,
      typ: row.typ,
    }));
  } catch (err) {
    console.error("❌ Kunde inte hämta sparade artiklar:", err);
    return [];
  }
}
