"use client";

import { useState } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Forhandsgranskning";
import Falt from "./Falt";
import SubmitButton from "./SubmitButton";

interface AmorteringProps {
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

export default function AmorteringBanklan(props: AmorteringProps) {
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
  const [ränta, setRänta] = useState("");

  // === STEG 2 ===
  if (mode === "steg2") {
    const handleLocalSubmit = () => {
      const valTotal = round(parseFloat(total || "0"));
      const valRänta = round(parseFloat(ränta || "0"));
      const amortering = round(valTotal - valRänta);

      const extrafaltObj = {
        "1930": {
          label: "Företagskonto / affärskonto",
          debet: 0,
          kredit: valTotal,
        },
        "2350": {
          label: "Andra långfristiga skulder till kreditinstitut",
          debet: amortering,
          kredit: 0,
        },
        "8410": {
          label: "Räntekostnader för långfristiga skulder",
          debet: valRänta,
          kredit: 0,
        },
      };

      setExtrafält?.(extrafaltObj);
      setCurrentStep?.(3);
    };

    return (
      <div className="flex flex-col-reverse justify-between h-auto max-w-5xl px-4 mx-auto md:flex-row">
        <div className="w-full mb-10 text-white md:w-[40%] md:mb-0">
          <h1 className="text-3xl font-bold mb-6 text-center">Steg 2: Amortering Banklån</h1>

          <LaddaUppFil
            fil={fil ?? null}
            setFil={setFil ?? (() => {})}
            setPdfUrl={setPdfUrl ?? (() => {})}
            setTransaktionsdatum={setTransaktionsdatum ?? (() => {})}
            setBelopp={() => {}}
          />

          <Falt label="Summa amortering + ränta" type="number" value={total} onChange={setTotal} />
          <Falt label="Varav ränta" type="number" value={ränta} onChange={setRänta} />
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
    );
  }

  // === STEG 3 ===
  if (mode === "steg3") {
    const rad = extrafält || {};
    const rows = [
      {
        konto: "1930 Företagskonto / affärskonto",
        debet: 0,
        kredit: rad["1930"]?.kredit ?? 0,
      },
      {
        konto: "2350 Andra långfristiga skulder till kreditinstitut",
        debet: rad["2350"]?.debet ?? 0,
        kredit: 0,
      },
      {
        konto: "8410 Räntekostnader för långfristiga skulder",
        debet: rad["8410"]?.debet ?? 0,
        kredit: 0,
      },
    ];

    const totalDebet = round(rows.reduce((sum, r) => sum + r.debet, 0));
    const totalKredit = round(rows.reduce((sum, r) => sum + r.kredit, 0));

    return (
      <main className="items-center min-h-screen text-center text-white bg-slate-950">
        <div className="w-full p-10 text-white md:mx-auto md:w-2/5 bg-cyan-950 rounded-3xl">
          <h1 className="text-3xl font-bold mb-4">Steg 3: Kontrollera och slutför (Amortering)</h1>

          <form ref={formRef} action={handleSubmit}>
            <table className="w-full mb-8 text-left border border-gray-300">
              <thead>
                <tr>
                  <th className="p-4 border-b">Konto</th>
                  <th className="p-4 border-b">Debet</th>
                  <th className="p-4 border-b">Kredit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="p-4">{r.konto}</td>
                    <td className="p-4">{r.debet > 0 ? formatSEK(r.debet) : ""}</td>
                    <td className="p-4">{r.kredit > 0 ? formatSEK(r.kredit) : ""}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-cyan-900 text-white">
                  <td className="p-4">Totalt</td>
                  <td className="p-4">{formatSEK(totalDebet)}</td>
                  <td className="p-4">{formatSEK(totalKredit)}</td>
                </tr>
              </tfoot>
            </table>
            <SubmitButton />
          </form>
        </div>
      </main>
    );
  }

  return null;
}
