import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  const data = await request.formData();

  const transaktionsdatum = data.get("transaktionsdatum")?.toString() || "";
  const kommentar = data.get("kommentar")?.toString() || "";
  const kontonummer = data.get("kontonummer")?.toString() || "";
  const kontobeskrivning = data.get("kontobeskrivning")?.toString() || "";
  const kontotyp = data.get("kontotyp")?.toString() || "";
  const belopp = parseFloat(data.get("belopp")?.toString() || "0");
  const moms = parseFloat(data.get("moms")?.toString() || "0");
  const beloppUtanMoms = parseFloat(data.get("beloppUtanMoms")?.toString() || "0");
  const fil = data.get("fil") as File | null;
  const filename = fil ? fil.name : "";

  try {
    await sql`BEGIN;`;

    const result = await sql`
      INSERT INTO transaktioner (transaktionsdatum, kontobeskrivning, kontotyp, belopp, fil, kommentar)
      VALUES (${transaktionsdatum}, ${kontobeskrivning}, ${kontotyp}, ${belopp}, ${filename}, ${kommentar})
      RETURNING transaktions_id;
    `;

    const transaktionsId = result[0].transaktions_id;

    const kontoResult = await sql`
      SELECT konto_id FROM konton WHERE kontonummer = ${kontonummer};
    `;
    const kontoId = kontoResult[0].konto_id;

    if (kontotyp === "Kostnad") {
      await transPost(transaktionsId, 5, 0, belopp);
      await transPost(transaktionsId, 4, moms, 0);
      await transPost(transaktionsId, kontoId, beloppUtanMoms, 0);
    } else if (kontotyp === "Intäkt") {
      await transPost(transaktionsId, 5, belopp, 0);
      await transPost(transaktionsId, 4, 0, moms);
      await transPost(transaktionsId, kontoId, 0, beloppUtanMoms);
    }

    await sql`COMMIT;`;
    return NextResponse.json({ message: "Data saved successfully" });
  } catch (error) {
    console.error("❌ POST error:", error);
    await sql`ROLLBACK;`;
    return NextResponse.json({ message: "Failed", error }, { status: 500 });
  }
}

async function transPost(transaktionsId: number, kontoId: number, debet: number, kredit: number) {
  await sql`
    INSERT INTO transaktionsposter (transaktions_id, konto_id, debet, kredit)
    VALUES (${transaktionsId}, ${kontoId}, ${debet}, ${kredit});
  `;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ message: "Missing search" }, { status: 400 });

  try {
    const result = await sql`
      SELECT * FROM konton WHERE sökord ILIKE ${`%${q}%`}
    `;
    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("❌ GET error:", error);
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}
