// #region Huvud
"use client";

import { useEffect } from "react";
import KnappFullWidth from "../../_components/KnappFullWidth";
import TextFält from "../../_components/TextFält";
import Forhandsgranskning from "../Förhandsgranskning";
import LaddaUppFil from "../LaddaUppFil";
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

export default function AmorteringBanklan(props: Props) {
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

  /* ---------- Bokför‑hooken ---------- */
  const {
    /* ========= aktuella fältvärden ========= */
    state: {
      total: amortering, // TOTALT belopp som betalats (amortering + ränta)
      extra: ranta, // den del av totalen som är RÄNTA
      date, // betal‑datum som ISO‑sträng (yyyy‑mm‑dd)
      comment: kommentar, // frivillig kommentar
    },

    /* ========= setters som binds till inputs ========= */
    setters: {
      setTotal: setAmortering, // uppdaterar totalbelopp‑fältet
      setExtra: setRanta, // uppdaterar räntefältet
      setDate, // uppdaterar datum (ISO‑sträng eller "")
      setComment: setKommentar, // uppdaterar kommentar
    },

    valid, // true när obligatoriska fält (keys) är korrekt ifyllda
    toNum, // helper: säkert string → number, eller null om ogiltigt
    handlePdfAmount, // callback som LaddaUppFil ska anropa när PDF‑parsern hittar ett belopp
  } = useBokforForm({
    /* vilka fält som MÅSTE vara giltiga för att knappen ska kunna klickas */
    keys: ["total", "extra"],

    /* om det redan fanns ett datum i props: förifyll hook‑staten med det */
    defaultDate: props.transaktionsdatum,

    /* vad vi gör när PDF‑parsern skickar tillbaka ett belopp v */
    onPdfAmount: (v, setTotal) => {
      // fyll bara fältet om användaren inte redan skrivit något själv
      if (v !== null && amortering.trim() === "") {
        setTotal(String(v));
      }
      // tala om för huvudsystemet att standard‑belopp INTE ska skapa automatiska rader
      setBelopp?.(null);
    },
  });

  /* synka datum uppåt så Steg 3 visar korrekt datum */
  useEffect(() => {
    props.setTransaktionsdatum?.(date);
  }, [date, props]);

  /* ---------- submit ---------- */
  const submitStep2 = () => {
    if (!valid) return;

    const total = toNum(amortering)!;
    const rantaVal = toNum(ranta)!;
    const amortVal = total - rantaVal;
    if (amortVal < 0) return;

    setBelopp?.(null);

    setExtrafält?.({
      1930: { label: "Företagskonto / affärskonto", debet: 0, kredit: total },
      2350: {
        label: "Andra långfristiga skulder till kreditinstitut",
        debet: amortVal,
        kredit: 0,
      },
      8410: {
        label: "Räntekostnader för långfristiga skulder",
        debet: rantaVal,
        kredit: 0,
      },
    });

    setCurrentStep?.(3);
  };

  const formatSEK = (v: number) => v.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

  /* ---------- step 2 ---------- */
  const step2 = (
    <section id="Huvud" className="bg-cyan-950 text-white">
      <h1 className="mb-6 text-3xl text-center">Steg&nbsp;2: Amortering av banklån</h1>

      <div className="flex flex-col-reverse justify-between h-auto max-w-5xl px-4 mx-auto md:flex-row">
        <div className="w-full mb-10 md:w-[40%] md:mb-0 bg-slate-900 border border-gray-700 rounded-xl p-6 text-white">
          <LaddaUppFil
            fil={fil ?? null}
            setFil={setFil ?? (() => {})}
            setPdfUrl={setPdfUrl ?? (() => {})}
            setBelopp={handlePdfAmount}
            setTransaktionsdatum={setDate}
          />

          <TextFält
            label="Amorteringsbelopp"
            name="amortering"
            value={amortering}
            onChange={(e) => setAmortering(e.target.value)}
            required
          />

          <TextFält
            label="Varav räntekostnad"
            name="ranta"
            value={ranta}
            onChange={(e) => setRanta(e.target.value)}
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
            text="Bokför"
            pendingText="Bokför..."
            onClick={submitStep2}
            disabled={!valid}
          />
        </div>

        <Forhandsgranskning fil={fil ?? null} pdfUrl={pdfUrl ?? null} />
      </div>
    </section>
  );

  /* ---------- step 3 ---------- */
  const step3 = (() => {
    const rows: Row[] = Object.entries(extrafält || {}).map(([k, v]) => ({
      konto: `${k} ${v.label}`,
      debet: v.debet,
      kredit: v.kredit,
    }));
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
          <p className="text-center font-bold text-xl mb-1">Amortering av banklån</p>
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
  })();

  return <>{mode === "steg2" ? step2 : step3}</>;
}
