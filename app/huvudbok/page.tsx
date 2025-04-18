"use client";

import React, { useEffect, useState } from "react";
import { fetchHuvudbok } from "./actions";

/* ---------- typer ---------- */
type TransactionItem = {
  kontonummer: string;
  beskrivning: string;
  transaktionsdatum: string;
  fil: string;
  debet: number;
  kredit: number;
};

type GroupedTransactions = {
  [konto: string]: TransactionItem[];
};

export default function Huvudbok() {
  const [groupedData, setGroupedData] = useState<GroupedTransactions>({});
  const [expandedAcc, setExpandedAcc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* --- hämta & gruppera --- */
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const result = await fetchHuvudbok();
      const grouped: GroupedTransactions = result.reduce(
        (acc: GroupedTransactions, item: TransactionItem) => {
          const key = `${item.kontonummer} – ${item.beskrivning}`;
          (acc[key] ??= []).push({
            ...item,
            transaktionsdatum: item.transaktionsdatum.slice(0, 10), // YYYY‑MM‑DD
          });
          return acc;
        },
        {}
      );
      setGroupedData(grouped);
      setIsLoading(false);
    })();
  }, []);

  const toggleAcc = (key: string) => setExpandedAcc(expandedAcc === key ? null : key);

  /* ---------- UI ---------- */
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 overflow-x-hidden text-slate-100">
      <div className="max-w-5xl mx-auto">
        {/* kort */}
        <div className="w-full p-8 bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg">
          <h1 className="mb-8 text-3xl text-center">Huvudbok</h1>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-16 h-16 border-t-4 border-cyan-400 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {(() => {
                /* sortera konton */
                const sorted = Object.entries(groupedData).sort(([aNum], [bNum]) => {
                  const key = (konto: string) => {
                    const num = konto.split(" – ")[0];
                    if (num === "1930") return "0";
                    if (/^26(1|2|3|4)/.test(num)) return "1" + num;
                    return "2" + num;
                  };
                  return key(aNum).localeCompare(key(bNum), "sv-SE");
                });

                let lastSection: string | null = null;

                return sorted.map(([konto, items]) => {
                  const kontoNum = konto.split(" – ")[0];

                  /* sektionstitel */
                  let section =
                    kontoNum === "1930"
                      ? "Företagskonto"
                      : /^26(1|2|3|4)/.test(kontoNum)
                        ? "Momskonton"
                        : `Kontoklass ${kontoNum.charAt(0)}XXX`;

                  const showHeading = section !== lastSection;
                  lastSection = section;

                  let saldo = 0;

                  return (
                    <React.Fragment key={konto}>
                      {showHeading && (
                        <h2 className="text-xl text-white font-semibold mb-2">
                          {section === "Företagskonto"
                            ? "Företagskonto"
                            : section === "Momskonton"
                              ? "Momskonton"
                              : `${section}`}
                        </h2>
                      )}

                      {/* konto‑accordion */}
                      <div className="border border-slate-700 rounded-lg shadow overflow-hidden mb-3">
                        <div
                          onClick={() => toggleAcc(konto)}
                          className="flex items-center justify-between px-6 py-3 bg-slate-900 hover:bg-slate-800 cursor-pointer transition"
                        >
                          <span className="text-lg font-bold">{konto}</span>
                          <span className="text-xl">{expandedAcc === konto ? "▲" : "▼"}</span>
                        </div>

                        {expandedAcc === konto && (
                          <table className="w-full text-sm">
                            <thead className="bg-slate-800 text-white">
                              <tr>
                                <th className="p-3 pl-6 text-left">Datum</th>
                                <th className="p-3 text-left">Fil</th>
                                <th className="p-3 text-right">Debet</th>
                                <th className="p-3 text-right">Kredit</th>
                                <th className="p-3 text-right">Saldo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((rad, i) => {
                                saldo += (rad.debet ?? 0) - (rad.kredit ?? 0);
                                return (
                                  <tr key={i} className={i % 2 ? "bg-slate-950" : "bg-slate-900"}>
                                    <td className="p-3 pl-6">{rad.transaktionsdatum}</td>
                                    <td className="p-3">
                                      {rad.fil ? (
                                        <span className="text-cyan-300 underline">{rad.fil}</span>
                                      ) : (
                                        <span className="text-gray-400 italic">—</span>
                                      )}
                                    </td>
                                    <td className="p-3 text-right">
                                      {rad.debet
                                        ? rad.debet.toLocaleString("sv-SE", {
                                            style: "currency",
                                            currency: "SEK",
                                          })
                                        : "—"}
                                    </td>
                                    <td className="p-3 text-right">
                                      {rad.kredit
                                        ? rad.kredit.toLocaleString("sv-SE", {
                                            style: "currency",
                                            currency: "SEK",
                                          })
                                        : "—"}
                                    </td>
                                    <td className="p-3 text-right">
                                      {saldo.toLocaleString("sv-SE", {
                                        style: "currency",
                                        currency: "SEK",
                                      })}
                                    </td>
                                  </tr>
                                );
                              })}

                              {saldo !== 0 && (
                                <tr className="bg-cyan-950 font-semibold">
                                  <td className="p-3 pl-6" colSpan={4}>
                                    {saldo > 0 ? "Utgående balans" : "Ingående balans"}
                                  </td>
                                  <td className="p-3 text-right">
                                    {Math.abs(saldo).toLocaleString("sv-SE", {
                                      style: "currency",
                                      currency: "SEK",
                                    })}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </React.Fragment>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
