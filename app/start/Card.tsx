import React from "react";

interface FrontCardProps {
  title: string;
  data: number;
}

export default function Card({ title, data }: FrontCardProps) {
  return (
    <div className="flex-1 min-w-[180px] rounded-xl border-4 bg-cyan-950">
      <div className="p-5 text-4xl font-bold text-white">{title}</div>
      <div className="p-6 text-2xl font-bold bg-white text-sky-950">{data.toFixed(2)}</div>
    </div>
  );
}
