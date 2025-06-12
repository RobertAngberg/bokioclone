//#region
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { generatePDFFromElement } from "../../_utils/pdfGenerator";
import { hämtaFöretagsprofil } from "../actions";

interface FörhandsgranskningProps {
  anställd: any;
  bruttolön: number;
  skatt: number;
  nettolön: number;
  socialSkatt: number;
  totalLönekostnad: number;
  utbetalning: string;
  löneperiod: string;
  isOpen: boolean;
  onClose: () => void;
}
//#endregion

export default function Förhandsgranskning({
  anställd,
  bruttolön,
  skatt,
  nettolön,
  socialSkatt,
  totalLönekostnad,
  utbetalning,
  löneperiod,
  isOpen,
  onClose,
}: FörhandsgranskningProps) {
  //#region State och vars
  const [isExporting, setIsExporting] = useState(false);
  const [företag, setFöretag] = useState<any>(null);
  const personnummer = anställd.personnummer;
  const bankkonto = `${anställd.clearingnummer}-${anställd.bankkonto}`;
  //#endregion

  //#region Hämta företagsinfo
  useEffect(() => {
    async function hämtaFöretag() {
      try {
        const företagsdata = await hämtaFöretagsprofil(anställd.user_id);
        setFöretag(företagsdata);
      } catch (error) {
        console.error("❌ Fel vid hämtning av företagsinfo:", error);
      }
    }

    if (isOpen && anställd.user_id) {
      hämtaFöretag();
    }
  }, [isOpen, anställd.user_id]);
  //#endregion

  //#region Exportera PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = await generatePDFFromElement({
        elementId: "lonespec-print-area",
      });
      pdf.save(
        `lonespec-${anställd.förnamn}-${anställd.efternamn}-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("❌ Error exporting PDF:", error);
      alert("❌ Kunde inte exportera PDF");
    } finally {
      setIsExporting(false);
    }
  };
  //#endregion

  // Visa inte förhandsgranskningen om ej asked for
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-slate-800 text-white p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">Förhandsgranskning - Lönespec</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded"
            >
              {isExporting ? "Exporterar..." : "📤 Exportera PDF"}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              ✕ Stäng
            </button>
          </div>
        </div>

        {/* PDF-innehåll */}
        <div
          id="lonespec-print-area"
          className="bg-white text-black w-[210mm] h-[297mm] p-10 text-[11pt] leading-relaxed overflow-hidden flex flex-col mx-auto"
          style={{ backgroundColor: "#ffffff", minHeight: "297mm" }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Lönespec</h1>
              <p className="text-sm text-gray-600 mb-4">
                {new Date().toLocaleDateString("sv-SE", { month: "long", year: "numeric" })}
              </p>
              <div className="text-sm">
                <strong>Löneperiod:</strong>
                <br />
                <span>{löneperiod}</span>
              </div>
            </div>
            {/* ANSTÄLLD-INFO uppe till höger */}
            <div className="text-right text-sm">
              <div className="font-bold">
                {anställd.efternamn?.toUpperCase()}, {anställd.förnamn?.toUpperCase()}
              </div>
              <div>{anställd.adress}</div>
              <div>
                {anställd.postnummer} {anställd.ort}
              </div>
              <div>{anställd.mail}</div>
              <div>Bankkonto: {bankkonto}</div>
            </div>
          </div>

          {/* Lönetabell */}
          <div className="border border-gray-300 rounded overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-bold">Benämning</th>
                  <th className="px-4 py-2 text-left font-bold">Antal</th>
                  <th className="px-4 py-2 text-left font-bold">Kostnad</th>
                  <th className="px-4 py-2 text-left font-bold">Summa</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-2">Lön</td>
                  <td className="px-4 py-2">1 Månad</td>
                  <td className="px-4 py-2">
                    {bruttolön.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
                  </td>
                  <td className="px-4 py-2 font-bold">
                    {bruttolön.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sammanfattning */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              {/* Totalt */}
              <div className="border border-gray-300 rounded p-4">
                <h4 className="font-bold mb-2">Totalt</h4>
                <div className="flex justify-between text-sm">
                  <span>Lönekostnad</span>
                  <span className="font-bold">
                    {totalLönekostnad.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
                  </span>
                </div>
              </div>

              {/* Utbetalning */}
              <div className="border border-gray-300 rounded p-4">
                <div className="text-sm mb-2">Utbetalas: {utbetalning}</div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Nettolön</span>
                  <span className="text-xl font-bold">{nettolön.toLocaleString("sv-SE")} kr</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Semesterdagar */}
              <div className="border border-gray-300 rounded p-4">
                <h4 className="font-bold mb-2">Semesterdagar</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Betalda</span>
                    <span>0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sparade</span>
                    <span>0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Förskott</span>
                    <span>0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Totalt detta år */}
          <div className="border border-gray-300 rounded p-4 mb-6">
            <h4 className="font-bold mb-2">Totalt detta år</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Brutto</span>
                <span>{bruttolön.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr</span>
              </div>
              <div className="flex justify-between">
                <span>Förmåner</span>
                <span>0,00 kr</span>
              </div>
              <div className="flex justify-between">
                <span>Skatt</span>
                <span>{skatt.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr</span>
              </div>
            </div>
          </div>

          {/* Footer med företagsinfo från DB + telefon - KRAMA BOTTEN */}
          <div className="mt-auto pt-6 border-t border-gray-300 text-center text-sm text-gray-600">
            <div className="font-bold mb-1">{företag?.företagsnamn || "DITT FÖRETAG AB"}</div>
            <div>
              {företag?.adress || "Företagsgatan 123"}, {företag?.postnummer || "12345"}{" "}
              {företag?.stad || "Stockholm"}
            </div>
            <div>Organisationsnummer: {företag?.organisationsnummer || "559999-9999"}</div>
            <div>{företag?.epost || "info@dittforetag.se"}</div>
            {företag?.telefonnummer && <div>Tel: {företag.telefonnummer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
