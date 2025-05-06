"use client";

import React, { useEffect, useState } from "react";
import MainLayout from "../_components/MainLayout";
import AnimeradFlik from "../_components/AnimeradFlik";
import InreTabell from "../_components/InreTabell";

type TransactionItem = {
  kontonummer: string;
  beskrivning: string; // transaktionsbeskrivning
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

  useEffect(() => {
    const grouped = initialData.reduce<GroupedTransactions>((acc, item) => {
      const key = item.kontonummer;
      (acc[key] ??= []).push({
        ...item,
        transaktionsdatum: item.transaktionsdatum.slice(0, 10),
      });
      return acc;
    }, {});
    setGroupedData(grouped);
  }, [initialData]);

  const formatSEK = (val: number) =>
    val.toLocaleString("sv-SE", {
      style: "currency",
      currency: "SEK",
    });

  const renderTable = (items: TransactionItem[]) => {
    let saldo = 0;

    const rows = items.map((item) => {
      saldo += (item.debet ?? 0) - (item.kredit ?? 0);
      return {
        kontonummer: item.kontonummer,
        beskrivning: item.beskrivning,
        datum: item.transaktionsdatum, // 👈 Ändrat här
        fil: item.fil,
        debet: item.debet,
        kredit: item.kredit,
        saldo,
      };
    });

    const utgåendeBalans = rows.at(-1)?.saldo ?? 0;

    return (
      <div className="space-y-2">
        <div className="text-sm text-white font-semibold mb-2">Ingående balans 0,00 kr</div>
        <InreTabell rows={rows} />
        <div className="text-sm text-white font-semibold mt-4 text-right">
          Utgående balans {formatSEK(utgåendeBalans)}
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <h1 className="mb-8 text-3xl text-center text-white">Huvudbok</h1>
      <div className="space-y-6">
        {(() => {
          const sorted = Object.entries(groupedData).sort(([a], [b]) =>
            a.localeCompare(b, "sv-SE")
          );

          let lastSection: string | null = null;

          return sorted.map(([kontoNummer, items]) => {
            const kontoNamn = items[0]?.beskrivning || "";
            const konto = `${kontoNummer} – ${kontoNamn}`;

            let section =
              kontoNummer === "1930"
                ? "Företagskonto"
                : /^26(1|2|3|4)/.test(kontoNummer)
                  ? "Momskonton"
                  : `Kontoklass ${kontoNummer.charAt(0)}XXX`;

            const showHeading = section !== lastSection;
            lastSection = section;

            return (
              <div key={konto}>
                {showHeading && (
                  <h2 className="text-xl text-white font-semibold mb-2">{section}</h2>
                )}
                <AnimeradFlik title={konto} icon="📂">
                  {renderTable(items)}
                </AnimeradFlik>
              </div>
            );
          });
        })()}
      </div>
    </MainLayout>
  );
}
