"use client";

import { useEffect, useState } from "react";
import { fetchAllaForval } from "./start/actions";

type KontoRad = {
  beskrivning: string;
  kontonummer?: string;
  debet?: string | boolean;
  kredit?: string | boolean;
};

type Forval = {
  id: number;
  namn: string;
  beskrivning: string;
  typ: string;
  kategori: string;
  sökord?: string[] | string | null;
  konton: KontoRad[];
};

export default function VisaForval() {
  const [forval, setForval] = useState<Forval[]>([]);

  useEffect(() => {
    const hämta = async () => {
      const data = await fetchAllaForval();
      setForval(data);
    };
    hämta();
  }, []);

  if (!forval.length) {
    return <div className="text-gray-700">Inga förval tillgängliga.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Förval</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forval.map((f) => (
          <div key={f.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow">
            <div className="text-xl font-bold text-gray-800 mb-4">✓ {f.namn}</div>
            <div className="italic text-gray-600 mb-5">{f.beskrivning}</div>
            <div className="text-sm text-gray-600 mb-0">
              <strong>Kategori:</strong> {f.kategori}
            </div>
            <div className="text-sm text-gray-600 mb-5">
              <strong>Typ:</strong> {f.typ}
            </div>

            {Array.isArray(f.sökord) && f.sökord.length > 0 && (
              <div className="text-sm text-gray-500 mb-10">
                <strong>Sökord:</strong> {f.sökord.join(", ")}
              </div>
            )}

            <table className="w-full border border-gray-300 text-sm text-gray-700 mb-6">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1 text-left">Konto</th>
                  <th className="border border-gray-300 px-2 py-1 text-center">Debet</th>
                  <th className="border border-gray-300 px-2 py-1 text-center">Kredit</th>
                </tr>
              </thead>
              <tbody>
                {f.konton.map((konto, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 px-2 py-1">
                      {konto.kontonummer ? `${konto.kontonummer} ` : ""}
                      {konto.beskrivning}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {konto.debet === true || typeof konto.debet === "string" ? "✓" : ""}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {konto.kredit === true || typeof konto.kredit === "string" ? "✓" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
