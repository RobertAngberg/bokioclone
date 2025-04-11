"use client";

import { useState, useEffect } from "react";
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
  const [sök, setSök] = useState("");
  const [kategori, setKategori] = useState("");
  const [typ, setTyp] = useState("");

  useEffect(() => {
    const hämta = async () => {
      const data = await fetchAllaForval();
      setForval(data);
    };
    hämta();
  }, []);

  const unikaKategorier = Array.from(new Set(forval.map((f) => f.kategori))).sort();
  const unikaTyper = Array.from(new Set(forval.map((f) => f.typ.trim().toLowerCase()))).sort();

  const filtrerade = forval.filter((f) => {
    const matchSök =
      f.namn.toLowerCase().includes(sök.toLowerCase()) ||
      f.beskrivning.toLowerCase().includes(sök.toLowerCase()) ||
      (Array.isArray(f.sökord)
        ? f.sökord.some((s) => s.toLowerCase().includes(sök.toLowerCase()))
        : f.sökord?.toLowerCase().includes(sök.toLowerCase()));

    const matchKategori = kategori ? f.kategori === kategori : true;
    const matchTyp = typ ? f.typ.trim().toLowerCase() === typ : true;

    return matchSök && matchKategori && matchTyp;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Förval</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          value={sök}
          onChange={(e) => setSök(e.target.value)}
          placeholder="Sök namn, beskrivning eller sökord..."
          className="w-full p-3 border rounded text-gray-600 placeholder-gray-400"
        />
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="w-full p-3 border rounded text-gray-600"
        >
          <option value="">Alla kategorier</option>
          {unikaKategorier.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <select
          value={typ}
          onChange={(e) => setTyp(e.target.value)}
          className="w-full p-3 border rounded text-gray-600"
        >
          <option value="">Alla typer</option>
          {unikaTyper.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {filtrerade.length === 0 && (
        <p className="text-gray-600 mb-6">Inga förval matchar dina filter.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtrerade.map((f) => (
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
              <div className="text-sm text-gray-500 mb-5">
                <strong>Sökord:</strong> {f.sökord.join(", ")}
              </div>
            )}

            <table className="w-full border border-gray-300 text-sm text-gray-700 mb-2">
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
