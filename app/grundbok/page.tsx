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

  /* --- ladda transaktioner --- */
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

  /* --- expandera rad --- */
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

  /* ---------- UI ---------- */
  return (
    <main className="min-h-screen bg-slate-950 overflow-x-hidden px-4 py-10 text-slate-100">
      <div className="max-w-5xl mx-auto">
        {/* kortet */}
        <div className="w-full p-8 bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg">
          {/* rubrik + årsväljare */}
          <div className="text-center mb-8 space-y-4">
            <h1 className="text-3xl">Grundbok</h1>

            <select
              className="px-4 py-2 font-bold text-white rounded bg-cyan-600 hover:bg-cyan-700"
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              {["2025", "2024", "2023", "2022", "2021", "2020"].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* tabell / spinner */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-16 h-16 border-t-4 border-cyan-400 rounded-full animate-spin" />
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
      </div>
    </main>
  );
}
