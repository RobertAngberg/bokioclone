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

    // dubbelkolla exakt citat runt kolumnnamn
    const res = await client.query(`SELECT * FROM fakturor WHERE "userId" = $1 ORDER BY id DESC`, [
      userId,
    ]);
    const fakturor = res.rows;

    // hämta artiklar separat
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
    f("företagsnamn"),
    f("adress"),
    f("postnummer"),
    f("stad"),
    f("email"),
    f("logo"),
    f("organisationsnummer"),
    f("momsregistreringsnummer"),
    f("telefonnummer"),
    f("bankinfo"),
    f("webbplats"),
    f("kundnamn"),
    f("kundadress"),
    f("kundpostnummer"),
    f("kundstad"),
    f("kundemail"),
    f("kundtyp"),
    f("kundnummer"),
    f("kundmomsnummer"),
  ];

  try {
    const client = await pool.connect();
    let faktura;

    if (fakturaId) {
      await client.query(`DELETE FROM fakturarad WHERE fakturaId = $1`, [fakturaId]);
      await client.query(
        `UPDATE fakturor SET
        "userId" = $1, fakturanummer = $2, fakturadatum = $3, forfallodatum = $4,
        betalningsmetod = $5, betalningsvillkor = $6, drojsmalsranta = $7, leverans = $8, kommentar = $9,
        företagsnamn = $10, adress = $11, postnummer = $12, stad = $13, email = $14, logo = $15,
        organisationsnummer = $16, momsregistreringsnummer = $17, telefonnummer = $18, bankinfo = $19, webbplats = $20,
        kundnamn = $21, kundadress = $22, kundpostnummer = $23, kundstad = $24, kundemail = $25, kundtyp = $26,
        kundnummer = $27, kundmomsnummer = $28
        WHERE id = $29`,
        [...fakturaData, fakturaId]
      );
      faktura = { id: fakturaId };
    } else {
      const res = await client.query(
        `INSERT INTO fakturor (
          "userId", fakturanummer, fakturadatum, forfallodatum,
          betalningsmetod, betalningsvillkor, drojsmalsranta, leverans, kommentar,
          företagsnamn, adress, postnummer, stad, email, logo,
          organisationsnummer, momsregistreringsnummer, telefonnummer, bankinfo, webbplats,
          kundnamn, kundadress, kundpostnummer, kundstad, kundemail, kundtyp,
          kundnummer, kundmomsnummer
        ) VALUES (${Array.from({ length: 28 }, (_, i) => `$${i + 1}`).join(", ")}) RETURNING id`,
        fakturaData
      );
      faktura = res.rows[0];
    }

    for (const rad of artiklar) {
      await client.query(
        `INSERT INTO fakturarad (fakturaId, beskrivning, antal, prisPerEnhet, moms, valuta, typ)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [faktura.id, rad.beskrivning, rad.antal, rad.prisPerEnhet, rad.moms, rad.valuta, rad.typ]
      );
    }

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
    await client.query(`DELETE FROM fakturarad WHERE fakturaId = $1`, [fakturaId]);
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
