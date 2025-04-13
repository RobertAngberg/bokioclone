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
    <main className="flex justify-center min-h-screen bg-slate-950 px-4">
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-screen">
          <div className="w-16 h-16 border-t-4 border-cyan-600 border-solid rounded-full animate-spin" />
        </div>
      ) : (
        <div className="w-full max-w-5xl text-left">
          <h1 className="py-10 text-3xl text-center text-white">Huvudbok</h1>
          {Object.entries(groupedData).map(([konto, items]) => {
            let saldo = 0;

            return (
              <div
                key={konto}
                className="mb-6 border border-slate-700 rounded-lg shadow overflow-hidden"
              >
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

                      {/* Balansrad med TEAL-färg */}
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
            );
          })}
        </div>
      )}
    </main>
  );
}
