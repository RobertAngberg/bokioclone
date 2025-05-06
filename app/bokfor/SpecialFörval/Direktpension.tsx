// #region Huvud
"use client";

import { useEffect, useState } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import TextFält from "../../_components/TextFält";
import KnappFullWidth from "../../_components/KnappFullWidth";
import Tabell, { ColumnDefinition } from "../../_components/Tabell";
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

const formatSEK = (v: number) => v.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

export default function Direktpension(props: Props) {
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
  const [date, setDate] = useState(transaktionsdatum ?? "");
  const [comment, setComment] = useState(kommentar ?? "");

  useEffect(() => {
    if (!date) {
      const idag = new Date().toISOString().split("T")[0];
      setDate(idag);
      setTransaktionsdatum?.(idag);
    }
  }, [date, setTransaktionsdatum]);

  useEffect(() => {
    setKommentar?.(comment);
    setTransaktionsdatum?.(date);
  }, [comment, date, setKommentar, setTransaktionsdatum]);

  if (mode === "steg2") {
    const handleNext = () => {
      const val = parseFloat(total.replace(",", ".")) || 0;
      setBelopp?.(val);

      const extrafältObj = {
        "1385": { label: "Värde av kapitalförsäkring", debet: val, kredit: 0 },
        "1930": { label: "Företagskonto / affärskonto", debet: 0, kredit: val },
        "2230": {
          label: "Övriga avsättningar för pensioner och liknande förpliktelser",
          debet: 0,
          kredit: val,
        },
        "7421": { label: "Direktpension, ej avdragsgill", debet: val, kredit: 0 },
      };

      setExtrafält?.(extrafältObj);
      setCurrentStep?.(3);
    };

    return (
      <div className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Direktpension</h1>
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
              label="Totalt belopp"
              name="belopp"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              required
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">Betaldatum</label>
              <DatePicker
                wrapperClassName="w-full"
                className="w-full p-2 rounded bg-slate-900 text-white border border-gray-700"
                selected={date ? new Date(date) : null}
                onChange={(d) => {
                  const iso = d?.toISOString().split("T")[0] ?? "";
                  setDate(iso);
                }}
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
              disabled={isNaN(parseFloat(total))}
            />
          </div>

          <Forhandsgranskning fil={fil ?? null} pdfUrl={pdfUrl ?? null} />
        </div>
      </div>
    );
  }

  if (mode === "steg3") {
    const rad = extrafält;
    const rows = [
      {
        konto: "1385 Värde av kapitalförsäkring",
        debet: rad["1385"]?.debet ?? 0,
        kredit: 0,
      },
      {
        konto: "1930 Företagskonto / affärskonto",
        debet: 0,
        kredit: rad["1930"]?.kredit ?? 0,
      },
      {
        konto: "2230 Övriga avsättningar för pensioner och liknande förpliktelser",
        debet: 0,
        kredit: rad["2230"]?.kredit ?? 0,
      },
      {
        konto: "7421 Direktpension, ej avdragsgill",
        debet: rad["7421"]?.debet ?? 0,
        kredit: 0,
      },
    ];

    const totalDebet = rows.reduce((sum, r) => sum + r.debet, 0);
    const totalKredit = rows.reduce((sum, r) => sum + r.kredit, 0);

    const columns: ColumnDefinition<(typeof rows)[0]>[] = [
      { key: "konto", label: "Konto" },
      {
        key: "debet",
        label: "Debet",
        render: (val) => <div className="text-center">{val > 0 ? formatSEK(val) : ""}</div>,
      },
      {
        key: "kredit",
        label: "Kredit",
        render: (val) => <div className="text-center">{val > 0 ? formatSEK(val) : ""}</div>,
      },
    ];

    return (
      <main className="min-h-screen text-white bg-slate-950 px-4">
        <div className="max-w-5xl mx-auto bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg p-10">
          <h1 className="text-3xl mb-4 text-center">Steg 3: Kontrollera och slutför</h1>
          <p className="text-center font-bold text-xl mb-1">Direktpension</p>
          <p className="text-center text-gray-300 mb-8">
            {date ? new Date(date).toLocaleDateString("sv-SE") : ""}
          </p>

          <Tabell data={rows} columns={columns} getRowId={(row) => row.konto} />

          <div className="flex justify-end mt-4 text-lg font-bold">
            <span className="mr-4">Totalt:</span>
            <span className="w-28 text-center">{formatSEK(totalDebet)}</span>
            <span className="w-28 text-center">{formatSEK(totalKredit)}</span>
          </div>

          <form ref={formRef} action={handleSubmit} className="mt-8">
            <KnappFullWidth text="Slutför bokföring" pendingText="Bokför..." />
          </form>
        </div>
      </main>
    );
  }
}
