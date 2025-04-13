"use client";

import { useState } from "react";
import { accounts } from "./accountData";

export type Konto = {
  kontonummer: string;
  kontobeskrivning: string;
  kontoklass: string;
  sökord: string[];
  kategori: string;
  kräverSpeciellUI?: boolean;
};

export default function VisaKonton() {
  const [query, setQuery] = useState("");
  const [kategori, setKategori] = useState("");
  const [klass, setKlass] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const allaKategorier: string[] = Array.from(
    new Set((accounts as Konto[]).map((k: Konto) => k.kategori))
  ).sort();
  const allaKlasser: string[] = Array.from(
    new Set((accounts as Konto[]).map((k: Konto) => k.kontoklass))
  ).sort();

  const harSökfilter = query || kategori || klass;

  const filtrerade: Konto[] = harSökfilter
    ? accounts
        .filter((konto: Konto): boolean => {
          const matchQuery: boolean =
            konto.kontonummer.includes(query) ||
            konto.kontobeskrivning.toLowerCase().includes(query.toLowerCase()) ||
            konto.sökord.some((word: string): boolean =>
              word.toLowerCase().includes(query.toLowerCase())
            );

          const matchKategori: boolean = kategori ? konto.kategori === kategori : true;
          const matchKlass: boolean = klass ? konto.kontoklass === klass : true;

          return matchQuery && matchKategori && matchKlass;
        })
        .sort((a: Konto, b: Konto): number => {
          if (sortOrder === "asc") {
            return a.kontonummer.localeCompare(b.kontonummer);
          } else {
            return b.kontonummer.localeCompare(a.kontonummer);
          }
        })
    : [];

  const kontoklassFärg: Record<string, string> = {
    Intäkter: "bg-green-500",
    Kostnader: "bg-red-500",
    Tillgångar: "bg-blue-500",
    Skulder: "bg-yellow-500",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Kontoinformation</h1>
      {harSökfilter && (
        <div className="text-gray-700 dark:text-gray-300 mb-6">{filtrerade.length} konton</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök kontonamn, nummer eller sökord..."
          className="w-full p-3 border rounded text-gray-800 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500"
        />
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="w-full p-3 border rounded text-gray-800 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
        >
          <option value="">Alla kategorier</option>
          {allaKategorier.map((k: string) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <select
          value={klass}
          onChange={(e) => setKlass(e.target.value)}
          className="w-full p-3 border rounded text-gray-800 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
        >
          <option value="">Alla kontoklasser</option>
          {allaKlasser.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end mb-4">
        <button
          className="text-sm underline text-gray-700 dark:text-gray-300"
          onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
        >
          Sortera: {sortOrder === "asc" ? "Stigande" : "Fallande"}
        </button>
      </div>

      {harSökfilter && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtrerade.map((konto) => (
            <div
              key={konto.kontonummer + konto.kontobeskrivning}
              className="bg-white dark:bg-gray-900 shadow rounded-xl p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-medium text-gray-800 dark:text-white">
                  {konto.kontonummer} – {konto.kontobeskrivning}
                </span>
                <span
                  className={`w-3 h-3 rounded-full ml-2 ${
                    kontoklassFärg[konto.kontoklass] || "bg-gray-400"
                  }`}
                  title={konto.kontoklass}
                ></span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <strong>Kategori:</strong> {konto.kategori}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <strong>Sökord:</strong> {konto.sökord.join(", ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
