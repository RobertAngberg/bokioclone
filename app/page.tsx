"use client";

import { useState, useEffect } from "react";
import { Card } from "./start/Card";
import { HomeChart } from "./start/HomeChart";
import { fetchDataFromYear } from "./start/actions";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchDataFromYear(year)
      .then((data) => {
        setData(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [year]);

  return (
    <main className="items-center text-center bg-slate-950">
      <div className="flex flex-col justify-center p-10 md:flex-row md:justify-center md:space-x-2 mb-5">
        {/* Cards with Skeleton Loader */}
        {isLoading ? (
          <>
            <div className="w-48 h-24 shimmer rounded-md" />
            <div className="w-48 h-24 shimmer rounded-md" />
            <div className="w-48 h-24 shimmer rounded-md" />
          </>
        ) : (
          <>
            <Card title="Inkomster" data={data?.totalInkomst || 0} />
            <Card title="Utgifter" data={data?.totalUtgift || 0} />
            <Card title="Resultat" data={data?.totalResultat || 0} />
          </>
        )}
      </div>

      {/* Chart with Spinner */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="border-t-4 border-cyan-600 border-solid rounded-full w-16 h-16 animate-spin"></div>
        </div>
      ) : (
        <HomeChart year={year} onYearChange={setYear} chartData={data?.yearData || []} />
      )}
    </main>
  );
}

export default Home;
