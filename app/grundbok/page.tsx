"use client";

import { useEffect, useState } from "react";
import { YearSelect } from "./YearSelect";
import { Table } from "./Table";
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
  kontobeskrivning: string;
  debet: number;
  kredit: number;
}

function Grundbok() {
  const [year, setYear] = useState("2024");
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [details, setDetails] = useState<TransactionDetail[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    const loadTransaktioner = async () => {
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
    };

    loadTransaktioner();
  }, [year]);

  const handleRowClick = async (id: number) => {
    if (id === activeId) {
      setActiveId(null);
      setDetails([]);
    } else {
      setActiveId(id);
      const detailResult = await fetchTransactionDetails(id);
      setDetails(detailResult);
    }
  };

  return (
    <main className="items-center min-h-screen px-4 text-center text-white md:px-10 bg-slate-950">
      <div className="flex flex-col items-center justify-center w-full p-10 mb-2 text-center md:text-left md:flex-row">
        <h1 className="mb-6 text-4xl font-bold md:mr-4 md:mb-0">Grundbok</h1>
        <YearSelect setYear={setYear} />
      </div>

      <div className="w-full">
        <Table
          historyData={historyData}
          handleRowClick={handleRowClick}
          activeId={activeId}
          details={details}
        />
      </div>
    </main>
  );
}

export default Grundbok;
