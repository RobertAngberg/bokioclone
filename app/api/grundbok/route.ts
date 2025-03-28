import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";

  try {
    if (q.startsWith("row")) {
      const transId = parseInt(q.replace("row", ""));
      const details = await sql`
        SELECT tp.*, k.kontobeskrivning
        FROM transaktionsposter tp
        INNER JOIN konton k ON tp.konto_id = k.konto_id
        WHERE tp.transaktions_id = ${transId}
        ORDER BY tp.transaktions_id DESC;
      `;
      console.log("🧾 Row fetch:", details);
      return NextResponse.json(details);
    }

    let data;
    if (q) {
      data = await sql`
        SELECT * FROM transaktioner
        WHERE EXTRACT(YEAR FROM transaktionsdatum) = ${q}
        ORDER BY transaktionsdatum DESC;
      `;
      console.log("📅 Year fetch:", data);
    } else {
      data = await sql`
        SELECT * FROM transaktioner
        ORDER BY transaktionsdatum DESC;
      `;
      console.log("📦 All fetch:", data);
    }

    return NextResponse.json({ yearData: data.rows });
  } catch (err: any) {
    console.error("❌ grundbok API failed:", err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
