"use client";

import { useState } from "react";
import KnappFullWidth from "../../_components/KnappFullWidth";
import TextFält from "../../_components/TextFält";
import Forhandsgranskning from "../Förhandsgranskning";
import LaddaUppFil from "../LaddaUppFil";
import Tabell, { ColumnDefinition } from "../../_components/Tabell";
import DatePicker from "react-datepicker";

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

export default function AvgifterAvrakningsnotaMoms({
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
  transaktionsdatum,
  kommentar,
}: Props) {
  const [brutto, setBrutto] = useState<number | null>(null);
  const [date, setDate] = useState<Date | null>(
    transaktionsdatum ? new Date(transaktionsdatum) : null
  );
  const [comment, setComment] = useState(() => kommentar ?? "");

  const momsSats = 0.25;
  const formatSEK = (v: number) => v.toLocaleString("sv-SE", { minimumFractionDigits: 2 });
  const valid = !!brutto && brutto > 0;

  const beräknaExtrafält = () => {
    const total = brutto ?? 0;
    const moms = (total * momsSats) / (1 + momsSats);
    const netto = total - moms;

    return {
      6064: { label: "Factoringavgifter", debet: netto, kredit: 0 },
      2640: { label: "Ingående moms", debet: moms, kredit: 0 },
      1930: { label: "Företagskonto / affärskonto", debet: 0, kredit: total },
    };
  };

  const handleSubmitStep2 = () => {
    setExtrafält?.(beräknaExtrafält());
    setBelopp?.(brutto ?? null);
    setKommentar?.(comment);
    setTransaktionsdatum?.(date ? date.toISOString().split("T")[0] : null);
    setCurrentStep?.(3);
  };

  const rows = [
    {
      konto: "6064 Factoringavgifter",
      debet: extrafält["6064"]?.debet ?? 0,
      kredit: 0,
    },
    {
      konto: "2640 Ingående moms",
      debet: extrafält["2640"]?.debet ?? 0,
      kredit: 0,
    },
    {
      konto: "1930 Företagskonto / affärskonto",
      debet: 0,
      kredit: extrafält["1930"]?.kredit ?? 0,
    },
  ];

  const columns: ColumnDefinition<(typeof rows)[0]>[] = [
    { key: "konto", label: "Konto" },
    {
      key: "debet",
      label: "Debet",
      render: (v: number) => <div className="text-center">{v > 0 ? formatSEK(v) : ""}</div>,
    },
    {
      key: "kredit",
      label: "Kredit",
      render: (v: number) => <div className="text-center">{v > 0 ? formatSEK(v) : ""}</div>,
    },
  ];

  const totalDebet = rows.reduce((sum, r) => sum + r.debet, 0);
  const totalKredit = rows.reduce((sum, r) => sum + r.kredit, 0);

  if (mode === "steg2") {
    return (
      <section className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Avgifter avräkningsnota</h1>
        <div className="flex flex-col-reverse justify-between max-w-5xl mx-auto md:flex-row px-4">
          <div className="w-full mb-10 md:w-[40%] md:mb-0 bg-slate-900 border border-gray-700 rounded-xl p-6">
            <LaddaUppFil
              fil={fil ?? null}
              setFil={setFil ?? (() => {})}
              setPdfUrl={setPdfUrl ?? (() => {})}
              setBelopp={(v) => setBrutto(v)}
              setTransaktionsdatum={(val) => setDate(val ? new Date(val) : null)}
            />

            <TextFält
              label="Totalbelopp (inkl. moms)"
              name="brutto"
              value={brutto ?? ""}
              onChange={(e) => setBrutto(Number(e.target.value))}
              required
            />

            <label className="block text-sm font-medium text-white mb-2">
              Betaldatum (ÅÅÅÅ‑MM‑DD)
            </label>
            <DatePicker
              className="w-full p-2 mb-4 rounded text-white bg-slate-900 border border-gray-700"
              selected={date}
              onChange={(d) => setDate(d)}
              dateFormat="yyyy-MM-dd"
              locale="sv"
              required
            />

            <TextFält
              label="Kommentar"
              name="kommentar"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required={false}
            />

            <KnappFullWidth
              text="Gå vidare"
              pendingText="Vänta..."
              onClick={handleSubmitStep2}
              disabled={!valid}
            />
          </div>

          <Forhandsgranskning fil={fil ?? null} pdfUrl={pdfUrl ?? null} />
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen text-white bg-slate-950 px-4">
      <div className="max-w-5xl mx-auto bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg p-10">
        <h1 className="text-3xl mb-4 text-center">Steg 3: Kontrollera och slutför</h1>
        <p className="text-center font-bold text-xl mb-1">Avgifter avräkningsnota 25 % moms</p>
        <p className="text-center text-gray-300 mb-8">
          {date ? date.toLocaleDateString("sv-SE") : ""}
        </p>

        <Tabell data={rows} columns={columns} getRowId={(r) => r.konto} />

        <div className="flex justify-end mt-4 text-lg font-bold">
          <span className="mr-4">Totalt:</span>
          <span className="w-28 text-center">{formatSEK(totalDebet)}</span>
          <span className="w-28 text-center">{formatSEK(totalKredit)}</span>
        </div>

        <form ref={formRef} action={handleSubmit} className="mt-8">
          <KnappFullWidth text="Slutför bokföring" pendingText="Bokför..." />
        </form>
      </div>
    </section>
  );
}
