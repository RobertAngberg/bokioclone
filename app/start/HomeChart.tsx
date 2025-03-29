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
    const labelSet = new Set<string>();
    const monthDataMap: { [key: string]: { inkomst: number; kostnad: number } } = {};

    chartData.forEach((row) => {
      const date = new Date(row.month);
      if (isNaN(date.getTime())) return;

      const label = date.toLocaleString("default", { month: "short" });

      labelSet.add(label);
      if (!monthDataMap[label]) {
        monthDataMap[label] = { inkomst: 0, kostnad: 0 };
      }

      monthDataMap[label].inkomst += row.inkomst;
      monthDataMap[label].kostnad += row.utgift;
    });

    const finalLabels = Array.from(labelSet);
    const inkomstValues = finalLabels.map((label) => monthDataMap[label].inkomst);
    const kostnadValues = finalLabels.map((label) => -monthDataMap[label].kostnad);

    setLabels(finalLabels);
    setInkomstData(inkomstValues);
    setKostnadData(kostnadValues);
  }, [chartData]);

  const data = {
    labels,
    datasets: [
      {
        label: "Inkomster",
        data: inkomstData,
        backgroundColor: "rgb(0, 128, 128)",
        barPercentage: 0.5,
        categoryPercentage: 1.0,
      },
      {
        label: "Kostnader",
        data: kostnadData,
        backgroundColor: "rgb(255, 99, 132)",
        barPercentage: 0.5,
        categoryPercentage: 1.0,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    indexAxis: "x" as const,
    scales: {
      x: {
        offset: true,
        stacked: false,
        ticks: {
          color: "white",
          font: { size: 14 },
          padding: 20,
        },
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
      },
      y: {
        ticks: {
          color: "white",
          font: { size: 14 },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "white",
          font: { size: 14 },
        },
      },
    },
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
        <Bar datasetIdKey="id" options={options} data={data} />
      </div>
    </div>
  );
}
