"use client";

import React, { useEffect, useState } from "react";
import { fetchDataFromYear } from "./start/actions";
import Card from "./start/Card";
import HomeChart from "./start/HomeChart";

type YearSummary = {
  totalInkomst: number;
  totalUtgift: number;
  totalResultat: number;
  yearData: YearDataPoint[];
};

type YearDataPoint = {
  month: string;
  inkomst: number;
  utgift: number;
};

export default function Home() {
  const [year, setYear] = useState("2025");
  const [data, setData] = useState<YearSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchDataFromYear(year)
      .then((data) => setData(data))
      .finally(() => setIsLoading(false));
  }, [year]);

  return (
    <main className="min-h-screen bg-slate-950 overflow-x-hidden px-4 py-10 text-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="w-full p-8 bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg">
          <>
            <div className="flex flex-wrap justify-center gap-4 mb-8 text-center">
              <Card title="Intäkter" data={data?.totalInkomst || 0} />
              <Card title="Kostnader" data={data?.totalUtgift || 0} />
              <Card title="Resultat" data={data?.totalResultat || 0} />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="border-t-4 border-cyan-600 border-solid rounded-full w-16 h-16 animate-spin"></div>
              </div>
            ) : (
              <HomeChart year={year} onYearChange={setYear} chartData={data?.yearData || []} />
            )}
          </>
        </div>
      </div>
    </main>
  );
}
