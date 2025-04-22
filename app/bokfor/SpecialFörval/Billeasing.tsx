"use client";

import { useState } from "react";
import Falt from "./Falt";
import SubmitButton from "./SubmitButton";
import Forhandsgranskning from "../Förhandsgranskning";
import LaddaUppFil from "../LaddaUppFil";

interface Props {
  mode: "steg2" | "steg3";
  belopp?: number | null;
  setBelopp?: (val: number | null) => void;
  transaktionsdatum?: string | null;
  setTransaktionsdatum?: (val: string | null) => void;
  kommentar?: string | null;
  setKommentar?: (val: string | null) => void;
  setCurrentStep?: (val: number) => void;
  fil?: File | null;
  setFil?: (val: File | null) => void;
  pdfUrl?: string | null;
  setPdfUrl?: (val: string | null) => void;
  extrafält: Record<string, { label: string; debet: number; kredit: number }>;
  setExtrafält?: (val: Record<string, { label: string; debet: number; kredit: number }>) => void;
  formRef?: React.RefObject<HTMLFormElement>;
  handleSubmit?: (formData: FormData) => void;
}

const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;
const formatSEK = (val: number) => val.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

export default function Billeasing(props: Props) {
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

  const [leasing, setLeasing] = useState("4000");
  const [forsakring, setForsakring] = useState("100");
  const [admin, setAdmin] = useState("80");
  const [forhojd, setForhojd] = useState("50000");

  if (mode === "steg2") {
    const handleLocalSubmit = () => {
      const leasingEx = round(parseFloat(leasing || "0"));
      const adminEx = round(parseFloat(admin || "0"));
      const forsakringVal = round(parseFloat(forsakring || "0"));
      const forhojdInkl = round(parseFloat(forhojd || "0"));

      const momsLeasing = round(leasingEx * 0.25 * 0.5);
      const momsAdmin = round(adminEx * 0.25 * 0.5);
      const momsForhojd = round(forhojdInkl * 0.25 * 0.5);
      const nettoForhojd = round(forhojdInkl - momsForhojd);

      const total = leasingEx + adminEx + forsakringVal + forhojdInkl + momsLeasing + momsAdmin;

      setBelopp?.(total);

      const extrafältObj = {
        "1930": {
          label: "Företagskonto / affärskonto",
          debet: 0,
          kredit: total,
        },
        "2640": {
          label: "Ingående moms",
          debet: momsLeasing + momsAdmin + momsForhojd,
          kredit: 0,
        },
        "5612": {
          label: "Försäkring och skatt för personbilar",
          debet: forsakringVal,
          kredit: 0,
        },
        "5615": {
          label: "Leasing av personbilar",
          debet: leasingEx,
          kredit: 0,
        },
        "6990": {
          label: "Övriga externa kostnader",
          debet: adminEx,
          kredit: 0,
        },
        "1720": {
          label: "Förutbetalda leasingavgifter",
          debet: nettoForhojd,
          kredit: 0,
        },
      };

      console.log("✅ Extrafält:", extrafältObj);
      setExtrafält?.(extrafältObj);
      setCurrentStep?.(3);
    };

    return (
      <div className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Billeasing</h1>
        <div className="flex flex-col-reverse justify-between h-auto max-w-5xl px-4 mx-auto md:flex-row">
          <div className="w-full md:w-[40%] bg-slate-900 border border-gray-700 rounded-xl p-6">
            <LaddaUppFil
              fil={fil ?? null}
              setFil={setFil ?? (() => {})}
              setPdfUrl={setPdfUrl ?? (() => {})}
              setTransaktionsdatum={setTransaktionsdatum ?? (() => {})}
              setBelopp={() => {}}
            />
            <Falt
              label="Leasingavgift (exkl. moms)"
              type="number"
              value={leasing}
              onChange={setLeasing}
            />
            <p className="text-sm text-gray-400 mb-4">
              Moms (25% x 50%): {formatSEK(parseFloat(leasing || "0") * 0.25 * 0.5)} kr
            </p>

            <Falt
              label="Försäkring + skatt"
              type="number"
              value={forsakring}
              onChange={setForsakring}
            />

            <Falt
              label="Adminavgifter (exkl. moms)"
              type="number"
              value={admin}
              onChange={setAdmin}
            />
            <p className="text-sm text-gray-400 mb-4">
              Moms (25% x 50%): {formatSEK(parseFloat(admin || "0") * 0.25 * 0.5)} kr
            </p>

            <details className="mt-6 group transition-all">
              <summary className="cursor-pointer text-white font-semibold hover:underline flex items-center">
                <span className="mr-2 transform transition-transform group-open:rotate-90">▶</span>
                Förhöjd avgift? (valfritt)
              </summary>
              <div className="mt-3 ml-2 transition-opacity">
                <Falt
                  label="Förhöjd avgift (inkl. moms)"
                  type="number"
                  value={forhojd}
                  onChange={setForhojd}
                />
                <p className="text-sm text-gray-400 mt-1">
                  Moms (25% x 50%): {formatSEK(parseFloat(forhojd || "0") * 0.25 * 0.5)} kr
                </p>
              </div>
            </details>

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
              className="w-full py-4 mt-6 font-bold rounded bg-cyan-600 hover:bg-cyan-700"
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
    const rows = Object.entries(rad).map(([konto, info]) => ({
      konto: `${konto} ${info.label}`,
      debet: info.debet,
      kredit: info.kredit,
    }));

    const totalDebet = round(rows.reduce((sum, r) => sum + r.debet, 0));
    const totalKredit = round(rows.reduce((sum, r) => sum + r.kredit, 0));

    return (
      <main className="min-h-screen text-white bg-slate-950 px-4">
        <div className="max-w-5xl mx-auto bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg p-10">
          <h1 className="text-3xl mb-4 text-center">Steg 3: Kontrollera och slutför</h1>
          <p className="text-center font-bold text-xl mb-1">Billeasing</p>
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
