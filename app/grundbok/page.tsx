"use client";

import { useEffect, useState } from "react";
import { useFetchGet } from "../hooks/useFetchGet";
import { YearSelect } from "./YearSelect";
import { Table } from "./Table";

function Grundbok() {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [year, setYear] = useState("");
  const [activeTransId, setActiveTransId] = useState<number | null>(null);
  const [detailsUrl, setDetailsUrl] = useState<string | null>(null);
  const [details, setDetails] = useState<TransactionDetail[]>([]); // Add this state

  // Lite konstiga workarounds pga hook-regler nedan
  // Också, fetchData kommer från useFetchGet och måste renameas, annars blir två fetchData

  // Denna körs på page load för att visa rader men ej detaljer
  const { fetchData: yearFetchData } = useFetchGet(`api/grundbok?q=${year}`);

  // Visa detaljer, körs när detailsUrl ändras
  const { fetchData: detailsData } = useFetchGet(detailsUrl || "");

  // Date +1 pga Sveriges tidszon
  useEffect(() => {
    if (yearFetchData?.yearData) {
      const adjustedData = yearFetchData.yearData.map((item: HistoryItem) => {
        const adjustedDate = new Date(item.transaktionsdatum);
        adjustedDate.setDate(adjustedDate.getDate() + 1); // +1 day
        item.transaktionsdatum = adjustedDate.toISOString().slice(0, 10);
        return item;
      });
      setHistoryData(adjustedData);
    }
  }, [yearFetchData]);

  // Denna känner av när detailsData ändras (i []) och sparar
  useEffect(() => {
    if (detailsData) {
      setDetails(detailsData);
    }
  }, [detailsData]);

  const handleRowClick = (transaktionsId: number) => {
    // If the clicked row is already active, close the details
    if (transaktionsId === activeTransId) {
      setActiveTransId(null);
      setDetails([]); // Clear details when deselecting
    } else {
      // Sätt aktivt transaktionsId, används för att kunna folda ihop raden igen
      // Sen ändra detailsUrl vilket triggar useFetchGet
      // vilket triggar useEffect som sparar rad-detaljerna
      setActiveTransId(transaktionsId);
      setDetailsUrl(`api/grundbok/?q=row${transaktionsId}`);
    }
  };

  return (
    <main className="items-center min-h-screen text-center text-white md:px-10 bg-slate-950 px-4">
      <div className="flex flex-col items-center justify-center p-10 text-center md:text-left md:flex-row w-full mb-2">
        <h1 className="text-4xl font-bold md:mr-4 mb-6 md:mb-0">Grundbok</h1>
        <YearSelect setYear={setYear} />
      </div>
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
