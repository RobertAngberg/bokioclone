"use client";

import { useEffect, useState } from "react";
import { Chart } from "react-chartjs-2";
import "chart.js/auto";
import React from "react";

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

export default function HomeChart({ year, onYearChange, chartData }: Props) {
  const [labels, setLabels] = useState<string[]>([]);
  const [inkomstData, setInkomstData] = useState<number[]>([]);
  const [utgiftData, setUtgiftData] = useState<number[]>([]);
  const [resultData, setResultData] = useState<number[]>([]);

  useEffect(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthDataMap: { [key: string]: { inkomst: number; utgift: number } } = {};

    chartData.forEach((row) => {
      const parsedDate = new Date(`${row.month}T00:00:00Z`);
      if (isNaN(parsedDate.getTime())) return;

      const monthIndex = parsedDate.getMonth();
      const label = monthNames[monthIndex];

      if (!monthDataMap[label]) {
        monthDataMap[label] = { inkomst: 0, utgift: 0 };
      }

      monthDataMap[label].inkomst += row.inkomst;
      monthDataMap[label].utgift += row.utgift;
    });

    const finalLabels = monthNames.filter((m) => monthDataMap[m]);
    const inkomstValues = finalLabels.map((label) => monthDataMap[label].inkomst);
    const utgiftValues = finalLabels.map((label) => -monthDataMap[label].utgift);
    const resultValues = finalLabels.map(
      (label) => monthDataMap[label].inkomst - monthDataMap[label].utgift
    );

    setLabels(finalLabels);
    setInkomstData(inkomstValues);
    setUtgiftData(utgiftValues);
    setResultData(resultValues);
  }, [chartData]);

  const data = {
    labels,
    datasets: [
      {
        label: "Resultat",
        data: resultData,
        type: "line" as const,
        borderColor: "rgb(255, 215, 0)",
        backgroundColor: "rgb(255, 215, 0)",
        fill: false,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
        stack: undefined,
      },
      {
        label: "Intäkter", // ← ändrat här
        data: inkomstData,
        backgroundColor: "rgb(0, 128, 128)",
        stack: "stack1",
      },
      {
        label: "Kostnader", // ← redan ändrat innan
        data: utgiftData,
        backgroundColor: "rgb(255, 99, 132)",
        stack: "stack1",
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    indexAxis: "x" as const,
    responsive: true,
    layout: {
      padding: {
        top: 20, // luft överst
        bottom: 30, // extra luft under legenden
      },
    },
    scales: {
      x: {
        stacked: true,
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
        stacked: true,
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
          padding: 20, // mer space under varje legendrad
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
  };

  return (
    <div className="w-full m-0 p-0">
      <div className="relative w-full h-[75vh] p-0 m-0">
        <Chart type="bar" datasetIdKey="id" options={options} data={data} />
      </div>
      <div className="flex justify-center my-6">
        <select
          id="year"
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
          className="px-4 py-2 font-bold text-white rounded cursor-pointer bg-cyan-600 hover:bg-cyan-700"
        >
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2020">2020</option>
        </select>
      </div>
    </div>
  );
}
