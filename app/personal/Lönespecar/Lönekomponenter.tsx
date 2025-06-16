"use client";

import { useEffect, useState, useMemo } from "react";
import { hämtaExtrarader, taBortExtrarad } from "../actions";
import ExtraRader from "./Extrarader/Extrarader";

type LönekomponenterProps = {
  lönespec: any;
  grundlön?: number;
  övertid?: number;
  bruttolön?: number;
  socialaAvgifter?: number;
  skatt?: number;
  onBeräkningarUppdaterade?: (lönespecId: string, beräkningar: any) => void;
};

export default function Lönekomponenter({
  lönespec,
  grundlön,
  övertid,
  bruttolön,
  socialaAvgifter,
  skatt,
  onBeräkningarUppdaterade,
}: LönekomponenterProps) {
  const [extrarader, setExtrarader] = useState<any[]>([]);

  useEffect(() => {
    if (lönespec?.id) {
      hämtaExtrarader(lönespec.id).then(setExtrarader);
    }
  }, [lönespec?.id]);

  // Beräkna nya värden baserat på extrarader
  const beräknadeVärden = useMemo(() => {
    const originalGrundlön = grundlön ?? lönespec?.grundlön ?? lönespec?.bruttolön ?? 35000;
    const originalÖvertid = övertid ?? lönespec?.övertid ?? 0;

    // Summera alla extrarader
    const extraradsSumma = extrarader.reduce((total, rad) => {
      const antal = parseFloat(rad.kolumn2) || 1;
      const aSek = parseFloat(rad.kolumn3) || 0;
      return total + antal * aSek;
    }, 0);

    // Beräkna bruttolön (grundlön + övertid + extrarader)
    const nyBruttolön = originalGrundlön + originalÖvertid + extraradsSumma;

    // Sociala avgifter: 31,42% av bruttolön
    const nySocialaAvgifter = nyBruttolön * 0.3142;

    // Skatt: Bokios sats verkar vara ~21,97% (7691/35000 = 0.2197)
    const nySkatt = nyBruttolön * 0.2197;

    // Nettolön = bruttolön - skatt
    const nyNettolön = nyBruttolön - nySkatt;

    // Lönekostnad = bruttolön + sociala avgifter
    const nyLönekostnad = nyBruttolön + nySocialaAvgifter;

    return {
      grundlön: originalGrundlön,
      övertid: originalÖvertid,
      extraradsSumma,
      bruttolön: nyBruttolön,
      socialaAvgifter: nySocialaAvgifter,
      skatt: nySkatt,
      nettolön: nyNettolön,
      lönekostnad: nyLönekostnad,
    };
  }, [grundlön, övertid, lönespec, extrarader]);

  // Skicka beräkningar till parent när de ändras
  useEffect(() => {
    if (onBeräkningarUppdaterade && lönespec?.id) {
      onBeräkningarUppdaterade(lönespec.id, beräknadeVärden);
    }
  }, [beräknadeVärden, onBeräkningarUppdaterade, lönespec?.id]);

  // Hantera borttagning av extrarad
  const handleTaBortExtrarad = async (extraradId: number) => {
    if (confirm("Är du säker på att du vill ta bort denna rad?")) {
      try {
        await taBortExtrarad(extraradId);
        if (lönespec?.id) {
          hämtaExtrarader(lönespec.id).then(setExtrarader);
        }
      } catch (error) {
        console.error("Fel vid borttagning av extrarad:", error);
        alert("Kunde inte ta bort raden");
      }
    }
  };

  return (
    <div className="bg-slate-700 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Lönekomponenter</h3>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left text-gray-400">Benämning</th>
            <th className="text-center text-gray-400"></th>
            <th className="text-right text-gray-400">Belopp</th>
          </tr>
        </thead>
        <tbody>
          {/* TOTALER FÖRST */}
          <tr className="border-b border-slate-600/70">
            <td className="text-white font-medium py-2">Lönekostnad</td>
            <td className="text-center py-2"></td>
            <td className="text-right text-white font-medium py-2">
              {beräknadeVärden.lönekostnad.toLocaleString("sv-SE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              kr
            </td>
          </tr>

          <tr className="border-b border-slate-600/70">
            <td className="text-white font-medium py-2">Sociala avgifter</td>
            <td className="text-center py-2"></td>
            <td className="text-right text-white font-medium py-2">
              {beräknadeVärden.socialaAvgifter.toLocaleString("sv-SE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              kr
            </td>
          </tr>

          <tr className="border-b border-slate-600/70">
            <td className="text-white font-medium py-2">Bruttolön</td>
            <td className="text-center py-2"></td>
            <td className="text-right text-white font-medium py-2">
              {beräknadeVärden.bruttolön.toLocaleString("sv-SE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              kr
            </td>
          </tr>

          <tr className="border-b border-slate-600/70">
            <td className="text-white font-medium py-2">Skatt</td>
            <td className="text-center py-2"></td>
            <td className="text-right text-white font-medium py-2">
              {beräknadeVärden.skatt.toLocaleString("sv-SE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              kr
            </td>
          </tr>

          {/* EXTRARADER */}
          {extrarader.map((rad, i) => {
            // Beräkna beloppet från antal * à SEK
            const antal = parseFloat(rad.kolumn2) || 1;
            const aSek = parseFloat(rad.kolumn3) || 0;
            const belopp = antal * aSek;

            return (
              <tr
                key={rad.id || i}
                className="border-b border-slate-600/70 hover:bg-slate-600 cursor-pointer group relative"
              >
                <td className="text-gray-300 py-2">{rad.kolumn1}</td>
                <td className="text-center text-gray-300 py-2">{rad.kolumn4 || ""}</td>
                <td className="text-right text-white font-medium py-2 relative">
                  {belopp.toLocaleString("sv-SE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  kr
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaBortExtrarad(rad.id);
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400 text-sm bg-slate-800 rounded px-1"
                    title="Ta bort"
                  >
                    ❌
                  </button>
                </td>
              </tr>
            );
          })}

          {/* NETTOLÖN - VISA ALLTID */}
          <tr className="border-b border-slate-600/70">
            <td className="text-white font-medium py-2">Nettolön</td>
            <td className="text-center py-2"></td>
            <td className="text-right text-white font-medium py-2">
              {beräknadeVärden.nettolön.toLocaleString("sv-SE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              kr
            </td>
          </tr>
        </tbody>
      </table>

      <ExtraRader
        lönespecId={lönespec?.id}
        grundlön={beräknadeVärden.grundlön}
        onNyRad={() => lönespec?.id && hämtaExtrarader(lönespec.id).then(setExtrarader)}
      />
    </div>
  );
}
