"use client";

import { useEffect, useState } from "react";
import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import React from "react";

type ChartRow = {
  month: string; // ISO date string, e.g. "2024-01-01T00:00:00.000Z"
  inkomst: number;
  utgift: number;
};

type HomeChartProps = {
  setYear: (year: string) => void;
  chartData: ChartRow[];
};

function HomeChart({ setYear, chartData }: HomeChartProps) {
  const [labels, setLabels] = useState<string[]>([]);
  const [inkomsterData, setInkomsterData] = useState<number[]>([]);
  const [kostnadData, setKostnadData] = useState<number[]>([]);

  useEffect(() => {
    if (!chartData) return;

    const tempLabels: string[] = [];
    const tempInkomsterData: number[] = [];
    const tempKostnadData: number[] = [];

    chartData.forEach((row) => {
      const date = new Date(row.month);
      if (isNaN(date.getTime())) return; // Skip invalid dates

      const label = date.toLocaleString("default", { month: "short" }); // "Jan", "Feb", etc.
      tempLabels.push(label);
      tempInkomsterData.push(Number(row.inkomst));
      tempKostnadData.push(-Number(row.utgift)); // Negate to show downward bars
    });

    setLabels(tempLabels);
    setInkomsterData(tempInkomsterData);
    setKostnadData(tempKostnadData);
  }, [chartData]);

  const data = {
    labels,
    datasets: [
      {
        label: "Inkomster",
        data: inkomsterData,
        backgroundColor: "rgb(0, 128, 128)",
      },
      {
        label: "Kostnad",
        data: kostnadData,
        backgroundColor: "rgb(255, 99, 132)",
      },
    ],
  };

  const options = {
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: "white",
          font: {
            size: 18,
          },
        },
      },
      y: {
        beginAtZero: true,
        stacked: true,
        ticks: {
          color: "white",
          font: {
            size: 18,
          },
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "white",
          font: {
            size: 18,
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-screen text-white md:mx-auto md:w-4/5">
      <label className="p-3 font-bold text-white" htmlFor="year">
        Visa år:
      </label>
      <select
        className="px-4 py-2 font-bold text-white rounded cursor-pointer bg-cyan-600 hover:bg-cyan-700"
        id="year"
        onChange={(e) => setYear(e.target.value)}
      >
        <option value="">Välj</option>
        <option value="2024">2024</option>
        <option value="2023">2023</option>
        <option value="2022">2022</option>
        <option value="2021">2021</option>
        <option value="2020">2020</option>
      </select>
      <div className="relative p-10" style={{ height: "80vh" }}>
        <Bar datasetIdKey="id" options={options} data={data} className="h-full" />
      </div>
    </div>
  );
}

export { HomeChart };
