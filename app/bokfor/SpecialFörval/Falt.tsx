"use client";

import React from "react";

export type FaltProps = {
  label: string;
  type?: "text" | "number" | "date" | "textarea";
  value: string;
  onChange?: (val: string) => void;
  readonly?: boolean;
};

export default function Falt({
  label,
  type = "text",
  value,
  onChange,
  readonly = false,
}: FaltProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-semibold text-gray-300">{label}</label>

      {readonly ? (
        <div className="px-3 py-2 text-sm text-gray-400 bg-slate-800 rounded">
          {value || <span className="italic text-gray-500">—</span>}
        </div>
      ) : type === "textarea" ? (
        <textarea
          value={value}
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700"
          rows={3}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          className="w-full p-2 rounded bg-slate-900 text-white border border-slate-700"
        />
      )}
    </div>
  );
}
