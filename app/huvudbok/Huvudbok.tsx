//#region Huvud
"use client";

import React, { useEffect, useState } from "react";
import MainLayout from "../_components/MainLayout";
import AnimeradFlik from "../_components/AnimeradFlik";
import Tabell, { ColumnDefinition } from "../_components/Tabell";

type TransactionItem = {
  kontonummer: string;
  beskrivning: string;
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
//#endregion

export default function Huvudbok({ initialData }: Props) {
  const [groupedData, setGroupedData] = useState<GroupedTransactions>({});

  // Grupperar transaktioner på kontonummer och beskrivning ex "1930 – Företagskonto"
  useEffect(() => {
    const grouped = initialData.reduce<GroupedTransactions>((acc, item) => {
      const key = `${item.kontonummer} – ${item.beskrivning}`;
      // Om nyckeln inte finns i ackumulatorn än, skapa en tom array och lägg till transaktionen
      (acc[key] ??= []).push({
        ...item,
        transaktionsdatum: item.transaktionsdatum.slice(0, 10), // Tar bort tid från datumet
      });
      return acc;
    }, {});

    // Sparar den grupperade datan i state för vidare användning (t.ex. rendering i UI)
    setGroupedData(grouped);
  }, [initialData]);

  const renderTable = (items: TransactionItem[]) => {
    let saldo = 0;

    const columns: ColumnDefinition<TransactionItem>[] = [
      {
        key: "transaktionsdatum",
        label: "Datum",
      },
      {
        key: "fil",
        label: "Fil",
        render: (value) =>
          value ? (
            <span className="text-cyan-300 underline">{value}</span>
          ) : (
            <span className="text-gray-400 italic">—</span>
          ),
      },
      {
        key: "debet",
        label: "Debet",
        render: (value) =>
          value
            ? value.toLocaleString("sv-SE", {
                style: "currency",
                currency: "SEK",
              })
            : "—",
      },
      {
        key: "kredit",
        label: "Kredit",
        render: (value) =>
          value
            ? value.toLocaleString("sv-SE", {
                style: "currency",
                currency: "SEK",
              })
            : "—",
      },
      {
        key: "saldo",
        label: "Saldo",
        render: (_, row) => {
          saldo += (row.debet ?? 0) - (row.kredit ?? 0);
          return saldo.toLocaleString("sv-SE", {
            style: "currency",
            currency: "SEK",
          });
        },
      },
    ];

    const getRowId = (item: TransactionItem) => `${item.transaktionsdatum}-${item.fil || "nofile"}`;

    return <Tabell data={items} columns={columns} getRowId={getRowId} activeId={null} />;
  };

  return (
    <MainLayout>
      <h1 className="mb-8 text-3xl text-center">Huvudbok</h1>

      <div className="space-y-6">
        {(() => {
          const sorted = Object.entries(groupedData).sort(([a], [b]) =>
            a.localeCompare(b, "sv-SE")
          );

          let lastSection: string | null = null;

          return sorted.map(([konto, items]) => {
            const kontoNum = konto.split(" – ")[0];
            let section =
              kontoNum === "1930"
                ? "Företagskonto"
                : /^26(1|2|3|4)/.test(kontoNum)
                  ? "Momskonton"
                  : `Kontoklass ${kontoNum.charAt(0)}XXX`;

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
