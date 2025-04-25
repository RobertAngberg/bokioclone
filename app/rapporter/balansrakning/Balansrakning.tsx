"use client";

import { useState } from "react";
import Tabell, { ColumnDefinition } from "@/app/_components/Tabell";
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

export default function Balansrakning({ initialData }: Props) {
  const { year, tillgangar, skulderOchEgetKapital } = initialData;

  const [activeTillgangId, setActiveTillgangId] = useState<string | number | null>(null);
  const [activeSkuldId, setActiveSkuldId] = useState<string | number | null>(null);

  const total = (konton: Konto[]) => konton.reduce((sum, k) => sum + (k.saldo ?? 0), 0);

  const sumTillgangar = total(tillgangar);
  const sumSkulderEK = total(skulderOchEgetKapital);
  const differens = sumTillgangar - sumSkulderEK;

  const format = (v: number) =>
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
      render: (v) => format(v),
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12 text-white">
        <h1 className="text-3xl text-center mb-10">🏦 Balansräkning</h1>

        <section className="mb-12">
          <h2 className="text-xl mb-3">Tillgångar</h2>
          <Tabell
            data={tillgangar}
            columns={kolumner}
            getRowId={(row) => row.kontonummer}
            activeId={activeTillgangId}
            handleRowClick={(id) => setActiveTillgangId(id)}
          />
          <p className="mt-4 font-semibold">Summa: {format(sumTillgangar)}</p>
        </section>

        <section className="mb-12">
          <h2 className="text-xl mb-3">Eget kapital och skulder</h2>
          <Tabell
            data={skulderOchEgetKapital}
            columns={kolumner}
            getRowId={(row) => row.kontonummer}
            activeId={activeSkuldId}
            handleRowClick={(id) => setActiveSkuldId(id)}
          />
          <p className="mt-4 font-semibold">Summa: {format(sumSkulderEK)}</p>
        </section>

        <section className="mt-8">
          {differens === 0 ? (
            <p className="text-green-400 font-bold text-center text-lg">
              ✅ Balanskontroll – {year}
            </p>
          ) : (
            <p className="text-red-400 font-bold text-center text-lg">
              ❌ Obalans ({format(differens)})
            </p>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
