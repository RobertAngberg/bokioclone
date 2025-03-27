import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await sql`SELECT NOW();`;
    console.log("✅ Connected to DB:", result.rows[0]);
    return NextResponse.json({ status: "ok", now: result.rows[0] });
  } catch (err: unknown) {
    console.error("❌ DB connection failed:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        status: "error",
        message: errorMessage,
        details: err,
      },
      { status: 500 }
    );
  }
}
