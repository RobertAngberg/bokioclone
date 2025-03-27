import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  console.log("🔍 Received query param q:", q);

  try {
    const query = `SELECT * FROM konton WHERE sökord ILIKE '%${q}%'`;
    console.log("📦 Running SQL query:", query);

    const rows = await sql`SELECT * FROM konton WHERE sökord ILIKE ${"%" + q + "%"}`;
    console.log("✅ Query result:", rows);

    return new NextResponse(JSON.stringify(rows), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (err: any) {
    console.error("❌ grundbok API failed:", err);
    return new NextResponse(JSON.stringify({ error: err.message ?? "Server error" }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
