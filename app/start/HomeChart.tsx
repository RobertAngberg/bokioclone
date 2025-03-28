"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

type ChartRow = {
  month: string;
  inkomst: number;
  utgift: number;
};

type Props = {
  year: string;
  onYearChange: (year: string) => void;
  chartData: ChartRow[];
};

export function HomeChart({ year, onYearChange, chartData }: Props) {
  const [labels, setLabels] = useState<string[]>([]);
  const [inkomstData, setInkomstData] = useState<number[]>([]);
  const [kostnadData, setKostnadData] = useState<number[]>([]);

  useEffect(() => {
    const tempLabels: string[] = [];
    const tempInkomst: number[] = [];
    const tempKostnad: number[] = [];

    chartData.forEach((row) => {
      const date = new Date(row.month);
      if (isNaN(date.getTime())) return;
      tempLabels.push(date.toLocaleString("default", { month: "short" }));
      tempInkomst.push(row.inkomst);
      tempKostnad.push(-row.utgift);
    });

    setLabels(tempLabels);
    setInkomstData(tempInkomst);
    setKostnadData(tempKostnad);
  }, [chartData]);

  const data = {
    labels,
    datasets: [
      {
        label: "Inkomster",
        data: inkomstData,
        backgroundColor: "rgb(0, 128, 128)",
      },
      {
        label: "Kostnad",
        data: kostnadData,
        backgroundColor: "rgb(255, 99, 132)",
      },
    ],
  };

  return (
    <div className="w-full h-screen text-white md:mx-auto md:w-4/5">
      <label className="p-3 font-bold text-white" htmlFor="year">
        Visa år:
      </label>
      <select
        id="year"
        value={year}
        onChange={(e) => onYearChange(e.target.value)}
        className="px-4 py-2 font-bold text-white rounded cursor-pointer bg-cyan-600 hover:bg-cyan-700"
      >
        <option value="2024">2024</option>
        <option value="2023">2023</option>
        <option value="2022">2022</option>
        <option value="2021">2021</option>
        <option value="2020">2020</option>
      </select>

      <div className="relative p-10" style={{ height: "80vh" }}>
        <Bar datasetIdKey="id" options={{ maintainAspectRatio: false }} data={data} />
      </div>
    </div>
  );
}
