// #region Huvud
"use client";

import { useState } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import TextFält from "../../_components/TextFält";
import KnappFullWidth from "../../_components/KnappFullWidth";
import { formatSEK, parseNumber } from "../../_utils/format";

interface Props {
  mode: "steg2" | "steg3";
  belopp?: number | null;
  setBelopp?: (val: number | null) => void;
  transaktionsdatum?: string | null;
  setTransaktionsdatum?: (val: string | null) => void;
  kommentar?: string | null;
  setKommentar?: (val: string | null) => void;
  setCurrentStep?: (val: number) => void;
  fil: File | null;
  setFil: (val: File | null) => void;
  pdfUrl: string | null;
  setPdfUrl: (val: string) => void;
  extrafält: Record<string, { label: string; debet: number; kredit: number }>;
  setExtrafält?: (fält: Record<string, { label: string; debet: number; kredit: number }>) => void;
  formRef?: React.RefObject<HTMLFormElement>;
  handleSubmit?: (formData: FormData) => void;
}
// #endregion

export default function Pensionsforsakring({
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
  const [total, setTotal] = useState("");
  const [lokaltBelopp, setLokaltBelopp] = useState<number>(belopp ?? 0);

  if (mode === "steg2") {
    const gåVidare = () => {
      const val = parseNumber(total);
      const loneskatt = val * 0.2425;

      const extrafaltObj = {
        "1930": { label: "Företagskonto / affärskonto", debet: 0, kredit: val },
        "2514": {
          label: "Beräknad särskild löneskatt på pensionskostnader",
          debet: 0,
          kredit: loneskatt,
        },
        "7412": {
          label: "Premier för individuella pensionsförsäkringar",
          debet: val,
          kredit: 0,
        },
        "7533": {
          label: "Särskild löneskatt för pensionskostnader",
          debet: loneskatt,
          kredit: 0,
        },
      };

      setBelopp?.(val);
      setExtrafält?.(extrafaltObj);
      setCurrentStep?.(3);
    };

    return (
      <div className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Pensionsförsäkring</h1>

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
              name="belopp"
              label="Totalt belopp"
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
            />

            <TextFält
              name="kommentar"
              label="Kommentar"
              type="textarea"
              value={kommentar ?? ""}
              onChange={(e) => setKommentar?.(e.target.value)}
            />

            <TextFält
              name="datum"
              label="Betaldatum"
              type="date"
              value={transaktionsdatum ?? ""}
              onChange={(e) => setTransaktionsdatum?.(e.target.value)}
            />

            <KnappFullWidth text="Bokför" onClick={gåVidare} />
          </div>

          <Forhandsgranskning fil={fil ?? null} pdfUrl={pdfUrl ?? null} />
        </div>
      </div>
    );
  }

  if (mode === "steg3") {
    const rad = extrafält || {};
    const rows = [
      {
        konto: "1930 Företagskonto / affärskonto",
        debet: 0,
        kredit: rad["1930"]?.kredit ?? 0,
      },
      {
        konto: "2514 Beräknad särskild löneskatt på pensionskostnader",
        debet: 0,
        kredit: rad["2514"]?.kredit ?? 0,
      },
      {
        konto: "7412 Premier för individuella pensionsförsäkringar",
        debet: rad["7412"]?.debet ?? 0,
        kredit: 0,
      },
      {
        konto: "7533 Särskild löneskatt för pensionskostnader",
        debet: rad["7533"]?.debet ?? 0,
        kredit: 0,
      },
    ];

    const totalDebet = rows.reduce((sum, r) => sum + r.debet, 0);
    const totalKredit = rows.reduce((sum, r) => sum + r.kredit, 0);

    return (
      <main className="min-h-screen text-white bg-slate-950 px-4">
        <div className="max-w-5xl mx-auto bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg p-10">
          <h1 className="text-3xl mb-4 text-center">Steg 3: Kontrollera och slutför</h1>
          <p className="text-center font-bold text-xl mb-1">Pensionsförsäkring</p>
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
              <KnappFullWidth text="Slutför bokföring" />
            </div>
          </form>
        </div>
      </main>
    );
  }
}
