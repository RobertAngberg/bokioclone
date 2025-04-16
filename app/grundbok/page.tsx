"use client";

import React, { useEffect, useState } from "react";
import Table from "./Table";
import { fetchTransaktioner, fetchTransactionDetails } from "./actions";

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

export default function Grundbok() {
  const [year, setYear] = useState("2025");
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [detailsMap, setDetailsMap] = useState<Record<number, TransactionDetail[]>>({});
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTransaktioner = async () => {
      setIsLoading(true);
      const result = await fetchTransaktioner(year);
      if (result.success && Array.isArray(result.data)) {
        const adjusted = result.data.map((item) => ({
          transaktions_id: item.transaktions_id,
          transaktionsdatum: new Date(item.transaktionsdatum).toISOString().slice(0, 10),
          kontobeskrivning: item.kontobeskrivning || "",
          belopp: item.belopp ?? 0,
          kommentar: item.kommentar ?? "",
          fil: item.fil ?? "",
        }));
        setHistoryData(adjusted);
      }
      setIsLoading(false);
    };

    loadTransaktioner();
  }, [year]);

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
    <main className="min-h-screen px-4 py-10 text-white bg-slate-950 md:px-10">
      <div className="w-full max-w-5xl mx-auto text-center">
        <h1 className="mb-6 text-3xl">Grundbok</h1>
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

      <div className="w-full mt-10">
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-64">
            <div className="w-16 h-16 border-t-4 border-cyan-600 border-solid rounded-full animate-spin" />
          </div>
        ) : (
          <Table
            historyData={historyData}
            handleRowClick={handleRowClick}
            activeId={activeId}
            details={activeId ? (detailsMap[activeId] ?? []) : []}
          />
        )}
      </div>
    </main>
  );
}
