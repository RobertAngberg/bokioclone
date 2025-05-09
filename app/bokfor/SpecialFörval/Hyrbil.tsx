// #region Huvud
"use client";

import { useState } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import TextFält from "../../_components/TextFält";
import KnappFullWidth from "../../_components/KnappFullWidth";
import DatePicker from "react-datepicker";
import { formatSEK } from "../../_utils/format";
import { sammanfattaExtrafält } from "../../_utils/extrafalt";
import { ÅÅÅÅMMDDTillDate, dateTillÅÅÅÅMMDD } from "../../_utils/datum";
import { useAutofyllFrånPdf } from "../../_hooks/useAutofyllFrånPdf";

interface Props {
  mode: "steg2" | "steg3";
  belopp?: number | null;
  setBelopp?: (val: number | null) => void;
  transaktionsdatum?: string | null;
  setTransaktionsdatum?: (val: string | null) => void;
  kommentar?: string | null;
  setKommentar?: (val: string | null) => void;
  setCurrentStep?: (val: number) => void;
  fil: File | null; // ⬅️ inte längre optional
  setFil: (val: File | null) => void; // ⬅️ inte längre optional
  pdfUrl: string | null; // ⬅️ inte längre optional
  setPdfUrl: (val: string) => void; // ⬅️ inte längre optional
  extrafält: Record<string, { label: string; debet: number; kredit: number }>;
  setExtrafält?: (val: Record<string, { label: string; debet: number; kredit: number }>) => void;
  formRef?: React.RefObject<HTMLFormElement>;
  handleSubmit?: (formData: FormData) => void;
}
// #endregion

export default function Hyrbil({
  mode,
  belopp,
  setBelopp,
  transaktionsdatum,
  setTransaktionsdatum,
  kommentar,
  setKommentar,
  setCurrentStep,
  fil,
  setFil,
  pdfUrl,
  setPdfUrl,
  extrafält,
  setExtrafält,
  formRef,
  handleSubmit,
}: Props) {
  const [lokaltBelopp, setLokaltBelopp] = useState<number>(belopp ?? 0);
  const [datum, setDatum] = useState(transaktionsdatum ?? new Date().toISOString().split("T")[0]);
  const [kommentarText, setKommentarText] = useState(kommentar ?? "");

  useAutofyllFrånPdf({
    extractedBelopp: belopp,
    currentBelopp: lokaltBelopp,
    setBelopp: setLokaltBelopp,
    extractedDatum: transaktionsdatum,
    currentDatum: datum,
    setDatum,
  });

  const moms = +(lokaltBelopp * 0.25 * 0.5).toFixed(2);
  const netto = +(lokaltBelopp - moms).toFixed(2);
  const giltigt = lokaltBelopp > 0;

  function gåVidare() {
    setBelopp?.(lokaltBelopp);
    setTransaktionsdatum?.(datum);
    setKommentar?.(kommentarText);

    setExtrafält?.({
      "1930": { label: "Företagskonto / affärskonto", debet: 0, kredit: lokaltBelopp },
      "5820": { label: "Hyrbilskostnader", debet: netto, kredit: 0 },
      "2640": { label: "Ingående moms", debet: moms, kredit: 0 },
    });

    setCurrentStep?.(3);
  }

  if (mode === "steg2") {
    return (
      <section className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Hyrbil</h1>
        <div className="flex flex-col-reverse justify-between max-w-5xl mx-auto px-4 md:flex-row">
          <div className="w-full md:w-[40%] bg-slate-900 border border-gray-700 rounded-xl p-6">
            <LaddaUppFil
              fil={fil}
              setFil={setFil}
              setPdfUrl={setPdfUrl}
              setTransaktionsdatum={setTransaktionsdatum ?? (() => {})}
              setBelopp={setLokaltBelopp}
            />

            <TextFält
              label="Total kostnad inkl. moms"
              name="kostnad"
              value={lokaltBelopp.toString()}
              onChange={(e) => setLokaltBelopp(Number(e.target.value))}
              required
            />

            <p className="text-sm text-gray-400 mb-4">
              Avdragbar moms (25% × 50%): {formatSEK(moms)} kr
            </p>

            <label className="block text-sm font-medium text-white mb-2">Betaldatum</label>
            <DatePicker
              className="w-full p-2 mb-4 rounded bg-slate-900 text-white border border-gray-700"
              selected={ÅÅÅÅMMDDTillDate(datum)}
              onChange={(d) => setDatum(d ? dateTillÅÅÅÅMMDD(d) : "")}
              dateFormat="yyyy-MM-dd"
              locale="sv"
            />

            <TextFält
              label="Kommentar"
              name="kommentar"
              value={kommentarText}
              onChange={(e) => setKommentarText(e.target.value)}
              required={false}
            />

            <KnappFullWidth text="Gå vidare" onClick={gåVidare} disabled={!giltigt} />
          </div>

          <Forhandsgranskning fil={fil ?? null} pdfUrl={pdfUrl ?? null} />
        </div>
      </section>
    );
  }

  if (mode === "steg3") {
    const { rows, totalDebet, totalKredit } = sammanfattaExtrafält(extrafält);

    return (
      <main className="min-h-screen text-white bg-slate-950 px-4">
        <div className="max-w-5xl mx-auto bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg p-10">
          <h1 className="text-3xl mb-4 text-center">Steg 3: Kontrollera och slutför</h1>
          <p className="text-center font-bold text-xl mb-1">Hyrbil</p>
          <p className="text-center text-gray-300 mb-8">
            {datum ? new Date(`${datum}T00:00:00`).toLocaleDateString("sv-SE") : ""}
          </p>

          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-sm text-gray-300">
                <th className="px-2">Konto</th>
                <th className="px-2 text-right">Debet</th>
                <th className="px-2 text-right">Kredit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ konto, debet, kredit }) => (
                <tr key={konto} className="bg-slate-900 rounded">
                  <td className="px-2 py-1">{konto}</td>
                  <td className="px-2 py-1 text-right">{debet > 0 ? formatSEK(debet) : ""}</td>
                  <td className="px-2 py-1 text-right">{kredit > 0 ? formatSEK(kredit) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4 text-lg font-bold">
            <span className="mr-4">Totalt:</span>
            <span className="w-28 text-right">{formatSEK(totalDebet)}</span>
            <span className="w-28 text-right">{formatSEK(totalKredit)}</span>
          </div>

          <form ref={formRef} action={handleSubmit} className="mt-8">
            <KnappFullWidth text="Slutför bokföring" />
          </form>
        </div>
      </main>
    );
  }
}
