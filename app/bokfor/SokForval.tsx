"use client";

import { useState, useEffect } from "react";
import { fetchAllaForval } from "../start/actions";

type KontoRad = {
  beskrivning: string;
  kontonummer?: string;
  debet?: boolean;
  kredit?: boolean;
};

type Extrafält = {
  namn: string;
  label: string;
  konto: string;
  debet: boolean;
  kredit: boolean;
};

type Forval = {
  id: number;
  namn: string;
  beskrivning: string;
  typ: string;
  kategori: string;
  konton: KontoRad[];
  sökord: string[];
  extrafält?: Extrafält[];
};

type Props = {
  setCurrentStep: (val: number) => void;
  setvaltFörval: (val: Forval) => void;
  setKontonummer: (val: string) => void;
  setKontobeskrivning: (val: string) => void;
};

export default function SokForval({
  setCurrentStep,
  setvaltFörval,
  setKontonummer,
  setKontobeskrivning,
}: Props) {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<Forval[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

  useEffect(() => {
    const delay = setTimeout(async () => {
      const input = searchText.trim();
      if (input.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const alla = await fetchAllaForval();
      const words = normalize(input).split(" ");

      const träffar = alla.filter((f: Forval) => {
        const text = `${f.namn} ${f.beskrivning} ${f.typ} ${f.kategori} ${f.sökord.join(" ")}`;
        const norm = normalize(text);
        return words.every((w) => norm.includes(w));
      });

      setResults(träffar);
      setHighlightedIndex(0);
      setLoading(false);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchText]);

  const väljFörval = (f: Forval) => {
    setvaltFörval(f);
    const huvudkonto = f.konton.find(
      (k) => k.kontonummer !== "1930" && (k.kredit || k.debet) && !!k.kontonummer
    );
    if (huvudkonto) {
      setKontonummer(huvudkonto.kontonummer ?? "");
      setKontobeskrivning(huvudkonto.beskrivning ?? "");
    } else {
      console.warn("⚠️ Hittade inget huvudkonto i förval:", f);
    }
    setCurrentStep(2);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    }
    if (e.key === "Enter") {
      if (results[highlightedIndex]) {
        väljFörval(results[highlightedIndex]);
      }
    }
    if (e.key === "Escape") {
      setSearchText("");
      setResults([]);
    }
  };

  return (
    <div className="w-full">
      <h1 className="mb-4 text-4xl font-bold">Steg 1: Sök förval</h1>
      <input
        className="w-full p-3 mt-4 text-black border-2 rounded-lg border-slate-950"
        type="text"
        autoComplete="off"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {loading && (
        <div className="flex justify-center mt-6">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-slate-800 rounded-full animate-spin"></div>
        </div>
      )}

      {!loading &&
        results.length > 0 &&
        results.map((f, index) => (
          <div
            key={f.id}
            className={`relative mt-4 rounded-xl p-4 shadow cursor-pointer transition-all ${
              index === highlightedIndex
                ? "border-2 border-dashed border-blue-500 bg-white"
                : "border border-gray-300 bg-white"
            }`}
            onClick={() => väljFörval(f)}
          >
            <div className="text-xl font-semibold text-gray-800 mb-2">✓ {f.namn}</div>
            <p className="italic text-sm text-gray-600 mb-2">{f.beskrivning}</p>
            <p className="text-sm text-gray-600">
              <strong>Typ:</strong> {f.typ} &nbsp; | &nbsp;
              <strong>Kategori:</strong> {f.kategori}
            </p>
            <p className="text-sm text-gray-500 mt-2 mb-4">
              <strong>Sökord:</strong> {f.sökord.join(", ")}
            </p>

            <table className="w-full border border-gray-300 text-sm text-gray-700">
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

            {index === highlightedIndex && (
              <div className="mt-3 text-xs text-gray-500 text-right">
                ⏎ Tryck Enter för att välja
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
