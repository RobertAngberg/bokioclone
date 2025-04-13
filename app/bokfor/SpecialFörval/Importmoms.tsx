"use client";

import { useState } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Forhandsgranskning";
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
      <div className="flex flex-col-reverse justify-between h-auto max-w-5xl px-4 mx-auto md:flex-row text-white">
        <div className="w-full mb-10 md:w-2/5 md:mb-0">
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
    const rows = Object.entries(rad).map(([konto, info]) => ({
      konto: `${konto} ${info.label}`,
      debet: info.debet,
      kredit: info.kredit,
    }));

    const totalDebet = round(rows.reduce((sum, r) => sum + r.debet, 0));
    const totalKredit = round(rows.reduce((sum, r) => sum + r.kredit, 0));

    return (
      <main className="items-center min-h-screen text-center text-white bg-slate-950">
        <div className="w-full p-10 text-white md:mx-auto md:w-2/5 bg-cyan-950 rounded-3xl">
          <h1 className="text-3xl font-bold mb-4">Steg 3: Kontrollera och slutför (Importmoms)</h1>

          {validationMessages && validationMessages.length > 0 && (
            <div className="mb-6 text-left text-yellow-300">
              {validationMessages.map((msg, i) => (
                <p key={i}>⚠️ {msg}</p>
              ))}
            </div>
          )}

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
