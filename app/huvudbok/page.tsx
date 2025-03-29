"use client";

import { useEffect, useState } from "react";
import { fetchHuvudbok } from "./actions";

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

  useEffect(() => {
    (async () => {
      const result = await fetchHuvudbok();
      const grouped: GroupedTransactions = result.reduce((acc, item) => {
        const key = item.kontobeskrivning;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as GroupedTransactions);

      setGroupedData(grouped);
    })();
  }, []);

  const toggleAccInfo = (desc: string) =>
    setExpandedAccInfo(expandedAccInfo === desc ? null : desc);

  return (
    <main className="flex justify-center min-h-screen bg-slate-950">
      <div className="w-full max-w-4xl px-4 text-left">
        <h1 className="py-10 text-4xl font-bold text-center text-white">Huvudbok</h1>
        {Object.entries(groupedData).map(([desc, items]) => (
          <div key={desc} className="mb-4">
            <div
              onClick={() => toggleAccInfo(desc)}
              className="flex items-center justify-between py-2 pr-10 text-white rounded-tl-lg rounded-tr-lg cursor-pointer bg-cyan-950"
            >
              <span className="flex items-center justify-between p-5 pl-10 text-lg font-bold">
                {items[0].kontonummer} - {desc}
              </span>
              <span>{expandedAccInfo === desc ? "▽" : "▷"}</span>
            </div>

            {expandedAccInfo === desc && (
              <table className="w-full text-white">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="p-2 text-left">Datum</th>
                    <th className="p-2 text-left">Konto</th>
                    <th className="hidden p-2 text-left sm:table-cell">Fil</th>
                    <th className="p-2 text-left">Debet</th>
                    <th className="p-2 text-left">Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="even:bg-gray-950 odd:bg-gray-900 hover:bg-gray-700">
                      <td className="p-2">{item.transaktionsdatum.slice(0, 10)}</td>
                      <td className="p-2">{item.kontobeskrivning}</td>
                      <td className="hidden p-2 sm:table-cell">{item.fil}</td>
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
    </main>
  );
}

export default Huvudbok;
