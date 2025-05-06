// #region Huvud
"use client";

import { useState } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import TextFält from "../../_components/TextFält";
import SubmitButton from "./SubmitButton";
import { formatSEK } from "../../_utils/format";

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
}
// #endregion

export default function Importmoms(props: ImportmomsProps) {
  const {
    mode,
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

  const [summaAttBetala, setSummaAttBetala] = useState("");
  const [tullOchSpedition, setTullOchSpedition] = useState("");
  const [ingFiktivMoms, setIngFiktivMoms] = useState("");
  const [ovrigaSkatter, setOvrigaSkatter] = useState("");
  const [date, setDate] = useState(transaktionsdatum ?? "");
  const [comment, setComment] = useState(kommentar ?? "");

  if (mode === "steg2") {
    const handleLocalSubmit = () => {
      const val1930 = parseFloat(summaAttBetala || "0");
      const valTull = parseFloat(tullOchSpedition || "0");
      const valFiktiv = parseFloat(ingFiktivMoms || "0");
      const valOvriga = parseFloat(ovrigaSkatter || "0");

      const importVaror = parseFloat((valFiktiv * 4).toFixed(2));
      const momsPåTull = parseFloat((valTull * 0.2).toFixed(2));
      const totalt5720 = parseFloat((valTull - momsPåTull + valOvriga).toFixed(2));

      const extrafaltObj = {
        "1930": { label: "Företagskonto / affärskonto", debet: 0, kredit: val1930 },
        "2615": { label: "Utgående moms import av varor, 25%", debet: 0, kredit: valFiktiv },
        "2640": { label: "Ingående moms", debet: momsPåTull, kredit: 0 },
        "2645": {
          label: "Beräknad ingående moms på förvärv från utlandet",
          debet: valFiktiv,
          kredit: 0,
        },
        "4545": { label: "Import av varor, 25 % moms", debet: importVaror, kredit: 0 },
        "4549": { label: "Motkonto beskattningsunderlag import", debet: 0, kredit: importVaror },
        "5720": { label: "Tull- och speditionskostnader m.m.", debet: totalt5720, kredit: 0 },
      };

      setKommentar?.(comment);
      setTransaktionsdatum?.(date);
      setBelopp?.(val1930);
      setExtrafält?.(extrafaltObj);
      setCurrentStep?.(3);
    };

    return (
      <div className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Importmoms</h1>
        <div className="flex flex-col-reverse justify-between max-w-5xl mx-auto px-4 md:flex-row">
          <div className="w-full md:w-[40%] bg-slate-900 border border-gray-700 rounded-xl p-6">
            <LaddaUppFil
              fil={fil ?? null}
              setFil={setFil ?? (() => {})}
              setPdfUrl={setPdfUrl ?? (() => {})}
              setTransaktionsdatum={setDate}
              setBelopp={() => {}}
            />

            <TextFält
              label="Summa att betala in"
              name="summa"
              value={summaAttBetala}
              onChange={(e) => setSummaAttBetala(e.target.value)}
              required
            />
            <TextFält
              label="Tull- och speditionskostnader m.m."
              name="tull"
              value={tullOchSpedition}
              onChange={(e) => setTullOchSpedition(e.target.value)}
              required
            />
            <TextFält
              label="Ingående fiktiv moms"
              name="fiktiv"
              value={ingFiktivMoms}
              onChange={(e) => setIngFiktivMoms(e.target.value)}
              required
            />
            <TextFält
              label="Övriga skatter"
              name="ovriga"
              value={ovrigaSkatter}
              onChange={(e) => setOvrigaSkatter(e.target.value)}
              required={false}
            />
            <TextFält
              label="Betaldatum"
              name="datum"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <TextFält
              label="Kommentar"
              name="kommentar"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required={false}
            />

            <button
              onClick={handleLocalSubmit}
              className="w-full mt-4 px-4 py-4 font-bold text-white rounded bg-cyan-600 hover:bg-cyan-700"
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
    const rows = Object.entries(extrafält).map(([konto, info]) => ({
      konto: `${konto} ${info.label}`,
      debet: info.debet,
      kredit: info.kredit,
    }));

    const totalDebet = rows.reduce((sum, r) => sum + r.debet, 0);
    const totalKredit = rows.reduce((sum, r) => sum + r.kredit, 0);

    return (
      <main className="min-h-screen text-white bg-slate-950 px-4">
        <div className="max-w-5xl mx-auto bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg p-10">
          <h1 className="text-3xl mb-4 text-center">Steg 3: Kontrollera och slutför</h1>
          <p className="text-center font-bold text-xl mb-1">Importmoms</p>
          <p className="text-center text-gray-300 mb-8">
            {date ? new Date(date).toLocaleDateString("sv-SE") : ""}
          </p>

          <form ref={formRef} action={handleSubmit ?? undefined}>
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
}
