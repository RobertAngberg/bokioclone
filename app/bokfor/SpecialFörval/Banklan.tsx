// #region Huvud
"use client";

import { useEffect } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import TextFält from "../../_components/TextFält";
import KnappFullWidth from "../../_components/KnappFullWidth";
import { useBokforForm } from "../../_hooks/useBokforForm";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { sv } from "date-fns/locale/sv";
registerLocale("sv", sv);
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  mode: "steg2" | "steg3";
  belopp?: number | null;
  setBelopp?: (v: number | null) => void;
  transaktionsdatum?: string | null;
  setTransaktionsdatum?: (v: string | null) => void;
  kommentar?: string | null;
  setKommentar?: (v: string | null) => void;
  setCurrentStep?: (v: number) => void;
  fil?: File | null;
  setFil?: (f: File | null) => void;
  pdfUrl?: string | null;
  setPdfUrl?: (u: string | null) => void;
  extrafält: Record<string, { label: string; debet: number; kredit: number }>;
  setExtrafält?: (v: Record<string, { label: string; debet: number; kredit: number }>) => void;
  formRef?: React.RefObject<HTMLFormElement>;
  handleSubmit?: (fd: FormData) => void;
}
// #endregion

const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;
const formatSEK = (val: number) => val.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

export default function Banklan(props: Props) {
  const {
    mode,
    setBelopp,
    setTransaktionsdatum,
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

  const {
    state: { total, date, comment },
    setters: { setTotal, setDate, setComment },
    valid,
    toNum,
    handlePdfAmount,
  } = useBokforForm({
    keys: ["total"],
    defaultDate: props.transaktionsdatum,
    onPdfAmount: (v, set) => {
      if (v !== null && total.trim() === "") {
        set(String(v));
      }
      setBelopp?.(null);
    },
  });

  useEffect(() => {
    setTransaktionsdatum?.(date);
    setKommentar?.(comment);
  }, [date, comment, setKommentar, setTransaktionsdatum]);

  if (mode === "steg2") {
    const handleNext = () => {
      const summa = toNum(total);
      if (summa === null) return;

      setExtrafält?.({
        "1930": {
          label: "Företagskonto / affärskonto",
          debet: summa,
          kredit: 0,
        },
        "2350": {
          label: "Lån från kreditinstitut",
          debet: 0,
          kredit: summa,
        },
      });

      setBelopp?.(summa);
      setCurrentStep?.(3);
    };

    return (
      <section id="Huvud" className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Banklån</h1>
        <div className="flex flex-col-reverse justify-between max-w-5xl mx-auto md:flex-row px-4">
          <div className="w-full mb-10 md:w-[40%] md:mb-0 bg-slate-900 border border-gray-700 rounded-xl p-6">
            <LaddaUppFil
              fil={fil ?? null}
              setFil={setFil ?? (() => {})}
              setPdfUrl={setPdfUrl ?? (() => {})}
              setTransaktionsdatum={setDate}
              setBelopp={handlePdfAmount}
            />

            <TextFält
              label="Totalt lånebelopp"
              name="total"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              required
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                Utbetalningsdatum (ÅÅÅÅ‑MM‑DD)
              </label>
              <DatePicker
                wrapperClassName="w-full"
                className="w-full p-2 rounded text-white bg-slate-900 border border-gray-700"
                selected={date ? new Date(date) : new Date()}
                onChange={(d) => setDate(d ? d.toISOString().split("T")[0] : "")}
                dateFormat="yyyy-MM-dd"
                locale="sv"
                required
              />
            </div>

            <TextFält
              label="Kommentar"
              name="kommentar"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required={false}
            />

            <KnappFullWidth
              text="Gå vidare"
              pendingText="..."
              onClick={handleNext}
              disabled={!valid}
            />
          </div>

          <Forhandsgranskning fil={fil ?? null} pdfUrl={pdfUrl ?? null} />
        </div>
      </section>
    );
  }

  if (mode === "steg3") {
    const rad = extrafält || {};
    const rows = [
      {
        konto: "1930 Företagskonto / affärskonto",
        debet: rad["1930"]?.debet ?? 0,
        kredit: 0,
      },
      {
        konto: "2350 Lån från kreditinstitut",
        debet: 0,
        kredit: rad["2350"]?.kredit ?? 0,
      },
    ];

    const totalDebet = round(rows.reduce((sum, r) => sum + r.debet, 0));
    const totalKredit = round(rows.reduce((sum, r) => sum + r.kredit, 0));

    return (
      <main className="min-h-screen text-white bg-slate-950 px-4">
        <div className="max-w-5xl mx-auto bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg p-10">
          <h1 className="text-3xl mb-4 text-center">Steg 3: Kontrollera och slutför</h1>
          <p className="text-center font-bold text-xl mb-1">Banklån</p>
          <p className="text-center text-gray-300 mb-8">
            {date ? new Date(date).toLocaleDateString("sv-SE") : ""}
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
              <KnappFullWidth text="Slutför bokföring" pendingText="Bokför..." />
            </div>
          </form>
        </div>
      </main>
    );
  }
}
