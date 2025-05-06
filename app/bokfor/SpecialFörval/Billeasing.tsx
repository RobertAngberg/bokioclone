// #region Huvud
"use client";

import { useEffect, useState } from "react";
import { useBokforForm } from "../../_hooks/useBokforForm";
import TextFält from "../../_components/TextFält";
import KnappFullWidth from "../../_components/KnappFullWidth";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { sv } from "date-fns/locale/sv";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("sv", sv);

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
// #endregion

const formatSEK = (val: number) => val.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

export default function Billeasing({
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
  const {
    state: { total: leasing, extra: forsakring, date, comment },
    setters: { setTotal: setLeasing, setExtra: setForsakring, setDate, setComment },
    toNum,
    valid,
  } = useBokforForm({
    keys: ["total", "extra"],
    defaultDate: transaktionsdatum,
  });

  const [admin, setAdmin] = useState("");
  const [forhojd, setForhojd] = useState("0");

  useEffect(() => {
    setKommentar?.(comment);
    setTransaktionsdatum?.(date);
  }, [comment, date, setKommentar, setTransaktionsdatum]);

  if (mode === "steg2") {
    const handleNext = () => {
      const leasingEx = toNum(leasing) ?? 0;
      const adminEx = toNum(admin) ?? 0;
      const forsakringVal = toNum(forsakring) ?? 0;
      const forhojdInkl = toNum(forhojd) ?? 0;

      const momsLeasing = leasingEx * 0.25;
      const momsAdmin = adminEx * 0.25;
      const momsForhojd = forhojdInkl * 0.25;
      const nettoForhojd = forhojdInkl - momsForhojd;

      const total = leasingEx + adminEx + forsakringVal + forhojdInkl + momsLeasing + momsAdmin;
      setBelopp?.(total);

      setExtrafält?.({
        "1930": { label: "Företagskonto / affärskonto", debet: 0, kredit: total },
        "2640": { label: "Ingående moms", debet: momsLeasing + momsAdmin + momsForhojd, kredit: 0 },
        "5612": { label: "Försäkring och skatt för personbilar", debet: forsakringVal, kredit: 0 },
        "5615": { label: "Leasing av personbilar", debet: leasingEx, kredit: 0 },
        "6990": { label: "Övriga externa kostnader", debet: adminEx, kredit: 0 },
        "1720": { label: "Förutbetalda leasingavgifter", debet: nettoForhojd, kredit: 0 },
      });

      setCurrentStep?.(3);
    };

    return (
      <div className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Billeasing</h1>
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
              label="Leasingavgift (exkl. moms)"
              name="leasing"
              value={leasing}
              onChange={(e) => setLeasing(e.target.value)}
              required
            />

            <TextFält
              label="Försäkring + skatt"
              name="forsakring"
              value={forsakring}
              onChange={(e) => setForsakring(e.target.value)}
              required
            />

            <TextFält
              label="Adminavgifter (exkl. moms)"
              name="admin"
              value={admin}
              onChange={(e) => setAdmin(e.target.value)}
              required
            />

            <TextFält
              label="Förhöjd avgift (inkl. moms)"
              name="forhojd"
              value={forhojd}
              onChange={(e) => setForhojd(e.target.value)}
              required={false}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">Betaldatum</label>
              <DatePicker
                wrapperClassName="w-full"
                className="w-full p-2 rounded bg-slate-900 text-white border border-gray-700"
                selected={date ? new Date(date) : new Date()}
                onChange={(d) => setDate(d ? d.toISOString().split("T")[0] : "")}
                dateFormat="yyyy-MM-dd"
                locale="sv"
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
          <p className="text-center font-bold text-xl mb-1">Billeasing</p>
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
