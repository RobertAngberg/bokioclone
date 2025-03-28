"use client";

import { useState, useEffect } from "react";
import { Card } from "./start/Card";
import { HomeChart } from "./start/HomeChart";
import { fetchDataFromYear } from "./actions"; // Import the server action
import React from "react";

function Home() {
  const [year, setYear] = useState<string>("2024");
  const [fetchData, setFetchData] = useState<any>(null); // Store the fetched data

  // Fetch data when the year changes
  const fetchDataFromServer = async (year: string) => {
    const data = await fetchDataFromYear(year);
    setFetchData(data);
  };

  useEffect(() => {
    fetchDataFromServer(year);
  }, [year]);

  console.log("✅ DATA:", fetchData);

  return (
    <main className="items-center text-center bg-slate-950">
      <div className="flex flex-col justify-center p-10 md:flex-row md:justify-center md:space-x-2">
        <Card title="Inkomster" data={fetchData?.totalInkomst || 0} />
        <Card title="Utgifter" data={fetchData?.totalUtgift || 0} />
        <Card title="Resultat" data={fetchData?.totalResultat || 0} />
      </div>
      <HomeChart setYear={setYear} chartData={fetchData?.yearData} />
    </main>
  );
}

export default Home;
