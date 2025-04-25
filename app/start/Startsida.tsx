"use client";

import React, { useEffect, useState } from "react";
import { fetchDataFromYear } from "./actions";
import Kort from "./Kort";
import Chart from "./Chart";
import MainLayout from "../_components/MainLayout";

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

type Props = {
  initialData: YearSummary;
};

export default function Startsida({ initialData }: Props) {
  const [year, setYear] = useState("2025");
  const [data, setData] = useState<YearSummary | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (year === "2025") return; // redan laddad via initialData
    setIsLoading(true);
    fetchDataFromYear(year)
      .then((newData) => setData(newData))
      .finally(() => setIsLoading(false));
  }, [year]);

  return (
    <main className="min-h-screen bg-slate-950 overflow-x-hidden px-4 py-10 text-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="w-full p-8 bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg">
          <div className="flex flex-wrap justify-center gap-4 mb-8 text-center">
            <Kort title="Intäkter" data={data?.totalInkomst || 0} />
            <Kort title="Kostnader" data={data?.totalUtgift || 0} />
            <Kort title="Resultat" data={data?.totalResultat || 0} />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="border-t-4 border-cyan-600 border-solid rounded-full w-16 h-16 animate-spin"></div>
            </div>
          ) : (
            <Chart year={year} onYearChange={setYear} chartData={data?.yearData || []} />
          )}
        </div>
      </div>
    </main>
  );
}
