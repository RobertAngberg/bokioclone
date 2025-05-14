// #region Huvud
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
// #endregion

export default function Resultatrapport({ initialData }: Props) {
  const data = initialData;
  const year = data.ar[0];

  // Summera intäkter och kostnader utan att vända tecken
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

  // Intäkter är negativa i bokföringen, så vänd tecknet till positivt
  const intaktsSumRaw = summering(data.intakter);
  const intaktsSum: Record<string, number> = {};
  for (const year of data.ar) {
    intaktsSum[year] = -intaktsSumRaw[year] || 0;
  }

  // Kostnader och finansiella kostnader är redan positiva
  const rorelsensSum = summering(data.rorelsensKostnader);
  const finansiellaSum = summering(data.finansiellaKostnader);

  const resultat: Record<string, number> = {};
  data.ar.forEach((year) => {
    const intakt = intaktsSum[year] ?? 0;
    const kostnad = rorelsensSum[year] ?? 0;
    const finansiell = finansiellaSum[year] ?? 0;
    resultat[year] = intakt - kostnad - finansiell;
  });

  const renderGrupper = (rader: KontoRad[], isIntakt = false, icon?: string) =>
    rader.map((grupp) => (
      <AnimeradFlik key={grupp.namn} title={grupp.namn} icon={icon || (isIntakt ? "💰" : "💸")}>
        <InreTabell
          rows={grupp.konton.map((konto) => ({
            label: `${konto.kontonummer} – ${konto.beskrivning}`,
            value: isIntakt ? -(konto[year] as number) : (konto[year] as number),
          }))}
          totalLabel={`Summa ${grupp.namn.toLowerCase()}`}
          totalValue={isIntakt ? -grupp.summering[year] : grupp.summering[year]}
        />
      </AnimeradFlik>
    ));

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 text-white">
        <h1 className="text-3xl text-center mb-8">Resultatrapport</h1>

        {renderGrupper(data.intakter, true, "💰")}
        <Totalrad label="Summa rörelsens intäkter" values={{ [year]: intaktsSum[year] ?? 0 }} />

        <h2 className="text-xl font-semibold mt-10 mb-4">Rörelsens kostnader</h2>
        {renderGrupper(data.rorelsensKostnader, false, "💸")}
        <Totalrad label="Summa rörelsens kostnader" values={{ [year]: rorelsensSum[year] ?? 0 }} />

        <h2 className="text-xl font-semibold mt-10 mb-4">Finansiella kostnader</h2>
        {renderGrupper(data.finansiellaKostnader, false, "💸")}
        <Totalrad
          label="Summa finansiella kostnader"
          values={{ [year]: finansiellaSum[year] ?? 0 }}
        />

        <h2 className="text-xl font-semibold mt-10 mb-4">Resultat</h2>
        <Totalrad label="Beräknat resultat" values={{ [year]: resultat[year] }} />
      </div>
    </MainLayout>
  );
}
