"use client";

import { useEffect, useRef, useState } from "react";

type Konto = {
  kontonummer: string;
  beskrivning: string;
  [year: string]: number | string;
};

export default function Accordion({
  title,
  items,
  years,
  isCost,
  expanded,
  onToggle,
  summering,
}: {
  title: string;
  items: Konto[];
  years: string[];
  isCost?: boolean;
  expanded: boolean;
  onToggle: () => void;
  summering: { [year: string]: number };
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

  const format = (val: number) => (isCost ? "-" : "") + Math.abs(val).toLocaleString("sv-SE");

  return (
    <div className="border border-slate-700 rounded-lg shadow overflow-hidden mb-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-3 bg-slate-900 hover:bg-slate-800 transition"
      >
        <span className="text-base">{title}</span>
        <span
          className={`text-xl transition-transform duration-[150ms] ${expanded ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      <div
        style={{ maxHeight: height, transition: "max-height 0.4s ease-in-out", overflow: "hidden" }}
      >
        <div ref={contentRef}>
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-3 pl-6 text-left">Konto</th>
                {years.map((y) => (
                  <th key={y} className="p-3 text-right">
                    {y}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((konto, i) => (
                <tr key={konto.kontonummer + i} className={i % 2 ? "bg-slate-950" : "bg-slate-900"}>
                  <td className="p-3 pl-6">
                    {konto.kontonummer} {konto.beskrivning}
                  </td>
                  {years.map((year) => (
                    <td key={year} className="p-3 text-right">
                      {format(Number(konto[year]) || 0)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-slate-800 font-semibold text-white border-t border-slate-600">
                <td className="p-3 pl-6">Summa {title}</td>
                {years.map((year) => (
                  <td key={year} className="p-3 text-right">
                    {format(summering[year] || 0)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
