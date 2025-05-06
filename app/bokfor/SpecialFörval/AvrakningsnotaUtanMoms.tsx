// #region Huvud
"use client";

import { useEffect } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import TextFält from "../../_components/TextFält";
import KnappFullWidth from "../../_components/KnappFullWidth";
import Tabell, { ColumnDefinition } from "../../_components/Tabell";
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

type Row = { konto: string; debet: number; kredit: number };
// #endregion

export default function AvrakningsnotaUtanMoms(props: Props) {
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

  /* ---------- Bokför‑hook ---------- */
  const {
    state: { total: beloppStr, date, comment: kommentar },
    setters: { setTotal: setBeloppStr, setDate, setComment: setKommentar },
    valid,
    toNum,
    handlePdfAmount,
  } = useBokforForm({
    keys: ["total"],
    defaultDate: props.transaktionsdatum,
    onPdfAmount: (v, set) => {
      if (v !== null && beloppStr.trim() === "") {
        set(String(v));
      }
      setBelopp?.(null);
    },
  });

  useEffect(() => {
    props.setTransaktionsdatum?.(date);
  }, [date, props]);

  const formatSEK = (v: number) => v.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

  /* ---------- step 2 ---------- */
  if (mode === "steg2") {
    const handleNext = () => {
      const summa = toNum(beloppStr);
      if (summa === null) return;

      setExtrafält?.({
        6570: {
          label: "Bankkostnader och transaktionsavgifter utan moms",
          debet: summa,
          kredit: 0,
        },
        1930: {
          label: "Företagskonto / affärskonto",
          debet: 0,
          kredit: summa,
        },
      });

      setBelopp?.(summa);
      props.setTransaktionsdatum?.(date);
      setCurrentStep?.(3);
    };

    return (
      <section id="Huvud" className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg&nbsp;2: Avräkningsnota utan moms</h1>
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
              label="Belopp"
              name="belopp"
              value={beloppStr}
              onChange={(e) => setBeloppStr(e.target.value)}
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

  /* ---------- step 3 ---------- */
  if (mode === "steg3") {
    const rows: Row[] = [
      {
        konto: "6570 Bankkostnader och transaktionsavgifter utan moms",
        debet: extrafält["6570"]?.debet ?? 0,
        kredit: 0,
      },
      {
        konto: "1930 Företagskonto / affärskonto",
        debet: 0,
        kredit: extrafält["1930"]?.kredit ?? 0,
      },
    ];

    const totDeb = rows.reduce((s, r) => s + r.debet, 0);
    const totKre = rows.reduce((s, r) => s + r.kredit, 0);

    const cols: ColumnDefinition<Row>[] = [
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
      <section className="min-h-screen text-white bg-slate-950 px-4">
        <div className="max-w-5xl mx-auto bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg p-10">
          <h1 className="text-3xl mb-6 text-center">Steg&nbsp;3: Kontrollera och slutför</h1>
          <p className="text-center font-bold text-xl mb-1">Avräkningsnota utan moms</p>
          <p className="text-center text-gray-300 mb-8">
            {date ? new Date(date).toLocaleDateString("sv-SE") : ""}
          </p>

          <Tabell data={rows} columns={cols} getRowId={(row) => row.konto} />

          <div className="flex justify-end mt-4 text-lg font-bold">
            <span className="mr-4">Totalt:</span>
            <span className="w-28 text-center">{formatSEK(totDeb)}</span>
            <span className="w-28 text-center">{formatSEK(totKre)}</span>
          </div>

          <form ref={formRef} action={handleSubmit} className="mt-8">
            <KnappFullWidth text="Slutför bokföring" pendingText="Bokför..." />
          </form>
        </div>
      </section>
    );
  }
}
