// #region Huvud
"use client";

import { useEffect } from "react";
import KnappFullWidth from "../../_components/KnappFullWidth";
import TextFält from "../../_components/TextFält";
import Forhandsgranskning from "../Förhandsgranskning";
import LaddaUppFil from "../LaddaUppFil";
import { useBokforForm } from "../../_hooks/useBokforForm";

import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { sv } from "date-fns/locale/sv";
registerLocale("sv", sv);
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  mode: "steg2" | "steg3";
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
  setExtrafält?: (f: Record<string, { label: string; debet: number; kredit: number }>) => void;
  formRef?: React.RefObject<HTMLFormElement>;
  handleSubmit?: (fd: FormData) => void;
}
// #endregion

const momsSats = 0.25;
const round = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;
const formatSEK = (v: number) => v.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

export default function AvgifterAvrakningsnotaMoms(props: Props) {
  const {
    mode,
    setBelopp,
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

  /* ----------- bokför‑hook ----------- */
  const {
    state: { total: brutto, date, comment: kommentar },
    setters: { setTotal: setBrutto, setDate, setComment: setKommentar },
    valid,
    toNum,
    handlePdfAmount,
  } = useBokforForm({
    keys: ["total"],
    defaultDate: props.transaktionsdatum,
    onPdfAmount: (v, setTotal) => {
      if (v !== null && brutto.trim() === "") setTotal(String(v));
      setBelopp?.(null);
    },
  });

  /* synka datum uppåt så steg3 ser rätt datum */
  useEffect(() => {
    props.setTransaktionsdatum?.(date);
  }, [date, props]);

  /* ---------- submit steg 2 ---------- */
  const nextStep = () => {
    if (!valid) return;

    const total = toNum(brutto)!;
    const momsBelopp = round((total * momsSats) / (1 + momsSats)); // 20 % av brutto
    const netto = round(total - momsBelopp);

    setExtrafält?.({
      6064: { label: "Factoringavgifter", debet: netto, kredit: 0 },
      2640: { label: "Ingående moms", debet: momsBelopp, kredit: 0 },
      1930: {
        label: "Företagskonto / affärskonto",
        debet: 0,
        kredit: total,
      },
    });

    setBelopp?.(null);
    setCurrentStep?.(3);
  };

  /* ---------- step 2 ---------- */
  const step2 = (
    <section id="Huvud" className="bg-cyan-950 text-white">
      <h1 className="mb-6 text-3xl text-center">Steg 2: Avgifter avräkningsnota</h1>

      <div className="flex flex-col-reverse justify-between max-w-5xl mx-auto md:flex-row px-4">
        <div className="w-full mb-10 md:w-[40%] md:mb-0 bg-slate-900 border border-gray-700 rounded-xl p-6">
          <LaddaUppFil
            fil={fil ?? null}
            setFil={setFil ?? (() => {})}
            setPdfUrl={setPdfUrl ?? (() => {})}
            setBelopp={handlePdfAmount}
            setTransaktionsdatum={setDate}
          />

          <TextFält
            label="Totalbelopp (inkl. moms)"
            name="brutto"
            value={brutto}
            onChange={(e) => setBrutto(e.target.value)}
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">
              Betaldatum&nbsp;(ÅÅÅÅ‑MM‑DD)
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
            value={kommentar}
            onChange={(e) => setKommentar(e.target.value)}
            required={false}
          />

          <KnappFullWidth
            text="Gå vidare"
            pendingText="Vänta..."
            onClick={nextStep}
            disabled={!valid}
          />
        </div>

        <Forhandsgranskning fil={fil ?? null} pdfUrl={pdfUrl ?? null} />
      </div>
    </section>
  );

  /* ---------- step 3 ---------- */
  const step3 = (() => {
    const rows = [
      {
        konto: "1930 Företagskonto / affärskonto",
        debet: 0,
        kredit: extrafält["1930"]?.kredit ?? 0,
      },
      {
        konto: "2640 Ingående moms",
        debet: extrafält["2640"]?.debet ?? 0,
        kredit: 0,
      },
      {
        konto: "6064 Factoringavgifter",
        debet: extrafält["6064"]?.debet ?? 0,
        kredit: 0,
      },
    ];
    const totalDebet = rows.reduce((s, r) => s + r.debet, 0);
    const totalKredit = rows.reduce((s, r) => s + r.kredit, 0);

    return (
      <main className="min-h-screen text-white bg-slate-950 px-4">
        <div className="max-w-5xl mx-auto bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg p-10">
          <h1 className="text-3xl mb-4 text-center">Steg&nbsp;3: Kontrollera och slutför</h1>
          <p className="text-center font-bold text-xl mb-1">
            Avgifter avräkningsnota&nbsp;25&nbsp;% moms
          </p>
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
  })();

  return <>{mode === "steg2" ? step2 : step3}</>;
}
