"use client";

import React from "react";
import TableRow from "./TableRow";

export interface HistoryItem {
  transaktions_id: number;
  transaktionsdatum: string;
  kontobeskrivning: string;
  belopp: number;
  kommentar?: string;
  fil?: string;
}

export interface TransactionDetail {
  transaktionspost_id: number;
  kontonummer: string;
  beskrivning: string;
  debet: number;
  kredit: number;
}

interface TableProps {
  historyData: HistoryItem[];
  handleRowClick: (id: number) => void;
  activeId: number | null;
  details: TransactionDetail[];
  isLoading?: boolean;
}

export default function Table({
  historyData,
  handleRowClick,
  activeId,
  details,
  isLoading,
}: TableProps) {
  return (
    <div className="max-w-5xl mx-auto overflow-x-auto border border-slate-700 rounded-lg shadow">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-slate-800 text-left">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Datum</th>
            <th className="hidden p-3 md:table-cell">Fil</th>
            <th className="p-3">Konto</th>
            <th className="p-3">Belopp</th>
            <th className="hidden p-3 md:table-cell">Kommentar</th>
          </tr>
        </thead>
        <tbody>
          {historyData.map((item, index) => (
            <TableRow
              key={item.transaktions_id}
              item={item}
              handleRowClick={handleRowClick}
              activeId={activeId}
              details={details}
              rowIndex={index}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
