"use client";

import { useEffect, useState } from "react";
import { körSQL } from "./actions";

type TabellData = {
  namn: string;
  kolumner: { column_name: string; data_type: string }[];
  rader: any[];
};

export default function VisaAllt() {
  const [tabeller, setTabeller] = useState<TabellData[]>([]);
  const [sökterm, setSökterm] = useState("");

  useEffect(() => {
    async function hämtaAllt() {
      const { rows } = await körSQL(
        `SELECT table_name FROM information_schema.tables 
         WHERE table_schema = 'public' ORDER BY table_name;`
      );
      if (!rows) return;

      const data: TabellData[] = [];

      for (const row of rows) {
        const namn = row.table_name;
        const kolumnerRes = await körSQL(
          `SELECT column_name, data_type 
           FROM information_schema.columns 
           WHERE table_name = '${namn}';`
        );
        const raderRes = await körSQL(`SELECT * FROM "${namn}" LIMIT 100;`);

        data.push({
          namn,
          kolumner: kolumnerRes.rows ?? [],
          rader: raderRes.rows ?? [],
        });
      }

      setTabeller(data);
    }

    hämtaAllt();
  }, []);

  const formatDatum = (v: any) => {
    if (!v) return "";
    try {
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    } catch {}
    return String(v);
  };

  const filtreradeTabeller = tabeller.filter((t) =>
    t.namn.toLowerCase().includes(sökterm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-white">
      <div>
        <input
          type="text"
          placeholder="🔍 Sök tabell..."
          value={sökterm}
          onChange={(e) => setSökterm(e.target.value)}
          className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-600 placeholder:text-slate-400"
        />
      </div>

      {filtreradeTabeller.map((tabell) => (
        <details key={tabell.namn} className="border border-slate-600 rounded">
          <summary className="bg-slate-900 px-4 py-3 font-semibold flex justify-between items-center cursor-pointer hover:bg-slate-800">
            📄 {tabell.namn} <span className="text-white">▼</span>
          </summary>
          <div className="p-4 bg-slate-800 space-y-4 overflow-auto">
            {/* Förhandsgranskning */}
            <div className="text-sm text-cyan-300 pt-2">Förhandsgranskning (max 100 rader):</div>
            <table className="text-sm w-full table-auto border-collapse">
              <thead>
                <tr className="bg-slate-700 text-xs">
                  {tabell.kolumner.map((col) => (
                    <th key={col.column_name} className="p-2 text-left">
                      {col.column_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tabell.rader.map((rad, i) => (
                  <tr key={i} className="even:bg-slate-700 odd:bg-slate-800">
                    {tabell.kolumner.map((col) => (
                      <td key={col.column_name} className="p-2 break-all border-t border-slate-600">
                        {col.data_type.includes("date") || col.data_type.includes("time")
                          ? formatDatum(rad[col.column_name])
                          : String(rad[col.column_name] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Kolumner */}
            <div className="text-sm text-cyan-300 pt-6">Kolumner:</div>
            <table className="text-sm w-full table-auto border-collapse">
              <thead>
                <tr className="bg-slate-700 text-left text-xs">
                  <th className="p-2">Kolumn</th>
                  <th className="p-2">Typ</th>
                </tr>
              </thead>
              <tbody>
                {tabell.kolumner.map((col) => (
                  <tr key={col.column_name}>
                    <td className="p-2 border-t border-slate-600">{col.column_name}</td>
                    <td className="p-2 border-t border-slate-600">{col.data_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ))}

      {filtreradeTabeller.length === 0 && (
        <p className="text-center text-slate-400 italic pt-10">Inga matchande tabeller.</p>
      )}
    </div>
  );
}
