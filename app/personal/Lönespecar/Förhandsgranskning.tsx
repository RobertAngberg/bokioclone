//#region
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { hämtaFöretagsprofil } from "../actions";

interface FörhandsgranskningProps {
  lönespec: any;
  anställd: any;
  företagsprofil: any;
  onStäng: () => void;
}
//#endregion

export default function Förhandsgranskning({
  lönespec,
  anställd,
  företagsprofil,
  onStäng,
}: FörhandsgranskningProps) {
  //#region State och vars
  const [isExporting, setIsExporting] = useState(false);
  const [företag, setFöretag] = useState<any>(företagsprofil);

  // Beräknade värden
  const bruttolön = parseFloat(lönespec?.bruttolön || 0);
  const skatt = parseFloat(lönespec?.skatt || 0);
  const nettolön = parseFloat(lönespec?.nettolön || 0);
  const socialaAvgifter = parseFloat(lönespec?.sociala_avgifter || 0);
  const totalLönekostnad = bruttolön + socialaAvgifter;

  const utbetalningsDatum = new Date(lönespec?.år || 2025, (lönespec?.månad || 1) - 1, 25);
  const periodStart = new Date(lönespec?.period_start || lönespec?.skapad);
  const periodSlut = new Date(lönespec?.period_slut || lönespec?.skapad);

  const månadsNamn = new Date(
    lönespec?.år || 2025,
    (lönespec?.månad || 1) - 1,
    1
  ).toLocaleDateString("sv-SE", { month: "long", year: "numeric" });
  //#endregion

  //#region Hämta företagsinfo om inte redan finns
  useEffect(() => {
    async function hämtaFöretag() {
      try {
        if (!företag && anställd?.user_id) {
          const företagsdata = await hämtaFöretagsprofil(anställd.user_id);
          setFöretag(företagsdata);
        }
      } catch (error) {
        console.error("❌ Fel vid hämtning av företagsinfo:", error);
      }
    }
    hämtaFöretag();
  }, [företag, anställd?.user_id]);
  //#endregion

  //#region Exportera PDF med direkt html2canvas + jsPDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("lonespec-print-area");
      if (!element) throw new Error("Element not found");

      // Skapa canvas direkt från originalet först för test
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: true, // Sätt på logging för debug
        allowTaint: true, // Tillåt "tainted" canvas
        foreignObjectRendering: false, // Stäng av för bättre kompatibilitet
        imageTimeout: 15000,
        removeContainer: false,
      });

      // Kontrollera om canvas har data
      const imageData = canvas.toDataURL("image/png");
      if (
        imageData ===
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
      ) {
        throw new Error("Canvas är tom!");
      }

      // Skapa PDF
      const pdf = new jsPDF("portrait", "mm", "a4");

      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth - 15; // Mindre marginaler (7.5mm på varje sida)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Lägg till bild i PDF med mindre top margin
      pdf.addImage(imageData, "PNG", 7.5, 5, imgWidth, imgHeight); // Top margin 5mm istället för 10mm

      // Spara
      pdf.save(
        `lonespec-${anställd?.förnamn}-${anställd?.efternamn}-${månadsNamn.replace(" ", "-")}.pdf`
      );
    } catch (error) {
      console.error("❌ Error exporting PDF:", error);
      if (error instanceof Error) {
        alert(`❌ Kunde inte exportera PDF: ${error.message}`);
      } else {
        alert("❌ Kunde inte exportera PDF: Okänt fel");
      }
    } finally {
      setIsExporting(false);
    }
  };
  //#endregion

  if (!lönespec || !anställd) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        {/* Modal med knappar */}
        <div className="sticky top-0 bg-slate-800 text-white p-4 flex justify-end items-center z-10">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded transition-colors"
          >
            {isExporting ? "Exporterar..." : "📤 Exportera PDF"}
          </button>
          <button
            onClick={onStäng}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors ml-2"
          >
            ✕ Stäng
          </button>
        </div>

        {/* PDF-innehåll */}
        <div
          id="lonespec-print-area"
          className="bg-white text-black w-full max-w-[210mm] mx-auto p-8 text-xs leading-tight min-h-[297mm] flex flex-col"
          style={{ backgroundColor: "#ffffff", color: "#000000" }}
        >
          {/* Anställd info - Header högerställd */}
          <div className="text-right mb-6 pb-4">
            <div className="text-lg font-bold mb-2 text-black">
              {anställd.efternamn?.toUpperCase()}, {anställd.förnamn?.toUpperCase()}
            </div>
            <div className="text-xs space-y-0.5 text-black">
              <div>{anställd.adress}</div>
              <div>
                {anställd.postnummer} {anställd.ort}
              </div>
            </div>
          </div>

          {/* Lönespec titel och period */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-5 text-black">
              LÖNESPECIFIKATION för {månadsNamn.toLowerCase()}
            </h1>
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto text-xs">
              <div className="text-center">
                <div className="font-semibold text-black">Personnummer</div>
                <div className="text-black">({anställd.personnummer})</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-black">Bankkonto</div>
                <div className="text-black">
                  {anställd.clearingnummer}-{anställd.bankkonto}
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-black">Löneperiod</div>
                <div className="text-black">
                  {periodStart.toLocaleDateString("sv-SE")} -{" "}
                  {periodSlut.toLocaleDateString("sv-SE")}
                </div>
              </div>
            </div>
          </div>

          {/* Lönetabell */}
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-3 py-2 text-left font-bold text-black text-xs">
                    Benämning
                  </th>
                  <th className="border border-gray-400 px-3 py-2 text-center font-bold text-black text-xs">
                    Antal
                  </th>
                  <th className="border border-gray-400 px-3 py-2 text-right font-bold text-black text-xs">
                    Kostnad
                  </th>
                  <th className="border border-gray-400 px-3 py-2 text-right font-bold text-black text-xs">
                    Summa
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-3 py-2 text-black text-xs">Lön</td>
                  <td className="border border-gray-400 px-3 py-2 text-center text-black text-xs">
                    1 Månad
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-right text-black text-xs">
                    {bruttolön.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
                  </td>
                  <td className="border border-gray-400 px-3 py-2 text-right font-semibold text-black text-xs">
                    {bruttolön.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
                  </td>
                </tr>
                {/* Lägg till övertid om finns */}
                {parseFloat(lönespec?.övertid || 0) > 0 && (
                  <tr>
                    <td className="border border-gray-400 px-3 py-2 text-black text-xs">Övertid</td>
                    <td className="border border-gray-400 px-3 py-2 text-center text-black text-xs">
                      {parseFloat(lönespec.övertid_timmar || 0)} h
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-right text-black text-xs">
                      {parseFloat(lönespec.övertid).toLocaleString("sv-SE", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      kr
                    </td>
                    <td className="border border-gray-400 px-3 py-2 text-right font-semibold text-black text-xs">
                      {parseFloat(lönespec.övertid).toLocaleString("sv-SE", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      kr
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Sammanfattning sektion */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Vänster kolumn - Totaler */}
            <div className="space-y-3">
              <div className="border border-gray-400 rounded p-3">
                <h4 className="font-bold mb-2 text-sm text-black">Totalt</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-black text-xs">
                    <span className="font-semibold">Lönekostnad</span>
                    <span className="font-bold">{totalLönekostnad.toLocaleString("sv-SE")} kr</span>
                  </div>
                  <div className="flex justify-between text-black text-xs">
                    <span className="font-semibold">Bruttolön</span>
                    <span className="font-bold">{bruttolön.toLocaleString("sv-SE")} kr</span>
                  </div>
                  <div className="flex justify-between text-xs text-black">
                    <span>varav sociala avgifter</span>
                    <span>{socialaAvgifter.toLocaleString("sv-SE")} kr</span>
                  </div>
                  <div className="flex justify-between text-xs text-black">
                    <span>varav Skatt</span>
                    <span>{skatt.toLocaleString("sv-SE")} kr</span>
                  </div>
                </div>
              </div>

              {/* Utbetalning */}
              <div className="border border-gray-400 rounded p-3 bg-green-50">
                <div className="text-xs mb-1 text-black">
                  Utbetalas: {utbetalningsDatum.toLocaleDateString("sv-SE")}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-black">Nettolön</span>
                  <span className="text-xl font-bold text-green-700">
                    {nettolön.toLocaleString("sv-SE")} kr
                  </span>
                </div>
              </div>
            </div>

            {/* Höger kolumn */}
            <div className="space-y-3">
              {/* Semesterdagar */}
              <div className="border border-gray-400 rounded p-3">
                <h4 className="font-bold mb-2 text-black text-sm">Semesterdagar</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-semibold text-black">Betalda</div>
                    <div className="text-sm font-bold text-black">
                      {parseFloat(lönespec?.semester_uttag || 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-black">Sparade</div>
                    <div className="text-sm font-bold text-black">
                      {parseFloat(anställd?.sparade_dagar || 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-black">Förskott</div>
                    <div className="text-sm font-bold text-black">
                      {parseFloat(anställd?.använda_förskott || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skatt beräknad på */}
              <div className="border border-gray-400 rounded p-3">
                <h4 className="font-bold mb-2 text-black text-sm">Skatt beräknad på</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-black">Skattetabell</div>
                    <div className="text-sm font-bold text-black">{anställd?.skattetabell}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-black">Skattekolumn</div>
                    <div className="text-sm font-bold text-black">{anställd?.skattekolumn}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Totalt detta år */}
          <div className="border border-gray-400 rounded p-3 mb-6">
            <h4 className="font-bold mb-2 text-sm text-black">Totalt detta år</h4>
            <div className="grid grid-cols-3 gap-6 text-xs">
              <div className="text-center">
                <div className="font-semibold text-black mb-1">Brutto</div>
                <div className="text-sm font-bold text-black">
                  {bruttolön.toLocaleString("sv-SE")} kr
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-black mb-1">Förmåner</div>
                <div className="text-sm font-bold text-black">0,00 kr</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-black mb-1">Skatt</div>
                <div className="text-sm font-bold text-black">
                  {skatt.toLocaleString("sv-SE")} kr
                </div>
              </div>
            </div>
          </div>

          {/* Arbetstid info om finns */}
          {(parseFloat(lönespec?.arbetade_timmar || 0) > 0 ||
            parseFloat(lönespec?.övertid_timmar || 0) > 0) && (
            <div className="border border-gray-400 rounded p-3 mb-6">
              <h4 className="font-bold mb-2 text-sm text-black">Arbetstid denna period</h4>
              <div className="grid grid-cols-4 gap-3 text-xs">
                {parseFloat(lönespec?.arbetade_timmar || 0) > 0 && (
                  <div className="text-center">
                    <div className="font-semibold text-black">Arbetade timmar</div>
                    <div className="text-sm font-bold text-black">
                      {parseFloat(lönespec.arbetade_timmar).toLocaleString("sv-SE")}
                    </div>
                  </div>
                )}
                {parseFloat(lönespec?.övertid_timmar || 0) > 0 && (
                  <div className="text-center">
                    <div className="font-semibold text-black">Övertid timmar</div>
                    <div className="text-sm font-bold text-black">
                      {parseFloat(lönespec.övertid_timmar).toLocaleString("sv-SE")}
                    </div>
                  </div>
                )}
                {parseFloat(lönespec?.sjukfrånvaro_dagar || 0) > 0 && (
                  <div className="text-center">
                    <div className="font-semibold text-black">Sjukfrånvaro</div>
                    <div className="text-sm font-bold text-black">
                      {parseFloat(lönespec.sjukfrånvaro_dagar).toLocaleString("sv-SE")} dagar
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer - Centrerad företagsinfo */}
          <div className="mt-auto pt-4 border-t border-gray-400">
            <div className="text-center text-xs text-black">
              <div className="text-sm font-bold mb-1 text-black">
                {företag?.företagsnamn || "DITT FÖRETAG AB"}
              </div>
              <div>
                {företag?.adress || "Alléstigen 7B"}, {företag?.postnummer || "72214"}{" "}
                {företag?.stad || "Västerås"}
              </div>
              <div>Org.nr: {företag?.organisationsnummer || "559999-9999"}</div>
              <div>{företag?.epost || "info@dittforetag.se"}</div>
              {företag?.telefonnummer && <div>Tel: {företag.telefonnummer}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
