import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") ?? "";

    console.log("🔍 Received query param:", q);

    const result = await sql`SELECT * FROM konton WHERE sökord ILIKE ${"%" + q + "%"}`;

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error("❌ Server error in /api/grundbok:", err);

    return NextResponse.json(
      { error: err.message || "Unknown error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
