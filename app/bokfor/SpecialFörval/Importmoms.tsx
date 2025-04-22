"use client";

import { useState } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import Falt from "./Falt";
import SubmitButton from "./SubmitButton";

interface ImportmomsProps {
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
  validationMessages?: string[];
}

const round = (val: number): number => Math.round((val + Number.EPSILON) * 100) / 100;
const formatSEK = (val: number) => val.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

export default function Importmoms(props: ImportmomsProps) {
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
    validationMessages,
  } = props;

  const [summaAttBetala, setSummaAttBetala] = useState("");
  const [tullOchSpedition, setTullOchSpedition] = useState("");
  const [ingFiktivMoms, setIngFiktivMoms] = useState("");
  const [ovrigaSkatter, setOvrigaSkatter] = useState("");

  // === STEG 2 ===
  if (mode === "steg2") {
    const handleLocalSubmit = () => {
      const val1930 = round(parseFloat(summaAttBetala || "0"));
      const valTull = round(parseFloat(tullOchSpedition || "0"));
      const valFiktiv = round(parseFloat(ingFiktivMoms || "0"));
      const valOvriga = round(parseFloat(ovrigaSkatter || "0"));

      const importVaror = round(valFiktiv * 4);
      const momsPåTull = round(valTull * 0.2);
      const nettobelopp5720 = round(valTull - momsPåTull);
      const totalt5720 = round(nettobelopp5720 + valOvriga);

      const extrafaltObj = {
        "1930": {
          label: "Företagskonto / affärskonto",
          debet: 0,
          kredit: val1930,
        },
        "2615": {
          label: "Utgående moms import av varor, 25%",
          debet: 0,
          kredit: valFiktiv,
        },
        "2640": {
          label: "Ingående moms",
          debet: momsPåTull,
          kredit: 0,
        },
        "2645": {
          label: "Beräknad ingående moms på förvärv från utlandet",
          debet: valFiktiv,
          kredit: 0,
        },
        "4545": {
          label: "Import av varor, 25 % moms",
          debet: importVaror,
          kredit: 0,
        },
        "4549": {
          label: "Motkonto beskattningsunderlag import",
          debet: 0,
          kredit: importVaror,
        },
        "5720": {
          label: "Tull- och speditionskostnader m.m.",
          debet: totalt5720,
          kredit: 0,
        },
      };

      setExtrafält?.(extrafaltObj);
      setCurrentStep?.(3);
    };

    return (
      <div className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center text-white">Steg 2: Importmoms</h1>

        <div className="flex flex-col-reverse justify-between h-auto max-w-5xl px-4 mx-auto md:flex-row">
          <div className="w-full mb-10 md:w-[40%] md:mb-0 bg-slate-900 border border-gray-700 rounded-xl p-6 text-white">
            <LaddaUppFil
              fil={fil ?? null}
              setFil={setFil ?? (() => {})}
              setPdfUrl={setPdfUrl ?? (() => {})}
              setTransaktionsdatum={setTransaktionsdatum ?? (() => {})}
              setBelopp={() => {}}
            />

            <Falt
              label="Summa att betala in"
              type="number"
              value={summaAttBetala}
              onChange={setSummaAttBetala}
            />
            <Falt
              label="Tull- och speditionskostnader m.m."
              type="number"
              value={tullOchSpedition}
              onChange={setTullOchSpedition}
            />
            <Falt
              label="Ingående fiktiv moms"
              type="number"
              value={ingFiktivMoms}
              onChange={setIngFiktivMoms}
            />
            <Falt
              label="Övriga skatter"
              type="number"
              value={ovrigaSkatter}
              onChange={setOvrigaSkatter}
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
              onClick={handleLocalSubmit}
              className="w-full flex items-center justify-center px-4 py-4 font-bold text-white rounded cursor-pointer bg-cyan-600 hover:bg-cyan-700"
            >
              Bokför
            </button>
          </div>

          <Forhandsgranskning fil={fil ?? null} pdfUrl={pdfUrl ?? null} />
        </div>
      </div>
    );
  }

  // === STEG 3 ===
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
          <p className="text-center font-bold text-xl mb-1">Importmoms</p>
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
