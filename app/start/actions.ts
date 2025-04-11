"use server";

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function fetchAllaForval() {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT * FROM förval ORDER BY namn");
    client.release();

    return res.rows.map((rad) => ({
      ...rad,
      konton: typeof rad.konton === "string" ? JSON.parse(rad.konton) : rad.konton,
    }));
  } catch (err) {
    console.error("❌ fetchAllaForval error:", err);
    return [];
  }
}

export async function fetchDataFromYear(year: string) {
  const start = new Date(`${year}-01-01`);
  const end = new Date(`${+year + 1}-01-01`);

  try {
    const client = await pool.connect();

    const query = `
      SELECT 
        t.transaktionsdatum, 
        t.kontotyp, 
        tp.debet, 
        tp.kredit 
      FROM transaktioner t
      JOIN transaktionsposter tp ON t.transaktions_id = tp.transaktions_id
      WHERE t.transaktionsdatum >= $1 AND t.transaktionsdatum < $2
      ORDER BY t.transaktionsdatum ASC
    `;
    const result = await client.query(query, [start, end]);
    client.release();

    const rows = result.rows;

    const grouped: { [month: string]: { inkomst: number; utgift: number } } = {};
    let totalInkomst = 0;
    let totalUtgift = 0;

    rows.forEach((row, i) => {
      const rawDate = row.transaktionsdatum;
      const typ = row.kontotyp;

      if (!rawDate || !typ) {
        console.warn(`⚠️ Skipping row ${i + 1} - saknar datum eller kontotyp`);
        return;
      }

      const date = new Date(rawDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;

      const debet = Number(row.debet ?? 0);
      const kredit = Number(row.kredit ?? 0);

      if (!grouped[key]) grouped[key] = { inkomst: 0, utgift: 0 };

      if (typ === "Intäkt") {
        grouped[key].inkomst += kredit;
        totalInkomst += kredit;
      }

      if (typ === "Utgift") {
        grouped[key].utgift += debet;
        totalUtgift += debet;
      }
    });

    const yearData = Object.entries(grouped).map(([month, values]) => ({
      month,
      inkomst: values.inkomst,
      utgift: values.utgift,
    }));

    return {
      totalInkomst: +totalInkomst.toFixed(2),
      totalUtgift: +totalUtgift.toFixed(2),
      totalResultat: +(totalInkomst - totalUtgift).toFixed(2),
      yearData,
    };
  } catch (err) {
    console.error("❌ fetchDataFromYear error:", err);
    return {
      totalInkomst: 0,
      totalUtgift: 0,
      totalResultat: 0,
      yearData: [],
    };
  }
}

export async function hämtaAllaTransaktioner() {
  try {
    const client = await pool.connect();
    const res = await client.query(`
      SELECT 
        transaktions_id,
        transaktionsdatum,
        kontobeskrivning,
        kontotyp,
        belopp,
        fil,
        kommentar,
        "userId"
      FROM transaktioner
      ORDER BY transaktions_id DESC
    `);
    client.release();

    console.log("Transaktioner:", res.rows);

    return res.rows;
  } catch (err) {
    console.error("❌ hämtaAllaTransaktioner error:", err);
    return [];
  }
}

export async function getAllInvoices() {
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM fakturor ORDER BY skapad ASC`);
    return res.rows;
  } finally {
    client.release();
  }
}

export async function deleteInvoice(id: number) {
  const client = await pool.connect();
  try {
    await client.query(`DELETE FROM fakturor WHERE id = $1`, [id]);
  } finally {
    client.release();
  }
}

export async function updateFakturanummer(id: number, nyttNummer: string) {
  const client = await pool.connect();
  try {
    await client.query(`UPDATE fakturor SET fakturanummer = $1 WHERE id = $2`, [nyttNummer, id]);
  } finally {
    client.release();
  }
}

export async function saveInvoice(data: any) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO fakturor (fakturanummer, kundnamn, total, skapad) VALUES ($1, $2, $3, NOW())`,
      [data.fakturanummer, data.kundnamn, data.total]
    );
  } finally {
    client.release();
  }
}
