// #region Huvud
"use client";

import { useState } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import TextFält from "../../_components/TextFält";
import KnappFullWidth from "../../_components/KnappFullWidth";
import { formatSEK } from "../../_utils/format";
import { ÅÅÅÅMMDDTillDate, dateTillÅÅÅÅMMDD } from "../../_utils/datum";
import DatePicker from "react-datepicker";

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

export default function Importmoms({
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
  const [tull, setTull] = useState("");
  const [fiktiv, setFiktiv] = useState("");
  const [ovrigt, setOvrigt] = useState("");
  const [datum, setDatum] = useState(transaktionsdatum ?? "");
  const [kommentarText, setKommentarText] = useState(kommentar ?? "");

  const moms = parseFloat((parseFloat(tull || "0") * 0.25).toFixed(2));
  const totalDebet =
    parseFloat(tull || "0") + parseFloat(fiktiv || "0") + parseFloat(ovrigt || "0");

  const gåTillSteg3 = () => {
    const extrafältObj = {
      "1930": { label: "Företagskonto / affärskonto", debet: 0, kredit: lokaltBelopp },
      "2641": { label: "Debiterad ingående moms", debet: moms, kredit: 0 },
      "4545": { label: "Inköp varor utanför EU", debet: parseFloat(tull || "0"), kredit: 0 },
      "2645": { label: "Beräknad moms utland", debet: parseFloat(fiktiv || "0"), kredit: 0 },
      "4799": { label: "Övriga avgifter", debet: parseFloat(ovrigt || "0"), kredit: 0 },
    };

    setKommentar?.(kommentarText);
    setTransaktionsdatum?.(datum);
    setBelopp?.(lokaltBelopp);
    setExtrafält?.(extrafältObj);
    setCurrentStep?.(3);
  };

  if (mode === "steg2") {
    return (
      <section className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Importmoms</h1>
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
              label="Totalt belopp"
              name="belopp"
              value={lokaltBelopp}
              onChange={(e) => setLokaltBelopp(Number(e.target.value))}
              required
            />
            <TextFält
              label="Tull och spedition"
              name="tull"
              value={tull}
              onChange={(e) => setTull(e.target.value)}
              required
            />
            <TextFält
              label="Fiktiv moms"
              name="fiktiv"
              value={fiktiv}
              onChange={(e) => setFiktiv(e.target.value)}
              required
            />
            <TextFält
              label="Övriga skatter"
              name="ovrigt"
              value={ovrigt}
              onChange={(e) => setOvrigt(e.target.value)}
              required={false}
            />

            <label className="block text-sm font-medium text-white mb-2">Betaldatum</label>
            <DatePicker
              className="w-full p-2 mb-4 rounded bg-slate-900 text-white border border-gray-700"
              selected={ÅÅÅÅMMDDTillDate(datum)}
              onChange={(date) => setDatum(dateTillÅÅÅÅMMDD(date))}
              dateFormat="yyyy-MM-dd"
              locale="sv"
              required
            />

            <TextFält
              label="Kommentar"
              name="kommentar"
              value={kommentarText}
              onChange={(e) => setKommentarText(e.target.value)}
              required={false}
            />

            <KnappFullWidth text="Bokför" onClick={gåTillSteg3} disabled={lokaltBelopp <= 0} />
          </div>

          <Forhandsgranskning fil={fil} pdfUrl={pdfUrl} />
        </div>
      </section>
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
            <tfoot>
              <tr className="font-bold bg-cyan-900 text-white">
                <td className="p-4 text-left">Totalt</td>
                <td className="p-4 text-center">{formatSEK(totalDebet)}</td>
                <td className="p-4 text-center">{formatSEK(totalKredit)}</td>
              </tr>
            </tfoot>
          </table>

          <form ref={formRef} action={handleSubmit ?? undefined} className="mt-8">
            <KnappFullWidth text="Slutför bokföring" />
          </form>
        </div>
      </main>
    );
  }
}
