"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Hämta alla fakturor + rader
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
      const r = await client.query(`SELECT * FROM fakturarader WHERE "fakturaId" = $1`, [f.id]);
      f.artiklar = r.rows;
    }
    return { success: true, invoices: fakturor };
  } catch (err) {
    console.error("❌ getAllInvoices error:", err);
    return { success: false, invoices: [] };
  } finally {
    client.release();
  }
}

// Spara faktura + artiklar
export async function saveInvoice(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  const userId = parseInt(session.user.id);
  const client = await pool.connect();

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  try {
    const artiklarRaw = formData.get("artiklar") as string;
    const artiklar = JSON.parse(artiklarRaw || "[]") as Array<{
      beskrivning: string;
      antal: number;
      prisPerEnhet: number;
      moms: number;
      valuta: string;
      typ: "vara" | "tjänst";
    }>;

    console.log("📦 Artiklar (parsade):", artiklar);

    const fakturadatum = formatDate(formData.get("fakturadatum")?.toString() ?? null);
    const forfallodatum = formatDate(formData.get("forfallodatum")?.toString() ?? null);

    // Kolla om det är en uppdatering (formData innehåller id)
    const fakturaIdRaw = formData.get("id");
    const isUpdate = !!fakturaIdRaw;
    const fakturaId = isUpdate ? parseInt(fakturaIdRaw!.toString(), 10) : undefined;

    if (isUpdate && fakturaId) {
      await client.query(`DELETE FROM fakturarader WHERE "fakturaId" = $1`, [fakturaId]);

      await client.query(
        `
        UPDATE fakturor SET
          fakturanummer = $1,
          fakturadatum = $2::date,
          forfallodatum = $3::date,
          betalningsmetod = $4,
          betalningsvillkor = $5,
          drojsmalsranta = $6,
          "kundId" = $7,
          nummer = $8
        WHERE id = $9 AND "userId" = $10
        `,
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
          `
          INSERT INTO fakturarader (
            "fakturaId", beskrivning, antal, "prisPerEnhet", moms, valuta, typ
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
          [fakturaId, rad.beskrivning, rad.antal, rad.prisPerEnhet, rad.moms, rad.valuta, rad.typ]
        );
      }

      return { success: true, id: fakturaId };
    } else {
      // Skapa nytt fakturanummer om inte angett
      let fakturanummer = formData.get("fakturanummer")?.toString();
      if (!fakturanummer) {
        const latest = await client.query(
          `SELECT MAX(CAST(fakturanummer AS INTEGER)) AS max FROM fakturor WHERE "userId" = $1`,
          [userId]
        );
        const next = (latest.rows[0].max || 0) + 1;
        fakturanummer = next.toString();
      }

      const insertF = await client.query(
        `
        INSERT INTO fakturor (
          "userId", fakturanummer, fakturadatum, forfallodatum,
          betalningsmetod, betalningsvillkor, drojsmalsranta,
          "kundId", nummer
        ) VALUES (
          $1, $2, $3::date, $4::date,
          $5, $6, $7,
          $8, $9
        )
        RETURNING id
        `,
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

      const newFakturaId = insertF.rows[0].id;

      for (const rad of artiklar) {
        await client.query(
          `
          INSERT INTO fakturarader (
            "fakturaId", beskrivning, antal, "prisPerEnhet", moms, valuta, typ
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            newFakturaId,
            rad.beskrivning,
            rad.antal,
            rad.prisPerEnhet,
            rad.moms,
            rad.valuta,
            rad.typ,
          ]
        );
      }

      return { success: true, id: newFakturaId };
    }
  } catch (err) {
    console.error("❌ saveInvoice error:", err);
    return { success: false };
  } finally {
    client.release();
  }
}

// Radera faktura + dess rader
export async function deleteFaktura(id: number) {
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM fakturarader WHERE "fakturaId" = $1`, [id]);
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

// Uppdatera fakturanummer manuellt
export async function updateFakturanummer(id: number, nyttNummer: string) {
  const client = await pool.connect();
  try {
    await client.query(`UPDATE fakturor SET fakturanummer = $1 WHERE id = $2`, [nyttNummer, id]);
    return { success: true };
  } catch (err) {
    console.error("❌ updateFakturanummer error:", err);
    return { success: false };
  } finally {
    client.release();
  }
}

// Spara ny kund
export async function sparaNyKund(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };
  const userId = parseInt(session.user.id, 10);

  const f = (k: string) => formData.get(k)?.toString() ?? "";

  const client = await pool.connect();
  try {
    const res = await client.query(
      `
      INSERT INTO kunder (
        "userId", kundnamn, kundorgnummer, kundnummer, kundmomsnummer,
        kundadress1, kundpostnummer, kundstad, kundemail
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      )
      RETURNING id
      `,
      [
        userId,
        f("kundnamn"),
        f("kundorgnummer"),
        f("kundnummer"),
        f("kundmomsnummer"),
        f("kundadress1"),
        f("kundpostnummer"),
        f("kundstad"),
        f("kundemail"),
      ]
    );
    return { success: true, id: res.rows[0].id };
  } catch (err) {
    console.error("❌ sparaNyKund error:", err);
    return { success: false };
  } finally {
    client.release();
  }
}

// Uppdatera befintlig kund
export async function uppdateraKund(kundId: number, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };
  const userId = parseInt(session.user.id, 10);

  const f = (k: string) => formData.get(k)?.toString() ?? "";

  const client = await pool.connect();
  try {
    await client.query(
      `
      UPDATE kunder SET
        kundnamn      = $2,
        kundorgnummer = $3,
        kundnummer    = $4,
        kundmomsnummer= $5,
        kundadress1   = $6,
        kundpostnummer= $8,
        kundstad      = $9,
        kundemail     = $10
      WHERE id = $11 AND "userId" = $12
      `,
      [
        f("kundnamn"),
        f("kundorgnummer"),
        f("kundnummer"),
        f("kundmomsnummer"),
        f("kundadress1"),
        f("kundpostnummer"),
        f("kundstad"),
        f("kundemail"),
        kundId,
        userId,
      ]
    );
    return { success: true };
  } catch (err) {
    console.error("❌ uppdateraKund error:", err);
    return { success: false };
  } finally {
    client.release();
  }
}

// Hämta sparade kunder
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

// Hämta sparade fakturor
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

// Hämta faktura + dess rader
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

    const radRes = await client.query(`SELECT * FROM fakturarader WHERE "fakturaId" = $1`, [id]);

    const artiklar = radRes.rows.map((r) => ({
      beskrivning: r.beskrivning,
      antal: parseFloat(r.antal),
      prisPerEnhet: parseFloat(r.prisPerEnhet),
      moms: parseFloat(r.moms),
      valuta: r.valuta,
      typ: r.typ === "tjänst" ? "tjänst" : "vara",
    }));

    console.log("✅ Hämtad faktura + rader", { faktura, artiklar });

    return { faktura, artiklar };
  } catch (err) {
    console.error("❌ hämtaFakturaMedRader error:", err);
    return null;
  } finally {
    client.release();
  }
}

// Hämta en kund by id
export async function getKundById(kundId: number) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM kunder WHERE id = $1 AND "userId" = $2`, [
      kundId,
      parseInt(session.user.id, 10),
    ]);
    return res.rows[0] ?? null;
  } catch (err) {
    console.error("❌ getKundById error:", err);
    return null;
  } finally {
    client.release();
  }
}

// Hämta företagsprofil
export async function hämtaFöretagsprofil(userId: number) {
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM företagsprofil WHERE "userId" = $1`, [userId]);
    return res.rows[0] ?? null;
  } catch (err) {
    console.error("❌ hämtaFöretagsprofil error:", err);
    return null;
  } finally {
    client.release();
  }
}
