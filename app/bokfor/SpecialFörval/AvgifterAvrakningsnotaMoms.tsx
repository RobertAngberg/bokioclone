"use client";

import { useState } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Forhandsgranskning";
import Falt from "./Falt";
import SubmitButton from "./SubmitButton";

interface Props {
  mode: "steg2" | "steg3";
  belopp?: number | null;
  setBelopp?: (val: number | null) => void;
  transaktionsdatum?: string | null;
  setTransaktionsdatum?: (val: string | null) => void;
  kommentar?: string | null;
  setKommentar?: (val: string | null) => void;
  setCurrentStep?: (step: number) => void;
  fil?: File | null;
  setFil?: (file: File | null) => void;
  pdfUrl?: string | null;
  setPdfUrl?: (url: string | null) => void;
  extrafält: Record<string, { label: string; debet: number; kredit: number }>;
  setExtrafält?: (val: Record<string, { label: string; debet: number; kredit: number }>) => void;
  formRef?: React.RefObject<HTMLFormElement>;
  handleSubmit?: (formData: FormData) => void;
}

const round = (val: number): number => Math.round((val + Number.EPSILON) * 100) / 100;
const formatSEK = (val: number) => val.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

export default function AvgifterAvrakningsnotaMoms(props: Props) {
  const {
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
  } = props;

  const [beloppStr, setBeloppStr] = useState("");

  const momsSats = 0.25;

  // === STEG 2 ===
  if (mode === "steg2") {
    const handleNext = () => {
      const brutto = round(parseFloat(beloppStr || "0"));
      const moms = round(brutto * momsSats);
      const netto = round(brutto - moms);

      const extrafältObj = {
        "6064": {
          label: "Avgifter avräkningsnota",
          debet: netto,
          kredit: 0,
        },
        "2641": {
          label: "Ingående moms",
          debet: moms,
          kredit: 0,
        },
        "1930": {
          label: "Företagskonto",
          debet: 0,
          kredit: brutto,
        },
      };

      setExtrafält?.(extrafältObj);
      setBelopp?.(brutto);
      setCurrentStep?.(3);
    };

    return (
      <div className="p-6 bg-cyan-950 text-white border border-cyan-800 rounded-2xl shadow-lg">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Avgifter avräkningsnota</h1>
        <div className="flex flex-col-reverse justify-between max-w-5xl mx-auto md:flex-row px-4">
          <div className="w-full mb-10 md:w-[40%] md:mb-0 bg-slate-900 border border-gray-700 rounded-xl p-6">
            <LaddaUppFil
              fil={fil ?? null}
              setFil={setFil ?? (() => {})}
              setPdfUrl={setPdfUrl ?? (() => {})}
              setTransaktionsdatum={setTransaktionsdatum ?? (() => {})}
              setBelopp={() => {}}
            />

            <Falt
              label="Totalbelopp (inkl. moms)"
              type="number"
              value={beloppStr}
              onChange={setBeloppStr}
            />
            <Falt
              label="Kommentar"
              type="textarea"
              value={kommentar ?? ""}
              onChange={setKommentar ?? (() => {})}
            />
            <Falt
              label="Betaldatum"
              type="date"
              value={transaktionsdatum ?? ""}
              onChange={setTransaktionsdatum ?? (() => {})}
            />

            <button
              onClick={handleNext}
              className="w-full px-4 py-6 font-bold text-white rounded bg-cyan-600 hover:bg-cyan-700 mt-4"
            >
              Gå vidare
            </button>
          </div>

          <Forhandsgranskning fil={fil ?? null} pdfUrl={pdfUrl ?? null} />
        </div>
      </div>
    );
  }

  // === STEG 3 ===
  if (mode === "steg3") {
    const rows = [
      { konto: "6064 Avgifter avräkningsnota", debet: extrafält["6064"]?.debet ?? 0, kredit: 0 },
      { konto: "2641 Ingående moms", debet: extrafält["2641"]?.debet ?? 0, kredit: 0 },
      { konto: "1930 Företagskonto", debet: 0, kredit: extrafält["1930"]?.kredit ?? 0 },
    ];

    const totalDebet = round(rows.reduce((sum, r) => sum + r.debet, 0));
    const totalKredit = round(rows.reduce((sum, r) => sum + r.kredit, 0));

    return (
      <main className="min-h-screen text-white bg-slate-950 px-4">
        <div className="max-w-5xl mx-auto bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg p-10">
          <h1 className="text-3xl mb-4 text-center">Steg 3: Kontrollera och slutför</h1>
          <p className="text-center font-bold text-xl mb-1">Avgifter avräkningsnota 25%</p>
          <p className="text-center text-gray-300 mb-8">
            {transaktionsdatum ? new Date(transaktionsdatum).toLocaleDateString("sv-SE") : ""}
          </p>

          <form ref={formRef} action={handleSubmit}>
            <table className="w-full text-left border border-gray-700 text-sm md:text-base bg-slate-900 rounded-xl overflow-hidden">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-4 border-b border-gray-700">Konto</th>
                  <th className="p-4 border-b border-gray-700 text-center">Debet</th>
                  <th className="p-4 border-b border-gray-700 text-center">Kredit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="p-4 border-b border-gray-700">{r.konto}</td>
                    <td className="p-4 text-center border-b border-gray-700">
                      {r.debet > 0 ? formatSEK(r.debet) : ""}
                    </td>
                    <td className="p-4 text-center border-b border-gray-700">
                      {r.kredit > 0 ? formatSEK(r.kredit) : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-cyan-900 text-white">
                  <td className="p-4 text-left">Totalt</td>
                  <td className="p-4 text-center">{formatSEK(totalDebet)}</td>
                  <td className="p-4 text-center">{formatSEK(totalKredit)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-8">
              <SubmitButton />
            </div>
          </form>
        </div>
      </main>
    );
  }

  return null;
}
