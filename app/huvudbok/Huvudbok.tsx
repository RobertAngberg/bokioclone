"use client";

import React, { useEffect, useRef, useState } from "react";

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

type Props = {
  initialData: TransactionItem[];
};

export default function Huvudbok({ initialData }: Props) {
  const [groupedData, setGroupedData] = useState<GroupedTransactions>({});
  const [expandedAcc, setExpandedAcc] = useState<string | null>(null);

  useEffect(() => {
    const grouped: GroupedTransactions = initialData.reduce(
      (acc: GroupedTransactions, item: TransactionItem) => {
        const key = `${item.kontonummer} – ${item.beskrivning}`;
        (acc[key] ??= []).push({
          ...item,
          transaktionsdatum: item.transaktionsdatum.slice(0, 10),
        });
        return acc;
      },
      {}
    );

    setGroupedData(grouped);
  }, [initialData]);

  const toggleAcc = (key: string) => {
    setExpandedAcc((prev) => (prev === key ? null : key));
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 overflow-x-hidden text-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="w-full p-8 bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg">
          <h1 className="mb-8 text-3xl text-center">Huvudbok</h1>

          <div className="space-y-6">
            {(() => {
              const sorted = Object.entries(groupedData).sort(([a], [b]) =>
                a.localeCompare(b, "sv-SE")
              );

              let lastSection: string | null = null;

              return sorted.map(([konto, items]) => {
                const kontoNum = konto.split(" – ")[0];
                let section =
                  kontoNum === "1930"
                    ? "Företagskonto"
                    : /^26(1|2|3|4)/.test(kontoNum)
                      ? "Momskonton"
                      : `Kontoklass ${kontoNum.charAt(0)}XXX`;

                const showHeading = section !== lastSection;
                lastSection = section;

                return (
                  <React.Fragment key={konto}>
                    {showHeading && (
                      <h2 className="text-xl text-white font-semibold mb-2">{section}</h2>
                    )}
                    <Accordion
                      title={konto}
                      items={items}
                      expanded={expandedAcc === konto}
                      onToggle={() => toggleAcc(konto)}
                    />
                  </React.Fragment>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </main>
  );
}

function Accordion({
  title,
  items,
  expanded,
  onToggle,
}: {
  title: string;
  items: TransactionItem[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    if (expanded && contentRef.current) {
      setHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setHeight("0px");
    }
  }, [expanded]);

  let saldo = 0;

  return (
    <div className="border border-slate-700 rounded-lg shadow overflow-hidden mb-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-3 bg-slate-900 hover:bg-slate-800 cursor-pointer transition"
      >
        <span className="text-lg font-bold">{title}</span>
        <span
          className={`text-xl transition-transform duration-[150ms] ${
            expanded ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      <div
        style={{
          maxHeight: height,
          transition: "max-height 0.4s ease-in-out",
          overflow: "hidden",
        }}
      >
        <div ref={contentRef}>
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
        </div>
      </div>
    </div>
  );
}
