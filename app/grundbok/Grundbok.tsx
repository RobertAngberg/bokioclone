"use client";

import React, { useState } from "react";
import Tabell from "../_components/Tabell";
import { ColumnDefinition } from "../_components/TabellRad";
import MainLayout from "../_components/MainLayout";
import { fetchTransactionDetails } from "./actions";

export interface HistoryItem {
  transaktions_id: number;
  transaktionsdatum: string;
  kontobeskrivning: string;
  belopp: number;
  kommentar?: string;
  fil?: string;
}

export interface TransactionDetail {
  transaktionspost_id: number;
  kontonummer: string;
  beskrivning: string;
  debet: number;
  kredit: number;
}

type Props = {
  initialData: HistoryItem[];
};

export default function Grundbok({ initialData }: Props) {
  const [year, setYear] = useState("2025");
  const [historyData] = useState<HistoryItem[]>(initialData);
  const [detailsMap, setDetailsMap] = useState<Record<number, TransactionDetail[]>>({});
  const [activeId, setActiveId] = useState<number | null>(null);

  const handleRowClick = async (id: number) => {
    if (id === activeId) {
      setActiveId(null);
    } else {
      setActiveId(id);
      if (!detailsMap[id]) {
        const detailResult = await fetchTransactionDetails(id);
        setDetailsMap((prev) => ({ ...prev, [id]: detailResult }));
      }
    }
  };

  const columns: ColumnDefinition<HistoryItem>[] = [
    { key: "transaktions_id", label: "ID" },
    { key: "transaktionsdatum", label: "Datum" },
    { key: "fil", label: "Fil", hiddenOnMobile: true },
    { key: "kontobeskrivning", label: "Konto" },
    {
      key: "belopp",
      label: "Belopp",
      render: (val: number) =>
        val.toLocaleString("sv-SE", {
          style: "currency",
          currency: "SEK",
        }),
    },
    { key: "kommentar", label: "Kommentar", hiddenOnMobile: true },
  ];

  return (
    <MainLayout>
      <div className="text-center mb-8 space-y-4">
        <h1 className="text-3xl">Grundbok</h1>

        <select
          className="px-4 py-2 font-bold text-white rounded bg-cyan-600 hover:bg-cyan-700"
          id="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2020">2020</option>
        </select>
      </div>

      <Tabell
        data={historyData}
        columns={columns}
        getRowId={(item: HistoryItem) => item.transaktions_id}
        activeId={activeId}
        handleRowClick={handleRowClick}
        renderExpandedRow={(item: HistoryItem) => {
          const rows = detailsMap[item.transaktions_id] ?? [];
          if (rows.length === 0) return null;

          return (
            <tr className="bg-slate-800">
              <td colSpan={6} className="p-0">
                <div className="p-4">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-600">
                      <tr>
                        <th className="text-left py-2 pl-6">Konto</th>
                        <th className="text-right py-2 pr-4">Debet</th>
                        <th className="text-right py-2 pr-6">Kredit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((detail) => (
                        <tr key={detail.transaktionspost_id} className="border-b border-slate-700">
                          <td className="py-2 pl-6 pr-4">
                            {detail.kontonummer} – {detail.beskrivning}
                          </td>
                          <td className="py-2 pr-4 text-right">
                            {detail.debet !== 0
                              ? detail.debet.toLocaleString("sv-SE", {
                                  style: "currency",
                                  currency: "SEK",
                                })
                              : "–"}
                          </td>
                          <td className="py-2 pr-6 text-right">
                            {detail.kredit !== 0
                              ? detail.kredit.toLocaleString("sv-SE", {
                                  style: "currency",
                                  currency: "SEK",
                                })
                              : "–"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          );
        }}
      />
    </MainLayout>
  );
}
