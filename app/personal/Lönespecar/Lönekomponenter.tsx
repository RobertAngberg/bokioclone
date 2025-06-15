"use client";

import { useEffect, useState } from "react";
import { hämtaExtrarader } from "../actions";
import ExtraRader from "./Extrarader/Extrarader";

type LönekomponenterProps = {
  lönespec: any;
  grundlön?: number;
  övertid?: number;
  bruttolön?: number;
  socialaAvgifter?: number;
  skatt?: number;
};

export default function Lönekomponenter({
  lönespec,
  grundlön,
  övertid,
  bruttolön,
  socialaAvgifter,
  skatt,
}: LönekomponenterProps) {
  const [extrarader, setExtrarader] = useState<any[]>([]);

  useEffect(() => {
    if (lönespec?.id) {
      hämtaExtrarader(lönespec.id).then(setExtrarader);
    }
  }, [lönespec?.id]);

  // Visa alltid dessa rader överst
  const lönRader = [
    {
      label: "Grundlön",
      antal: "",
      aSEK: "",
      kommentar: "",
      value: grundlön ?? lönespec?.grundlön ?? lönespec?.bruttolön ?? 0,
    },
    {
      label: "Övertid",
      antal: "",
      aSEK: "",
      kommentar: "",
      value: övertid ?? lönespec?.övertid ?? 0,
    },
    {
      label: "Bruttolön",
      antal: "",
      aSEK: "",
      kommentar: "",
      value: bruttolön ?? lönespec?.bruttolön ?? 0,
    },
    {
      label: "Sociala avgifter",
      antal: "",
      aSEK: "",
      kommentar: "",
      value: socialaAvgifter ?? lönespec?.sociala_avgifter ?? 0,
    },
    {
      label: "Skatt",
      antal: "",
      aSEK: "",
      kommentar: "",
      value: skatt ?? lönespec?.skatt ?? 0,
    },
    {
      label: "Nettolön",
      antal: "",
      aSEK: "",
      kommentar: "",
      value: lönespec?.nettolön ?? 0,
    },
  ];

  return (
    <div className="bg-slate-700 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Lönekomponenter</h3>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-gray-400">Benämning</th>
            <th className="text-right text-gray-400">Antal</th>
            <th className="text-right text-gray-400">à SEK</th>
            <th className="text-right text-gray-400">Kommentar</th>
          </tr>
        </thead>
        <tbody>
          {/* LÖNERADER */}
          {lönRader.map((rad, i) => (
            <tr key={rad.label} className="border-b border-slate-600">
              <td className="text-gray-300 py-2">{rad.label}</td>
              <td className="text-right text-gray-300 py-2">{rad.antal}</td>
              <td className="text-right text-gray-300 py-2">{rad.aSEK}</td>
              <td className="text-right text-white font-medium py-2">
                {rad.value !== "" ? rad.value.toLocaleString("sv-SE") : ""}
              </td>
            </tr>
          ))}
          {/* EXTRARADER */}
          {extrarader.map((rad, i) => (
            <tr key={rad.id || i} className="border-b border-slate-600">
              <td className="text-gray-300 py-2">{rad.kolumn1}</td>
              <td className="text-right text-gray-300 py-2">{rad.kolumn2}</td>
              <td className="text-right text-gray-300 py-2">{rad.kolumn3}</td>
              <td className="text-right text-white font-medium py-2">{rad.kolumn4}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ExtraRader
        lönespecId={lönespec?.id}
        onNyRad={() => lönespec?.id && hämtaExtrarader(lönespec.id).then(setExtrarader)}
      />
    </div>
  );
}
