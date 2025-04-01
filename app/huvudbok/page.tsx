"use client";

import { useEffect, useState } from "react";
import { fetchHuvudbok } from "./actions";
import React from "react";

type TransactionItem = {
  kontobeskrivning: string;
  kontonummer: string;
  transaktionsdatum: string;
  fil: string;
  debet: number;
  kredit: number;
};

type GroupedTransactions = {
  [key: string]: TransactionItem[];
};

function Huvudbok() {
  const [groupedData, setGroupedData] = useState<GroupedTransactions>({});
  const [expandedAccInfo, setExpandedAccInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const result = await fetchHuvudbok();
      const grouped: GroupedTransactions = result.reduce((acc, item) => {
        const key = item.kontobeskrivning;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as GroupedTransactions);
      setGroupedData(grouped);
      setIsLoading(false);
    })();
  }, []);

  const toggleAccInfo = (desc: string) =>
    setExpandedAccInfo(expandedAccInfo === desc ? null : desc);

  return (
    <main className="flex justify-center min-h-screen bg-slate-950">
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-screen">
          <div className="w-16 h-16 border-t-4 border-cyan-600 border-solid rounded-full animate-spin" />
        </div>
      ) : (
        <div className="w-full max-w-4xl px-4 text-left">
          <h1 className="py-10 text-4xl font-bold text-center text-white">Huvudbok</h1>
          {Object.entries(groupedData).map(([desc, items]) => (
            <div key={desc} className="mb-1">
              <div
                onClick={() => toggleAccInfo(desc)}
                className="flex items-center justify-between py-2 pr-10 text-white cursor-pointer bg-cyan-950"
              >
                <span className="flex items-center justify-between p-2 pl-10 text-lg font-bold">
                  {items[0].kontonummer} - {desc}
                </span>
                <span>{expandedAccInfo === desc ? "▲" : "▼"}</span>
              </div>

              {expandedAccInfo === desc && (
                <table className="w-full text-white">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-2 pl-10 text-left">Datum</th>
                      <th className="p-2 text-left">Konto</th>
                      <th className="p-2 text-left">Debet</th>
                      <th className="p-2 text-left">Kredit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr
                        key={index}
                        className="even:bg-gray-950 odd:bg-gray-900 hover:bg-gray-700"
                      >
                        <td className="p-2 pl-10">{item.transaktionsdatum.slice(0, 10)}</td>
                        <td className="p-2">{item.kontobeskrivning}</td>
                        <td className="p-2">{item.debet}</td>
                        <td className="p-2">{item.kredit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Huvudbok;
