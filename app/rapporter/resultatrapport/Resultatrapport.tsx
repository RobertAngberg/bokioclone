"use client";

import { useState } from "react";
import Accordion from "./Accordion";
import Totalrad from "./Totalrad";

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

type Props = {
  initialData: ResultatData;
};

export default function Resultatrapport({ initialData }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const data = initialData;

  const summering = (rader: KontoRad[]) => {
    const result: Record<string, number> = {};
    for (const rad of rader) {
      for (const year of data.ar) {
        result[year] = (result[year] || 0) + (rad.summering[year] || 0);
      }
    }
    return result;
  };

  const intaktsSum = summering(data.intakter);
  const kostnadsSum = summering(data.kostnader);
  const resultat = data.ar.map((year) => intaktsSum[year] - kostnadsSum[year]);

  const renderGrupper = (rader: KontoRad[], isCost = false) =>
    rader.map((grupp) => (
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
    ));

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="p-8 bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg">
          <h1 className="text-3xl text-center mb-8">Resultatrapport</h1>

          {renderGrupper(data.intakter)}
          <Totalrad label="Summa rörelsens intäkter" values={intaktsSum} />

          <h2 className="text-xl font-semibold mt-10 mb-4">Rörelsens kostnader</h2>
          {renderGrupper(data.kostnader, true)}
          <Totalrad label="Summa rörelsens kostnader" values={kostnadsSum} isCost />

          <h2 className="text-xl font-semibold mt-10 mb-4">Resultat</h2>
          {[
            "Summa rörelsens resultat",
            "Resultat efter finansiella poster",
            "Beräknat resultat",
          ].map((label) => (
            <Totalrad
              key={label}
              label={label}
              values={data.ar.reduce(
                (acc, year, i) => ({ ...acc, [year]: resultat[i] }),
                {} as Record<string, number>
              )}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
