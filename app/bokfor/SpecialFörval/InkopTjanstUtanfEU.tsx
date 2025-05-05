"use client";

import { useState } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import Falt from "./Falt";
import SubmitButton from "./SubmitButton";

interface Props {
  mode: "steg2" | "steg3";
  belopp?: number | null;
  setBelopp?: (amount: number | null) => void;
  transaktionsdatum?: string | null;
  setTransaktionsdatum?: (date: string | null) => void;
  kommentar?: string | null;
  setKommentar?: (comment: string | null) => void;
  setCurrentStep?: (step: number) => void;
  fil?: File | null;
  setFil?: (file: File | null) => void;
  pdfUrl?: string | null;
  setPdfUrl?: (url: string | null) => void;
  extrafält: Record<string, { label: string; debet: number; kredit: number }>;
  setExtrafält?: (fält: Record<string, { label: string; debet: number; kredit: number }>) => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
  handleSubmit?: (formData: FormData) => void;
}

const round = (val: number): number => Math.round((val + Number.EPSILON) * 100) / 100;
const formatSEK = (val: number) => val.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

export default function InkopTjanstUtanfEU(props: Props) {
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

  const [total, setTotal] = useState("");

  if (mode === "steg2") {
    const handleLocalSubmit = () => {
      const val = round(parseFloat(total || "0"));
      const moms = round(val * 0.25);

      const extrafaltObj = {
        "1930": { label: "Företagskonto / affärskonto", debet: 0, kredit: val },
        "2614": {
          label: "Utgående moms omvänd skattskyldighet, 25 %",
          debet: 0,
          kredit: moms,
        },
        "2645": {
          label: "Beräknad ingående moms på förvärv från utlandet",
          debet: moms,
          kredit: 0,
        },
        "4531": {
          label: "Import tjänster land utanför EU, 25% moms",
          debet: val,
          kredit: 0,
        },
      };

      setExtrafält?.(extrafaltObj);
      setCurrentStep?.(3);
    };

    return (
      <div className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center text-white">Steg 2: Inköp tjänster utanför EU</h1>

        <div className="flex flex-col-reverse justify-between h-auto max-w-5xl px-4 mx-auto md:flex-row">
          <div className="w-full mb-10 md:w-[40%] md:mb-0 bg-slate-900 border border-gray-700 rounded-xl p-6 text-white">
            <LaddaUppFil
              fil={fil ?? null}
              setFil={setFil ?? (() => {})}
              setPdfUrl={setPdfUrl ?? (() => {})}
              setTransaktionsdatum={setTransaktionsdatum ?? (() => {})}
              setBelopp={() => {}}
            />

            <Falt label="Totalt belopp" type="number" value={total} onChange={setTotal} />
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
              onClick={handleLocalSubmit}
              className="w-full px-4 py-6 font-bold text-white rounded bg-cyan-600 hover:bg-cyan-700"
            >
              Bokför
            </button>
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
        konto: "2614 Utgående moms omvänd skattskyldighet, 25 %",
        debet: 0,
        kredit: rad["2614"]?.kredit ?? 0,
      },
      {
        konto: "2645 Beräknad ingående moms på förvärv från utlandet",
        debet: rad["2645"]?.debet ?? 0,
        kredit: 0,
      },
      {
        konto: "4531 Import tjänster land utanför EU, 25% moms",
        debet: rad["4531"]?.debet ?? 0,
        kredit: 0,
      },
    ];

    const totalDebet = round(rows.reduce((sum, r) => sum + r.debet, 0));
    const totalKredit = round(rows.reduce((sum, r) => sum + r.kredit, 0));

    return (
      <main className="min-h-screen text-white bg-slate-950 px-4">
        <div className="max-w-5xl mx-auto bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg p-10">
          <h1 className="text-3xl mb-4 text-center">Steg 3: Kontrollera och slutför</h1>
          <p className="text-center font-bold text-xl mb-1">Inköp tjänster utanför EU</p>
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
