// #region Huvud
"use client";

import MainLayout from "../../_components/MainLayout";
import AnimeradFlik from "../../_components/AnimeradFlik";
import Totalrad from "../../_components/Totalrad";
import InreTabell from "../../_components/InreTabell";

type Transaktion = {
  id: string;
  datum: string | Date;
  belopp: number;
  beskrivning?: string;
};

type Konto = {
  kontonummer: string;
  beskrivning: string;
  saldo: number;
  transaktioner: Transaktion[];
};

type BalansData = {
  year: string;
  tillgangar: Konto[];
  skulderOchEgetKapital: Konto[];
};

type Props = {
  initialData: BalansData;
};
// #endregion

export default function Balansrapport({ initialData }: Props) {
  const {
    year,
    tillgangar,
    skulderOchEgetKapital,
    sumTillgangar,
    sumSkulderEK,
    differens,
    formatSEK,
  } = skapaBalansSammanställning(initialData);

  function skapaBalansSammanställning(data: BalansData) {
    const { year, tillgangar, skulderOchEgetKapital } = data;

    const sumKonton = (konton: Konto[]) =>
      konton.reduce((sum, konto) => sum + (konto.saldo ?? 0), 0);

    const sumTillgangar = sumKonton(tillgangar);
    const sumSkulderEK = sumKonton(skulderOchEgetKapital);
    const differens = sumTillgangar - sumSkulderEK;

    const formatSEK = (v: number) =>
      `${v.toLocaleString("sv-SE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} kr`;

    return {
      year,
      tillgangar,
      skulderOchEgetKapital,
      sumTillgangar,
      sumSkulderEK,
      differens,
      formatSEK,
    };
  }

  const renderaKategori = (titel: string, icon: string, konton: Konto[]) => {
    const summa = konton.reduce((a, b) => a + b.saldo, 0);
    return (
      <AnimeradFlik title={titel} icon={icon}>
        <InreTabell
          rows={konton.map((konto) => ({
            label: `${konto.kontonummer} – ${konto.beskrivning}`,
            value: konto.saldo,
          }))}
          totalLabel={`Summa ${titel.toLowerCase()}`}
          totalValue={summa}
        />
      </AnimeradFlik>
    );
  };

  const omsättningstillgångar = tillgangar.filter((k) => /^19|^16|^17/.test(k.kontonummer));
  const anläggningstillgångar = tillgangar.filter((k) => /^1(0|1)/.test(k.kontonummer));
  const egetKapital = skulderOchEgetKapital.filter((k) => /^2(0|1)/.test(k.kontonummer));
  const kortfristigaSkulder = skulderOchEgetKapital.filter((k) => /^2(4|6)/.test(k.kontonummer));
  const långfristigaSkulder = skulderOchEgetKapital.filter((k) => /^2(3)/.test(k.kontonummer));
  const beräknatResultat = skulderOchEgetKapital.find((k) => k.kontonummer === "9999");

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 text-white">
        <h1 className="text-3xl text-center mb-10">Balansrapport</h1>

        <h2 className="text-xl mb-4 border-b border-gray-500 pb-1">Tillgångar</h2>
        {renderaKategori("Anläggningstillgångar", "🏗️", anläggningstillgångar)}
        {renderaKategori("Omsättningstillgångar", "💼", omsättningstillgångar)}
        <Totalrad label="Summa tillgångar" values={{ [year]: sumTillgangar }} />

        <h2 className="text-xl mt-12 mb-4 border-b border-gray-500 pb-1">
          Eget kapital och skulder
        </h2>
        {renderaKategori("Eget kapital", "💰", [
          ...egetKapital,
          ...(beräknatResultat ? [beräknatResultat] : []),
        ])}
        {renderaKategori("Långfristiga skulder", "🏦", långfristigaSkulder)}
        {renderaKategori("Kortfristiga skulder", "⏳", kortfristigaSkulder)}
        <Totalrad label="Summa eget kapital och skulder" values={{ [year]: sumSkulderEK }} />

        <section className="mt-8">
          {differens === 0 ? (
            <p className="text-green-400 font-bold text-center text-lg">
              ✅ Balanskontroll – {year}
            </p>
          ) : (
            <p className="text-red-400 font-bold text-center text-lg">
              ❌ Obalans ({formatSEK(differens)})
            </p>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
