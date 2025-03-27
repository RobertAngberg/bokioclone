import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  const body = await request.json();
  const comment = body.comment;

  try {
    await sql`INSERT INTO comments (comment) VALUES (${comment})`;
    return NextResponse.json({ message: "Comment saved!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to save comment" }, { status: 500 });
  }
}
