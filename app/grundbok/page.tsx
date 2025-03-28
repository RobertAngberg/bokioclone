"use client";

import { useEffect, useState } from "react";
import { useFetchGet } from "../hooks/useFetchGet";
import { YearSelect } from "./YearSelect";
import { Table } from "./Table";

function Grundbok() {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [year, setYear] = useState("2023");
  const [activeTransId, setActiveTransId] = useState<number | null>(null);
  const [detailsUrl, setDetailsUrl] = useState<string | null>(null);
  const [details, setDetails] = useState<TransactionDetail[]>([]);

  const { fetchData: yearFetchData, error: yearError } = useFetchGet(`api/grundbok?q=${year}`);
  const { fetchData: detailsData, error: detailsError } = useFetchGet(detailsUrl || "");

  useEffect(() => {
    console.log("📦 yearFetchData:", yearFetchData);
    if (yearFetchData?.yearData && Array.isArray(yearFetchData.yearData)) {
      const adjustedData = yearFetchData.yearData.map((item: HistoryItem) => {
        const adjustedDate = new Date(item.transaktionsdatum);
        adjustedDate.setDate(adjustedDate.getDate() + 1);
        item.transaktionsdatum = adjustedDate.toISOString().slice(0, 10);
        return item;
      });
      console.log("✅ adjustedData:", adjustedData);
      setHistoryData(adjustedData);
    }
  }, [yearFetchData]);

  useEffect(() => {
    if (detailsData) {
      console.log("🔍 detailsData:", detailsData);
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
