"use client";

import React, { useEffect, useState, useRef } from "react";
import { hamtaResultatrapport } from "./actions";

type Konto = {
  kontonummer: string;
  beskrivning: string;
  [year: string]: number | string;
};

type KontoRad = {
  namn: string;
  konton: Konto[];
  summering: { [year: string]: number };
};

type ResultatData = {
  intakter: KontoRad[];
  kostnader: KontoRad[];
  ar: string[];
};

export default function Resultatrapport() {
  const [data, setData] = useState<ResultatData | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    hamtaResultatrapport().then((res) => {
      if (!res || !res.intakter || !res.kostnader) {
        console.error("❌ Ogiltigt resultatrapport-data", res);
      } else {
        setData(res);
      }
    });
  }, []);

  const summering = (rader: KontoRad[]) => {
    const result: { [year: string]: number } = {};
    for (const rad of rader) {
      for (const year of data?.ar || []) {
        result[year] = (result[year] || 0) + (rad.summering[year] || 0);
      }
    }
    return result;
  };

  const intaktsSum = data ? summering(data.intakter) : {};
  const kostnadsSum = data ? summering(data.kostnader) : {};
  const resultat = data ? data.ar.map((year) => intaktsSum[year] - kostnadsSum[year]) : [];

  const renderGrupper = (rader: KontoRad[], isCost = false) => {
    return data
      ? rader.map((grupp) => (
          <Accordion
            key={grupp.namn}
            title={grupp.namn}
            items={grupp.konton}
            years={data.ar}
            isCost={isCost}
            expanded={expanded === grupp.namn}
            onToggle={() => setExpanded(expanded === grupp.namn ? null : grupp.namn)}
            summering={grupp.summering}
          />
        ))
      : null;
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="p-8 bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg">
          <h1 className="text-3xl text-center mb-8">Resultatrapport</h1>
          {data && renderGrupper(data.intakter)}
          {data && <Totalrad label="Summa rörelsens intäkter" values={intaktsSum} />}

          <h2 className="text-xl font-semibold mt-10 mb-4">Rörelsens kostnader</h2>
          {data && renderGrupper(data.kostnader, true)}
          {data && <Totalrad label="Summa rörelsens kostnader" values={kostnadsSum} isCost />}

          <h2 className="text-xl font-semibold mt-10 mb-4">Resultat</h2>
          {data && (
            <Totalrad
              label="Summa rörelsens resultat"
              values={resultat.reduce(
                (acc, val, i) => {
                  acc[data.ar[i]] = val;
                  return acc;
                },
                {} as Record<string, number>
              )}
            />
          )}

          {data && (
            <Totalrad
              label="Resultat efter finansiella poster"
              values={resultat.reduce(
                (acc, val, i) => {
                  acc[data.ar[i]] = val;
                  return acc;
                },
                {} as Record<string, number>
              )}
            />
          )}

          {data && (
            <Totalrad
              label="Beräknat resultat"
              values={resultat.reduce(
                (acc, val, i) => {
                  acc[data.ar[i]] = val;
                  return acc;
                },
                {} as Record<string, number>
              )}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function Accordion({
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
        className="w-full flex items-center justify-between px-6 py-3 bg-slate-900 hover:bg-slate-800 cursor-pointer transition"
      >
        <span className="text-base">{title}</span>
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

function Totalrad({
  label,
  values,
  isCost,
}: {
  label: string;
  values: Record<string, number>;
  isCost?: boolean;
}) {
  const format = (val: number) => (isCost ? "-" : "") + Math.abs(val).toLocaleString("sv-SE");

  return (
    <div className="w-full border-t border-slate-600 mb-2 pt-0">
      <div className="flex justify-between items-center text-white font-bold text-[16px] px-6 py-3 bg-slate-800">
        <div>{label}</div>
        <div className="flex gap-6">
          {Object.keys(values)
            .sort((a, b) => b.localeCompare(a))
            .map((year) => (
              <div key={year} className="text-right min-w-[80px]">
                {format(values[year] || 0)}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
