"use client";

import MainLayout from "../../_components/MainLayout";
import AnimeradFlik from "../../_components/AnimeradFlik";

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

  const renderTransaktioner = (transaktioner: Transaktion[]) =>
    transaktioner.map((tx) => (
      <div
        key={tx.id + String(tx.datum)}
        className="flex justify-between text-sm py-1 pl-4 text-white"
      >
        <div>
          <span>{tx.id}</span>
          <span className="mx-1">·</span>
          <span>{new Date(tx.datum).toISOString().slice(0, 10)}</span>
          {tx.beskrivning && (
            <>
              <span className="mx-1">·</span>
              <span>{tx.beskrivning}</span>
            </>
          )}
        </div>
        <div>{formatSEK(tx.belopp)}</div>
      </div>
    ));

  const renderKonton = (konton: Konto[]) =>
    konton.map((konto) => (
      <AnimeradFlik
        key={konto.kontonummer}
        title={`${konto.kontonummer} – ${konto.beskrivning}`}
        icon=""
      >
        <div className="flex justify-between text-sm font-semibold text-white mb-2">
          <span>Saldo</span>
          <span>{formatSEK(konto.saldo)}</span>
        </div>
        {renderTransaktioner(konto.transaktioner)}
      </AnimeradFlik>
    ));

  const renderKategori = (titel: string, icon: string, konton: Konto[]) => (
    <AnimeradFlik title={titel} icon={icon}>
      {renderKonton(konton)}
      <div className="flex justify-between border-t border-gray-600 pt-2 mt-2 font-semibold text-white">
        <span>Summa {titel.toLowerCase()}</span>
        <span>{formatSEK(konton.reduce((a, b) => a + b.saldo, 0))}</span>
      </div>
    </AnimeradFlik>
  );

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
        {renderKategori("Anläggningstillgångar", "🏗️", anläggningstillgångar)}
        {renderKategori("Omsättningstillgångar", "💼", omsättningstillgångar)}

        <div className="flex justify-between mt-4 border-t border-gray-500 pt-2 font-bold">
          <span>Summa tillgångar</span>
          <span>{formatSEK(sumTillgangar)}</span>
        </div>

        <h2 className="text-xl mt-12 mb-4 border-b border-gray-500 pb-1">
          Eget kapital och skulder
        </h2>
        {renderKategori("Eget kapital", "💰", [
          ...egetKapital,
          ...(beräknatResultat ? [beräknatResultat] : []),
        ])}
        {renderKategori("Långfristiga skulder", "🏦", långfristigaSkulder)}
        {renderKategori("Kortfristiga skulder", "⏳", kortfristigaSkulder)}

        <div className="flex justify-between mt-4 border-t border-gray-500 pt-2 font-bold">
          <span>Summa eget kapital och skulder</span>
          <span>{formatSEK(sumSkulderEK)}</span>
        </div>

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
