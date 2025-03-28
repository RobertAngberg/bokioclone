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
  const [historyData, setHistoryData] = useState<
    Array<{
      transaktions_id: string;
      transaktionsdatum: string;
      kontobeskrivning: string;
      belopp: number;
      kommentar?: string;
      fil?: string;
    }>
  >([]);
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
          transaktions_id: String(item.transaktions_id),
          transaktionsdatum: date.toISOString().slice(0, 10),
          kontobeskrivning: item.kontobeskrivning,
          belopp: parseFloat(item.belopp),
          kommentar: item.kommentar || undefined,
          fil: item.fil || undefined,
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
    <main className="items-center min-h-screen px-4 text-center text-white md:px-10 bg-slate-950">
      <div className="flex flex-col items-center justify-center w-full p-10 mb-2 text-center md:text-left md:flex-row">
        <h1 className="mb-6 text-4xl font-bold md:mr-4 md:mb-0">Grundbok</h1>
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
