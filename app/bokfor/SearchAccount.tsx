"use client";

import { useState, useEffect } from "react";
import { fetchAllaForval } from "../start/actions";

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
  konton: KontoRad[];
  sökord: string[];
};

type Props = {
  setKontonummer: (val: string) => void;
  setKontobeskrivning: (val: string) => void;
  setCurrentStep: (val: number) => void;
  setValdaFörval: (val: Forval) => void; // ✅ FIXAT: props-typ
};

export default function SearchAccount({
  setKontonummer,
  setKontobeskrivning,
  setCurrentStep,
  setValdaFörval, // ✅ FIXAT: inkluderad här också
}: Props) {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<Forval[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (searchText.length < 3) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const alla = await fetchAllaForval();
      const träffar = alla.filter((f: Forval) =>
        f.sökord?.some((sök: string) => sök.toLowerCase().includes(searchText.toLowerCase()))
      );
      console.log("🔍 Träffar:", träffar);
      setResults(träffar);
      setLoading(false);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchText]);

  return (
    <div className="w-full">
      <h1 className="mb-4 text-4xl font-bold">Steg 1: Sök förval</h1>
      <p>Skriv in vad du vill bokföra.</p>
      <p>Systemet hittar rätt förval att använda.</p>

      <input
        className="w-full p-3 mt-4 text-black border-2 rounded-lg border-slate-950"
        type="text"
        autoComplete="off"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      {loading && (
        <div className="flex justify-center mt-6">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-slate-800 rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid gap-4 mt-2">
          {results.map((f) => (
            <div
              key={f.id}
              className="bg-white border border-gray-300 rounded-xl p-4 shadow cursor-pointer"
              onClick={() => {
                console.log("🟢 Klickat förval:", f);
                setValdaFörval(f);

                const första = f.konton.find(
                  (k) => typeof k.debet === "string" || typeof k.kredit === "string"
                );

                if (första?.kontonummer) {
                  console.log(
                    "✅ Sätter kontonummer + beskrivning:",
                    första.kontonummer,
                    första.beskrivning
                  );
                  setKontonummer(första.kontonummer);
                  setKontobeskrivning(första.beskrivning);
                  setCurrentStep(3); // direkt till Step3
                } else {
                  console.warn("⚠️ Ingen giltig konto-rad hittades");
                }
              }}
            >
              <div className="text-xl font-semibold text-gray-800 mt-2 mb-6">✓ {f.namn}</div>
              <div className="italic text-gray-600 mb-4">{f.beskrivning}</div>
              <div className="text-sm text-gray-600 mb-1">
                <strong>Kategori:</strong> {f.kategori}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <strong>Typ:</strong> {f.typ}
              </div>
              <div className="text-sm text-gray-500 mb-8">
                <strong>Sökord:</strong> {f.sökord.join(", ")}
              </div>

              <table className="w-full border border-gray-300 text-sm text-gray-700 mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1 text-left">Konto</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Debet</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  {f.konton.map((konto, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 px-2 py-1">
                        {konto.kontonummer} {konto.beskrivning}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {konto.debet === true ? "✓" : (konto.debet ?? "")}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {konto.kredit === true ? "✓" : (konto.kredit ?? "")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
