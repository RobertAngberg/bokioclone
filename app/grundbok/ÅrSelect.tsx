import React from "react";

interface YearSelectProps {
  setYear: (year: string) => void;
}

function YearSelect({ setYear }: YearSelectProps) {
  return (
    <select
      className="px-4 py-2 font-bold text-white rounded cursor-pointer bg-cyan-600 hover:bg-cyan-700"
      id="year"
      onChange={(e) => setYear(e.target.value)}
    >
      <option value="2024">2025</option>
      <option value="2024">2024</option>
      <option value="2023">2023</option>
      <option value="2022">2022</option>
      <option value="2021">2021</option>
      <option value="2020">2020</option>
    </select>
  );
}

export { YearSelect };
