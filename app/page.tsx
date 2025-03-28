"use client";

import { useState, useEffect } from "react";
import { Card } from "./start/Card";
import { HomeChart } from "./start/HomeChart";
import { fetchDataFromYear } from "./actions";

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

function Home() {
  const [year, setYear] = useState("2024");
  const [data, setData] = useState<YearSummary | null>(null);

  useEffect(() => {
    fetchDataFromYear(year).then(setData);
  }, [year]);

  return (
    <main className="items-center text-center bg-slate-950">
      <div className="flex flex-col justify-center p-10 md:flex-row md:justify-center md:space-x-2">
        <Card title="Inkomster" data={data?.totalInkomst || 0} />
        <Card title="Utgifter" data={data?.totalUtgift || 0} />
        <Card title="Resultat" data={data?.totalResultat || 0} />
      </div>
      <HomeChart year={year} onYearChange={setYear} chartData={data?.yearData || []} />
    </main>
  );
}

export default Home;
