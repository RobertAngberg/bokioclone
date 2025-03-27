import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q) return NextResponse.json({ message: "Missing year" }, { status: 400 });

  try {
    const yearData = await sql`
      SELECT * FROM transaktioner
      WHERE EXTRACT(YEAR FROM transaktionsdatum) = ${q}
      ORDER BY transaktionsdatum DESC;
    `;

    const inkomst = await sql`
      SELECT SUM(belopp) AS total FROM transaktioner WHERE kontotyp = 'Intäkt';
    `;
    const utgift = await sql`
      SELECT SUM(belopp) AS total FROM transaktioner WHERE kontotyp = 'Kostnad';
    `;

    const totalInkomst = parseFloat(inkomst[0]?.total || 0);
    const totalUtgift = parseFloat(utgift[0]?.total || 0);
    const totalResultat = totalInkomst - totalUtgift;

    const allRows = await sql`
      SELECT * FROM transaktioner ORDER BY transaktionsdatum DESC;
    `;

    return NextResponse.json({
      totalInkomst,
      totalUtgift,
      totalResultat,
      allRows,
      yearData,
    });
  } catch (err) {
    console.error("❌ Resultat API error:", err);
    return NextResponse.json({ message: "Error", error: err }, { status: 500 });
  }
}
