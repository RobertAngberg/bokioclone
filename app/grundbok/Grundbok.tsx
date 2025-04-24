"use client";

import React, { useState } from "react";
import Tabell from "./Tabell";
import { fetchTransactionDetails } from "./actions";
import MainLayout from "../_components/MainLayout";

interface HistoryItem {
  transaktions_id: number;
  transaktionsdatum: string;
  kontobeskrivning: string;
  belopp: number;
  kommentar?: string;
  fil?: string;
}

interface TransactionDetail {
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

  return (
    <MainLayout>
      <div className="text-center mb-8 space-y-4">
        <h1 className="text-3xl">Grundbok</h1>

        <select
          className="px-4 py-2 font-bold text-white rounded bg-cyan-600 hover:bg-cyan-700"
          id="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          disabled // 👈 vi visar bara 2025-data
        >
          <option value="2025">2025</option>
        </select>
      </div>

      <Tabell
        historyData={historyData}
        handleRowClick={handleRowClick}
        activeId={activeId}
        details={activeId ? (detailsMap[activeId] ?? []) : []}
      />
    </MainLayout>
  );
}
