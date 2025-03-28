import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  console.log("👋 Hello from grundbok API");

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
      return NextResponse.json(details); // ✅ just return it directly
    }

    const data = q
      ? await sql`
          SELECT * FROM transaktioner
          WHERE EXTRACT(YEAR FROM transaktionsdatum) = ${q}
          ORDER BY transaktionsdatum DESC;
        `
      : await sql`
          SELECT * FROM transaktioner
          ORDER BY transaktionsdatum DESC;
        `;

    console.log("📦 Fetch:", data);
    return NextResponse.json({ yearData: data }); // ✅ no .rows here either
  } catch (err: any) {
    console.error("❌ grundbok API failed:", err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
