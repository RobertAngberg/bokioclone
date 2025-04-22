"use client";

import React, { useEffect, useState } from "react";
import Table from "./Table";
import Loading from "./Loading";
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
      console.log("📥 HÄMTAR transaktioner för år:", year);
      setIsLoading(true);

      const result = await fetchTransaktioner(year);

      if (result.success && Array.isArray(result.data)) {
        console.log("✅ Lyckades hämta transaktioner. Antal:", result.data.length);
        const adjusted = result.data.map((item) => ({
          transaktions_id: item.id,
          transaktionsdatum: new Date(item.transaktionsdatum).toISOString().slice(0, 10),
          kontobeskrivning: item.kontobeskrivning || "",
          belopp: item.belopp ?? 0,
          kommentar: item.kommentar ?? "",
          fil: item.fil ?? "",
        }));
        setHistoryData(adjusted);
        console.log("📊 Sätter historyData:", adjusted);
      } else {
        console.warn("⚠️ Inga transaktioner eller felaktigt svar:", result);
        setHistoryData([]);
      }

      setIsLoading(false);
    };

    loadTransaktioner();
  }, [year]);

  /* --- expandera rad --- */
  const handleRowClick = async (id: number) => {
    console.log("🖱️ Klickade på rad:", id);

    if (id === activeId) {
      console.log("🔽 Kollapsar rad:", id);
      setActiveId(null);
    } else {
      console.log("🔼 Expanderar rad:", id);
      setActiveId(id);

      if (!detailsMap[id]) {
        console.log("📥 HÄMTAR detaljer för transaktions_id:", id);
        const detailResult = await fetchTransactionDetails(id);
        console.log("✅ Fick detaljer:", detailResult);
        setDetailsMap((prev) => ({ ...prev, [id]: detailResult }));
      } else {
        console.log("📦 Detaljer fanns redan i detailsMap.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 overflow-x-hidden px-4 py-10 text-slate-100">
      <div className="max-w-5xl mx-auto">
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

          {/* tabell med fade-in + spinner */}
          <Loading isLoading={isLoading}>
            <Table
              historyData={historyData}
              handleRowClick={handleRowClick}
              activeId={activeId}
              details={activeId ? (detailsMap[activeId] ?? []) : []}
            />
          </Loading>
        </div>
      </div>
    </main>
  );
}
