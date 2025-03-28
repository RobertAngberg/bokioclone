"use client";

import { useEffect, useState } from "react";
import { useFetchGet } from "../hooks/useFetchGet";
import { YearSelect } from "./YearSelect";
import { Table } from "./Table";

interface HistoryItem {
  transaktions_id: number;
  transaktionsdatum: string;
  kontobeskrivning: string;
  kontotyp: string;
  belopp: string;
  fil: string | null;
  kommentar: string | null;
}

interface TransactionDetail {
  transaktionspost_id: number;
  transaktions_id: number;
  konto_id: number;
  kontobeskrivning: string;
  debet: string;
  kredit: string;
}

function Grundbok() {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [year, setYear] = useState("2023");
  const [activeTransId, setActiveTransId] = useState<number | null>(null);
  const [detailsUrl, setDetailsUrl] = useState<string | null>(null);
  const [details, setDetails] = useState<TransactionDetail[]>([]);

  const { fetchData: yearResult, error: yearError } = useFetchGet<{ yearData: HistoryItem[] }>(
    `api/grundbok?q=${year}`
  );

  const { fetchData: detailsData, error: detailsError } = useFetchGet<TransactionDetail[]>(
    detailsUrl || ""
  );

  useEffect(() => {
    if (Array.isArray(yearResult?.yearData)) {
      const adjusted = yearResult.yearData.map((item) => {
        const date = new Date(item.transaktionsdatum);
        date.setDate(date.getDate() + 1);
        return {
          ...item,
          transaktionsdatum: date.toISOString().slice(0, 10),
        };
      });
      setHistoryData(adjusted);
    }
  }, [yearResult]);

  useEffect(() => {
    if (detailsData) {
      setDetails(detailsData);
    }
  }, [detailsData]);

  const handleRowClick = (transaktionsId: number) => {
    if (transaktionsId === activeTransId) {
      setActiveTransId(null);
      setDetails([]);
    } else {
      setActiveTransId(transaktionsId);
      setDetailsUrl(`api/grundbok?q=row${transaktionsId}`);
    }
  };

  return (
    <main className="items-center min-h-screen text-center text-white md:px-10 bg-slate-950 px-4">
      <div className="flex flex-col items-center justify-center p-10 text-center md:text-left md:flex-row w-full mb-2">
        <h1 className="text-4xl font-bold md:mr-4 mb-6 md:mb-0">Grundbok</h1>
        <YearSelect setYear={setYear} />
      </div>

      {yearError && <p className="text-red-400">⚠️ Error loading data: {yearError.message}</p>}
      {detailsError && (
        <p className="text-red-400">⚠️ Error loading details: {detailsError.message}</p>
      )}

      <div className="w-full">
        <Table
          historyData={historyData}
          handleRowClick={handleRowClick}
          activeId={activeTransId}
          details={details}
        />
      </div>
    </main>
  );
}

export default Grundbok;
