// #region Huvud
"use client";

import { useState } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import TextFält from "../../_components/TextFält";
import KnappFullWidth from "../../_components/KnappFullWidth";
import { formatSEK } from "../../_utils/format";
import { sammanfattaExtrafalt } from "../../_utils/extrafalt";
import { useAutofyllFrånPdf } from "../../_hooks/useAutofyllFrånPdf";
import DatePicker from "react-datepicker";

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
  formRef?: React.RefObject<HTMLFormElement>;
  handleSubmit?: (formData: FormData) => void;
}
// #endregion

export default function EgetUttag({
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
  const [amount, setAmount] = useState<number>(belopp ?? 0);
  const [date, setDate] = useState<string>(
    transaktionsdatum ?? new Date().toISOString().split("T")[0]
  );
  const [comment, setComment] = useState<string>(kommentar ?? "");

  useAutofyllFrånPdf({
    belopp,
    beloppState: [amount, setAmount],
    transaktionsdatum,
    dateState: [date, setDate],
  });

  const valid = amount > 0;

  const handleStep2 = () => {
    setBelopp?.(amount);
    setKommentar?.(comment);
    setTransaktionsdatum?.(date);

    setExtrafält?.({
      "2013": { label: "Eget uttag", debet: amount, kredit: 0 },
      "1930": { label: "Företagskonto / affärskonto", debet: 0, kredit: amount },
    });

    setCurrentStep?.(3);
  };

  if (mode === "steg2") {
    return (
      <section className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Eget Uttag</h1>

        <div className="flex flex-col-reverse justify-between max-w-5xl mx-auto px-4 md:flex-row">
          <div className="w-full md:w-[40%] bg-slate-900 border border-gray-700 rounded-xl p-6">
            <LaddaUppFil
              fil={fil ?? null}
              setFil={setFil ?? (() => {})}
              setPdfUrl={setPdfUrl ?? (() => {})}
              setTransaktionsdatum={setDate}
              setBelopp={setAmount}
            />

            <TextFält
              label="Belopp"
              name="belopp"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />

            <label className="block text-sm font-medium text-white mb-2">Datum</label>
            <DatePicker
              className="w-full p-2 mb-4 rounded bg-slate-900 text-white border border-gray-700"
              selected={new Date(`${date}T00:00:00`)}
              onChange={(d) => setDate(d ? d.toISOString().split("T")[0] : "")}
              dateFormat="yyyy-MM-dd"
              locale="sv"
            />

            <TextFält
              label="Kommentar"
              name="kommentar"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required={false}
            />

            <KnappFullWidth text="Bokför" onClick={handleStep2} disabled={!valid} />
          </div>

          <Forhandsgranskning fil={fil ?? null} pdfUrl={pdfUrl ?? null} />
        </div>
      </section>
    );
  }

  if (mode === "steg3") {
    const { rows, totalDebet, totalKredit } = sammanfattaExtrafalt(extrafält);

    return (
      <main className="min-h-screen text-white bg-slate-950 px-4">
        <div className="max-w-5xl mx-auto bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg p-10">
          <h1 className="text-3xl mb-4 text-center">Steg 3: Kontrollera och slutför</h1>
          <p className="text-center font-bold text-xl mb-1">Eget Uttag</p>
          <p className="text-center text-gray-300 mb-8">
            {date ? new Date(`${date}T00:00:00`).toLocaleDateString("sv-SE") : ""}
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

          <form ref={formRef} action={handleSubmit ?? undefined} className="mt-8">
            <KnappFullWidth text="Slutför bokföring" />
          </form>
        </div>
      </main>
    );
  }
}
