import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams.get("q");

  try {
    // If row selected (like "row123")
    if (params && params.includes("row")) {
      const match = params.match(/row(\d+)/);
      if (match && match[1]) {
        const transaktionsId = parseInt(match[1], 10);

        const postDataQuery = await sql`
          SELECT tp.*, k.kontobeskrivning
          FROM transaktionsposter tp
          INNER JOIN konton k ON tp.konto_id = k.konto_id
          WHERE tp.transaktions_id = ${transaktionsId}
          ORDER BY tp.transaktions_id DESC;
        `;

        return NextResponse.json(postDataQuery);
      }
    }

    // If year selected (like "?q=2024")
    if (params && !params.includes("row")) {
      const yearQuery = await sql`
        SELECT * FROM transaktioner
        WHERE EXTRACT(YEAR FROM transaktionsdatum) = ${params}
        ORDER BY transaktionsdatum DESC;
      `;
      return NextResponse.json({ yearData: yearQuery });
    }

    // Default: all rows
    const allDataQuery = await sql`
      SELECT * FROM transaktioner
      ORDER BY transaktionsdatum DESC;
    `;

    return NextResponse.json({ yearData: allDataQuery });
  } catch (error: any) {
    console.error("❌ API error /api/grundbok:", error);
    return NextResponse.json({ error: error.message || "Unexpected error" }, { status: 500 });
  }
}
