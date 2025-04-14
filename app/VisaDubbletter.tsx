"use client";

import { useEffect, useState } from "react";
import { fetchDubbletter } from "./start/actions";

type DubblettRad = {
  dubblett_konto: string;
  dubblett_beskrivning: string;
  dubblett_av: string;
  original_beskrivning: string;
};

export default function VisaDubbletter() {
  const [dubbletter, setDubbletter] = useState<DubblettRad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hämta = async () => {
      setLoading(true);
      const resultat = await fetchDubbletter();
      setDubbletter(resultat);
      setLoading(false);
    };
    hämta();
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 text-white">
      <h1 className="text-3xl font-bold mb-6">🔁 Dubbletter i kontoplan</h1>

      {loading ? (
        <p className="text-gray-400">🔄 Laddar...</p>
      ) : dubbletter.length === 0 ? (
        <p className="text-green-400">✅ Inga dubbletter hittades!</p>
      ) : (
        <table className="w-full border border-slate-700 text-sm text-gray-300">
          <thead className="bg-slate-700 text-white">
            <tr>
              <th className="px-3 py-2 text-left">Dubblettkonto</th>
              <th className="px-3 py-2 text-left">Beskrivning</th>
              <th className="px-3 py-2 text-left">Dubblett av</th>
              <th className="px-3 py-2 text-left">Originalbeskrivning</th>
            </tr>
          </thead>
          <tbody>
            {dubbletter.map((rad, i) => (
              <tr key={i} className="even:bg-slate-800 odd:bg-slate-900">
                <td className="px-3 py-2">{rad.dubblett_konto}</td>
                <td className="px-3 py-2">{rad.dubblett_beskrivning}</td>
                <td className="px-3 py-2 text-yellow-400 font-bold">{rad.dubblett_av}</td>
                <td className="px-3 py-2 text-gray-300">
                  {rad.original_beskrivning ?? "⚠️ Saknas"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
