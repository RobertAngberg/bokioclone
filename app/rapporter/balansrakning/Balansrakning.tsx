//#region Huvud
"use client";

import { useEffect, useState } from "react";
import Tabell, { ColumnDefinition } from "../../_components/Tabell";
import MainLayout from "../../_components/MainLayout";

type Konto = {
  kontonummer: string;
  beskrivning: string;
  saldo: number;
};

type BalansData = {
  year: string;
  tillgangar: Konto[];
  skulderOchEgetKapital: Konto[];
};

type Props = {
  initialData: BalansData;
};
//#endregion

export default function Balansrakning({ initialData }: Props) {
  // Plockar ut beräknad balansdata, kolumner och formatering från incoming data
  const {
    year,
    kolumner,
    tillgangar,
    skulderOchEgetKapital,
    sumTillgangar,
    sumSkulderEK,
    differens,
    formatSEK,
  } = skapaBalansSammanställning(initialData);

  // Beräknar summeringar och kolumner
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

    const kolumner: ColumnDefinition<Konto>[] = [
      {
        key: "kontonummer",
        label: "Konto",
        render: (_, row) => `${row.kontonummer} – ${row.beskrivning}`,
      },
      {
        key: "saldo",
        label: year,
        render: (v) => formatSEK(v),
      },
    ];

    return {
      year,
      kolumner,
      tillgangar,
      skulderOchEgetKapital,
      sumTillgangar,
      sumSkulderEK,
      differens,
      formatSEK,
    };
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12 text-white">
        <h1 className="text-3xl text-center mb-10">🏦 Balansräkning</h1>

        <section className="mb-12">
          <h2 className="text-xl mb-3">Tillgångar</h2>
          <Tabell data={tillgangar} columns={kolumner} getRowId={(row) => row.kontonummer} />
          <p className="mt-4 font-semibold">Summa: {formatSEK(sumTillgangar)}</p>
        </section>

        <section className="mb-12">
          <h2 className="text-xl mb-3">Eget kapital och skulder</h2>
          <Tabell
            data={skulderOchEgetKapital}
            columns={kolumner}
            getRowId={(row) => row.kontonummer}
          />
          <p className="mt-4 font-semibold">Summa: {formatSEK(sumSkulderEK)}</p>
        </section>

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
