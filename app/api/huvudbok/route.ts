import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const rows = await sql`
      SELECT
        k.konto_id,
        k.kontonummer,
        k.kontobeskrivning,
        t.transaktions_id,
        t.transaktionsdatum,
        t.kontobeskrivning AS trans_kontobeskrivning,
        t.belopp,
        t.fil,
        t.kommentar,
        tp.transaktionspost_id,
        tp.debet,
        tp.kredit
      FROM konton k
      JOIN transaktionsposter tp ON k.konto_id = tp.konto_id
      JOIN transaktioner t ON tp.transaktions_id = t.transaktions_id
      ORDER BY k.konto_id, t.transaktionsdatum;
    `;
    return NextResponse.json(rows);
  } catch (err) {
    console.error("❌ Huvudbok API error:", err);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}
