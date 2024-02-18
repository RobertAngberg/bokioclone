import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const year = params.get("q");

  let yearData = null;

  if (year) {
    const yearQuery =
      await sql`SELECT * FROM test WHERE EXTRACT(year FROM datum) = ${year} ORDER BY datum DESC;`;
    yearData = yearQuery.rows;
  }

  const dataInkomst =
    await sql`SELECT SUM(belopp) AS totalBelopp FROM test WHERE Inkomst_utgift = 'Inkomst';`;
  const totalInkomst = dataInkomst.rows[0].totalbelopp;

  const dataUtgift =
    await sql`SELECT SUM(belopp) AS totalBelopp FROM test WHERE Inkomst_utgift = 'Utgift';`;
  const totalUtgift = dataUtgift.rows[0].totalbelopp;

  const resultat = totalInkomst - totalUtgift;

  const query = await sql`SELECT * FROM test ORDER BY datum DESC;`;
  const allRows = query.rows;

  return NextResponse.json(
    { totalInkomst, totalUtgift, resultat, allRows, yearData },
    { status: 200 }
  );
}

////////////////////////////////////////////////////////////////

export async function POST(req: Request) {
  // const data = await req.json();
  const data = await req.formData();

  const file = data.get("file");
  const inkomst_utgift = data.get("radioInkomstUtgift");
  const konto1 = data.get("konto1");
  const konto2 = data.get("konto2");
  const konto3 = data.get("konto3");
  const belopp = data.get("belopp");
  const land = data.get("säljarensLand");
  const datum = data.get("datum");
  const titel = data.get("titel");
  const kommentar = data.get("kommentar");

  // Detta för att file kan vara string eller File
  if (file instanceof File) {
    const tempPath = file.name;
    const uploadsDir = path.join(process.cwd(), "public", "assets");
    const targetPath = path.join(uploadsDir, file.name);

    fs.copyFile(tempPath, targetPath, (err) => {
      if (err) {
        console.error("Error copying file:", err);
      }
    });
  }

  try {
    await sql`
        INSERT INTO test (Fil, Inkomst_utgift, konto1, konto2, konto3, 
          belopp, land, datum, titel, kommentar)
        VALUES (${file instanceof File ? (file as File).name : null}, 
        ${String(inkomst_utgift)}, 
        ${Number(konto1)}, 
        ${Number(konto2)}, 
        ${Number(konto3)}, 
        ${Number(belopp)}, 
        ${String(land)}, 
        ${datum ? String(datum) : null}, 
        ${String(titel)}, 
        ${String(kommentar)})`;
  } catch (error) {
    console.error("Error inserting data:", error);
  }

  return NextResponse.json({
    message: "Data received successfully",
  });
}
