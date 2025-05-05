"use client";

import AnimeradFlik from "../../_components/AnimeradFlik";
import MainLayout from "../../_components/MainLayout";
import Totalrad from "../../_components/Totalrad";
import InreTabell from "../../_components/InreTabell";

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
  rorelsensKostnader: KontoRad[];
  finansiellaKostnader: KontoRad[];
  ar: string[];
};

type Props = {
  initialData: ResultatData;
};

export default function Resultatrapport({ initialData }: Props) {
  const data = initialData;
  const year = data.ar[0]; // antar bara ett år i denna vy

  const summering = (rader: KontoRad[]) => {
    const result: Record<string, number> = {};
    for (const rad of rader) {
      for (const year of data.ar) {
        const value = typeof rad.summering[year] === "number" ? rad.summering[year] : 0;
        result[year] = (result[year] || 0) + value;
      }
    }
    return result;
  };

  const intaktsSum = summering(data.intakter);
  const rorelsensSum = summering(data.rorelsensKostnader);
  const finansiellaSum = summering(data.finansiellaKostnader);

  const resultat: Record<string, number> = {};
  const resultatEfterFinansiella: Record<string, number> = {};

  data.ar.forEach((year) => {
    const intakt = intaktsSum[year] ?? 0;
    const kostnad = rorelsensSum[year] ?? 0;
    const finansiell = finansiellaSum[year] ?? 0;

    resultat[year] = intakt + kostnad;
    resultatEfterFinansiella[year] = resultat[year] + finansiell;
  });

  const renderGrupper = (rader: KontoRad[], isCost = false, icon?: string) =>
    rader.map((grupp) => (
      <AnimeradFlik key={grupp.namn} title={grupp.namn} icon={icon || (isCost ? "💸" : "💰")}>
        <InreTabell
          rows={grupp.konton.map((konto) => ({
            label: `${konto.kontonummer} – ${konto.beskrivning}`,
            value: konto[year] as number,
          }))}
          totalLabel={`Summa ${grupp.namn.toLowerCase()}`}
          totalValue={grupp.summering[year] ?? 0}
        />
      </AnimeradFlik>
    ));

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 text-white">
        <h1 className="text-3xl text-center mb-8">Resultatrapport</h1>

        {renderGrupper(data.intakter, false, "💰")}
        <Totalrad
          label="Summa rörelsens intäkter"
          values={{ [year]: Math.abs(intaktsSum[year] ?? 0) }}
        />

        <h2 className="text-xl font-semibold mt-10 mb-4">Rörelsens kostnader</h2>
        {renderGrupper(data.rorelsensKostnader, true, "💸")}
        <Totalrad
          label="Summa rörelsens kostnader"
          values={{ [year]: Math.abs(rorelsensSum[year] ?? 0) }}
          isCost
        />

        <h2 className="text-xl font-semibold mt-10 mb-4">Finansiella kostnader</h2>
        {renderGrupper(data.finansiellaKostnader, true, "💸")}
        <Totalrad
          label="Summa finansiella kostnader"
          values={{ [year]: Math.abs(finansiellaSum[year] ?? 0) }}
          isCost
        />

        <h2 className="text-xl font-semibold mt-10 mb-4">Resultat</h2>
        <Totalrad label="Summa rörelsens resultat" values={{ [year]: resultat[year] }} />
        <Totalrad
          label="Resultat efter finansiella poster"
          values={{ [year]: resultatEfterFinansiella[year] }}
        />
        <Totalrad label="Beräknat resultat" values={{ [year]: resultatEfterFinansiella[year] }} />
      </div>
    </MainLayout>
  );
}
