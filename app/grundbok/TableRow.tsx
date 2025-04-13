"use client";

import React from "react";

interface TableRowProps {
  item: {
    transaktions_id: number;
    transaktionsdatum: string;
    fil?: string;
    kontobeskrivning: string;
    belopp: number;
    kommentar?: string;
  };
  handleRowClick: (id: number) => void;
  activeId: number | null;
  details: {
    transaktionspost_id: number;
    kontonummer: string;
    beskrivning: string;
    debet: number;
    kredit: number;
  }[];
  rowIndex: number;
}

export default function TableRow({
  item,
  handleRowClick,
  activeId,
  details,
  rowIndex,
}: TableRowProps) {
  const isExpanded = activeId === item.transaktions_id;
  const isLoading = isExpanded && details.length === 0;
  const rowColorClass = rowIndex % 2 === 0 ? "bg-gray-950" : "bg-gray-900";

  return (
    <>
      <tr
        onClick={() => handleRowClick(item.transaktions_id)}
        className={`cursor-pointer transition-colors duration-200 ${rowColorClass} hover:bg-gray-700`}
      >
        <td className="p-5 text-left">{item.transaktions_id}</td>
        <td className="p-5 text-left">{item.transaktionsdatum}</td>
        <td className="hidden p-5 text-left md:table-cell">{item.fil}</td>
        <td className="p-5 text-left">{item.kontobeskrivning}</td>
        <td className="p-5 text-left">
          {item.belopp.toLocaleString("sv-SE", {
            style: "currency",
            currency: "SEK",
          })}
        </td>
        <td className="hidden p-5 text-left md:table-cell">{item.kommentar}</td>
      </tr>

      {isExpanded && (
        <tr className="bg-slate-800">
          <td colSpan={6} className="p-0">
            {isLoading ? (
              <div className="flex justify-center p-5">
                <div className="w-16 h-16 border-t-4 border-cyan-600 border-solid rounded-full animate-spin" />
              </div>
            ) : (
              <div className="p-5">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-600">
                    <tr>
                      <th className="text-left py-2">Konto</th>
                      <th className="text-right py-2">Debet</th>
                      <th className="text-right py-2">Kredit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((detail) => (
                      <tr key={detail.transaktionspost_id} className="border-b border-slate-700">
                        <td className="py-2 pr-4">
                          {detail.kontonummer} – {detail.beskrivning}
                        </td>
                        <td className="py-2 pr-4 text-right">
                          {detail.debet !== 0
                            ? detail.debet.toLocaleString("sv-SE", {
                                style: "currency",
                                currency: "SEK",
                              })
                            : "–"}
                        </td>
                        <td className="py-2 text-right">
                          {detail.kredit !== 0
                            ? detail.kredit.toLocaleString("sv-SE", {
                                style: "currency",
                                currency: "SEK",
                              })
                            : "–"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
