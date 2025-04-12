"use client";

import { useEffect, useState } from "react";
import { hämtaFörvalMedSökning, räknaFörval, taBortFörval } from "./start/actions";

type KontoRad = {
  kontonummer: string;
  beskrivning: string;
  debet?: boolean;
  kredit?: boolean;
};

type Förval = {
  id: number;
  namn: string;
  beskrivning: string;
  typ: string;
  kategori: string;
  konton: KontoRad[];
  sökord: string[];
  momssats: number | null;
  specialtyp: string | null;
};

export default function ForvalDatabas() {
  const [data, setData] = useState<Förval[]>([]);
  const [sida, setSida] = useState(1);
  const [sök, setSök] = useState("");
  const [total, setTotal] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const perPage = 200;

  useEffect(() => {
    const fetch = async () => {
      const resultat = await hämtaFörvalMedSökning(sök, (sida - 1) * perPage, perPage);
      const antal = await räknaFörval(sök);
      setData(resultat);
      setTotal(antal);
    };
    fetch();
  }, [sida, sök]);

  const totalPages = Math.ceil(total / perPage);

  const handleDelete = async (id: number) => {
    const confirm = window.confirm("Ta bort denna förval?");
    if (!confirm) return;
    await taBortFörval(id);
    setData((prev) => prev.filter((rad) => rad.id !== id));
  };

  const toggleExpand = (id: number) => {
    setExpandedRows((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  return (
    <main className="min-h-screen px-6 py-10 text-white bg-slate-900">
      <h1 className="mb-6 text-3xl font-bold text-center">Förval-databas</h1>

      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="🔍 Sök förval..."
          value={sök}
          onChange={(e) => {
            setSök(e.target.value);
            setSida(1);
          }}
          className="w-[400px] px-4 py-2 text-black rounded"
        />
      </div>

      <table className="w-full text-sm border border-gray-700">
        <thead className="bg-slate-800 text-left border-b border-slate-700">
          <tr>
            <th className="p-3 w-[12%]">Namn</th>
            <th className="p-3 w-[18%]">Beskrivning</th>
            <th className="p-3 w-[6%]">Typ</th>
            <th className="p-3 w-[12%]">Kategori</th>
            <th className="p-3 w-[14%]">Sökord</th>
            <th className="p-3 w-[5%]">Moms</th>
            <th className="p-3 w-[6%]">Specialtyp</th>
            <th className="p-3 w-[6%]">Konton</th>
            <th className="p-3 w-[1%]">❌</th>
          </tr>
        </thead>

        <tbody className="[&>tr:first-child]:mt-2">
          {data.flatMap((rad, i) => {
            const isEven = i % 2 === 0;
            const rowBg = isEven ? "bg-slate-800" : "bg-slate-850";
            const isExpanded = expandedRows.has(rad.id);

            return [
              <tr key={rad.id} className={`${rowBg} align-top text-sm`}>
                <td className="p-3 text-left">{rad.namn}</td>
                <td className="p-3 text-left break-words">{rad.beskrivning}</td>
                <td className="p-3 text-left">{rad.typ}</td>
                <td className="p-3 text-left">{rad.kategori}</td>
                <td className="p-3 text-left break-words">{rad.sökord.join(", ")}</td>
                <td className="p-3 text-left">{rad.momssats ?? "-"}</td>
                <td className="p-3 text-left">{rad.specialtyp ?? ""}</td>
                <td className="p-3 text-left">
                  <button
                    onClick={() => toggleExpand(rad.id)}
                    className="text-cyan-300 hover:underline text-sm"
                  >
                    {isExpanded ? "Dölj" : "Visa"}
                  </button>
                </td>
                <td className="p-3 text-left">
                  <button
                    onClick={() => handleDelete(rad.id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    X
                  </button>
                </td>
              </tr>,

              isExpanded && (
                <tr key={`exp-${rad.id}`} className={rowBg}>
                  <td colSpan={9} className="p-4 text-sm bg-slate-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {rad.konton.map((konto, idx) => (
                        <div key={idx} className="p-3 border border-slate-700 rounded bg-slate-800">
                          <p className="mb-1 font-bold">
                            {konto.kontonummer} – {konto.beskrivning}
                          </p>
                          <p className="text-xs text-gray-300">
                            Debet: {konto.debet ? "✓" : "–"} | Kredit: {konto.kredit ? "✓" : "–"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ),
            ].filter(Boolean);
          })}
        </tbody>
      </table>

      <div className="flex items-center justify-center mt-6 space-x-4">
        <button
          disabled={sida === 1}
          onClick={() => setSida(sida - 1)}
          className="px-3 py-2 text-sm bg-slate-800 rounded disabled:opacity-30"
        >
          ◀ Föregående
        </button>
        <span>
          Sida {sida} av {totalPages}
        </span>
        <button
          disabled={sida === totalPages}
          onClick={() => setSida(sida + 1)}
          className="px-3 py-2 text-sm bg-slate-800 rounded disabled:opacity-30"
        >
          Nästa ▶
        </button>
      </div>
    </main>
  );
}
