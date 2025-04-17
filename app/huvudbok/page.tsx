"use client";

import { useEffect, useState } from "react";
import { fetchHuvudbok } from "./actions";
import React from "react";

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

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const result = await fetchHuvudbok();
      const grouped: GroupedTransactions = result.reduce((acc, item) => {
        const key = `${item.kontonummer} – ${item.beskrivning}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as GroupedTransactions);
      setGroupedData(grouped);
      setIsLoading(false);
    })();
  }, []);

  const toggleAcc = (key: string) => {
    setExpandedAcc(expandedAcc === key ? null : key);
  };

  return (
    <main className="flex justify-center min-h-screen bg-slate-950 px-4 pb-20">
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-screen">
          <div className="w-16 h-16 border-t-4 border-cyan-600 border-solid rounded-full animate-spin" />
        </div>
      ) : (
        <div className="w-full max-w-5xl text-left">
          <h1 className="pt-10 pb-2 text-3xl text-center text-white">Huvudbok</h1>

          {(() => {
            const sortedEntries = Object.entries(groupedData).sort(([aNum], [bNum]) => {
              const getSortKey = (konto: string) => {
                const kontoNum = konto.split(" – ")[0];
                if (kontoNum === "1930") return "0";
                if (/^26(1|2|3|4)/.test(kontoNum)) return "1" + kontoNum;
                return "2" + kontoNum;
              };
              return getSortKey(aNum).localeCompare(getSortKey(bNum), "sv-SE");
            });

            let lastSection: string | null = null;

            return sortedEntries.map(([konto, items]) => {
              const kontoNum = konto.split(" – ")[0];
              let currentSection: string;

              if (kontoNum === "1930") {
                currentSection = "1930";
              } else if (/^26(1|2|3|4)/.test(kontoNum)) {
                currentSection = "moms";
              } else {
                const prefix = kontoNum.charAt(0);
                currentSection = `klass${prefix}XXX`;
              }

              const showHeading = currentSection !== lastSection;
              lastSection = currentSection;

              let saldo = 0;

              return (
                <React.Fragment key={konto}>
                  {showHeading && (
                    <h2 className="mt-10 mb-4 text-xl text-cyan-300 font-semibold border-b border-cyan-800 pb-1">
                      {currentSection === "1930"
                        ? "📌 Företagskonto"
                        : currentSection === "moms"
                          ? "💼 Momskonton"
                          : `📚 Kontoklass ${currentSection.replace("klass", "")}`}
                    </h2>
                  )}

                  <div className="mb-2 border border-slate-700 rounded-lg shadow overflow-hidden">
                    <div
                      onClick={() => toggleAcc(konto)}
                      className="flex items-center justify-between px-6 py-3 text-white bg-cyan-950 cursor-pointer hover:bg-cyan-900"
                    >
                      <span className="text-lg font-bold">{konto}</span>
                      <span className="text-xl">{expandedAcc === konto ? "▲" : "▼"}</span>
                    </div>

                    {expandedAcc === konto && (
                      <table className="w-full text-sm text-white">
                        <tbody>
                          {items.map((rad, i) => {
                            saldo += (rad.debet ?? 0) - (rad.kredit ?? 0);
                            return (
                              <tr key={i} className={i % 2 === 0 ? "bg-slate-900" : "bg-slate-950"}>
                                <td className="p-3 pl-6">{rad.transaktionsdatum.slice(0, 10)}</td>
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
                            <tr className="bg-cyan-950 font-semibold text-white">
                              <td className="p-3 pl-6" colSpan={4}>
                                {saldo > 0 ? "Utgående balans" : "Ingående balans"}
                              </td>
                              <td className="p-3 text-right">
                                {(Math.abs(saldo) || 0).toLocaleString("sv-SE", {
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
    </main>
  );
}
