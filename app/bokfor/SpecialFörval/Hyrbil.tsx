// #region Huvud
"use client";

import { useState } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import TextFält from "../../_components/TextFält";
import KnappFullWidth from "../../_components/KnappFullWidth";
import DatePicker from "react-datepicker";
import Steg3 from "../Steg3";
import { formatSEK } from "../../_utils/format";
import { ÅÅÅÅMMDDTillDate, dateTillÅÅÅÅMMDD } from "../../_utils/datum";
import { useAutofyllFrånPdf } from "../../_hooks/useAutofyllFrånPdf";

interface Props {
  mode: "steg2" | "steg3";
  belopp?: number | null;
  setBelopp: (val: number | null) => void;
  transaktionsdatum?: string | null;
  setTransaktionsdatum: (val: string) => void;
  kommentar?: string | null;
  setKommentar?: (val: string | null) => void;
  setCurrentStep?: (val: number) => void;
  fil: File | null;
  setFil: (val: File | null) => void;
  pdfUrl: string | null;
  setPdfUrl: (val: string) => void;
  extrafält: Record<string, { label: string; debet: number; kredit: number }>;
  setExtrafält?: (val: Record<string, { label: string; debet: number; kredit: number }>) => void;
  formRef?: React.RefObject<HTMLFormElement>;
  handleSubmit?: (formData: FormData) => void;
}
// #endregion

export default function Hyrbil({
  mode,
  belopp = null,
  setBelopp,
  transaktionsdatum = "",
  setTransaktionsdatum,
  kommentar = "",
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
  const [datum, setDatum] = useState(transaktionsdatum ?? new Date().toISOString().split("T")[0]);
  const [kommentarText, setKommentarText] = useState(kommentar ?? "");

  useAutofyllFrånPdf({
    extractedBelopp: belopp,
    currentBelopp: lokaltBelopp,
    setBelopp: setLokaltBelopp,
    extractedDatum: transaktionsdatum,
    currentDatum: datum,
    setDatum,
  });

  const moms = +(lokaltBelopp * 0.25 * 0.5).toFixed(2);
  const netto = +(lokaltBelopp - moms).toFixed(2);
  const giltigt = lokaltBelopp > 0 && !!datum;

  function gåVidare() {
    setBelopp(lokaltBelopp);
    setTransaktionsdatum(datum);
    setKommentar?.(kommentarText);

    setExtrafält?.({
      "1930": { label: "Företagskonto / affärskonto", debet: 0, kredit: lokaltBelopp },
      "5820": { label: "Hyrbilskostnader", debet: netto, kredit: 0 },
      "2640": { label: "Ingående moms", debet: moms, kredit: 0 },
    });

    setCurrentStep?.(3);
  }

  if (mode === "steg2") {
    return (
      <section className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Hyrbil</h1>
        <div className="flex flex-col-reverse justify-between max-w-5xl mx-auto px-4 md:flex-row">
          <div className="w-full md:w-[40%] bg-slate-900 border border-gray-700 rounded-xl p-6">
            <LaddaUppFil
              fil={fil}
              setFil={setFil}
              setPdfUrl={setPdfUrl}
              setTransaktionsdatum={setTransaktionsdatum}
              setBelopp={setLokaltBelopp}
            />

            <TextFält
              label="Total kostnad inkl. moms"
              name="kostnad"
              value={lokaltBelopp.toString()}
              onChange={(e) => setLokaltBelopp(Number(e.target.value))}
              required
            />

            <p className="text-sm text-gray-400 mb-4">
              Avdragbar moms (25% × 50%): {formatSEK(moms)} kr
            </p>

            <label className="block text-sm font-medium text-white mb-2">Betaldatum</label>
            <DatePicker
              className="w-full p-2 mb-4 rounded bg-slate-900 text-white border border-gray-700"
              selected={ÅÅÅÅMMDDTillDate(datum)}
              onChange={(d) => setDatum(d ? dateTillÅÅÅÅMMDD(d) : "")}
              dateFormat="yyyy-MM-dd"
              locale="sv"
            />

            <TextFält
              label="Kommentar"
              name="kommentar"
              value={kommentarText}
              onChange={(e) => setKommentarText(e.target.value)}
              required={false}
            />

            <KnappFullWidth text="Gå vidare" onClick={gåVidare} disabled={!giltigt} />
          </div>

          <Forhandsgranskning fil={fil} pdfUrl={pdfUrl} />
        </div>
      </section>
    );
  }

  if (mode === "steg3") {
    return (
      <Steg3
        kontonummer="5820"
        kontobeskrivning="Hyrbil"
        belopp={lokaltBelopp}
        transaktionsdatum={datum}
        kommentar={kommentarText}
        valtFörval={{
          id: 0,
          namn: "Hyrbil",
          beskrivning: "",
          typ: "",
          kategori: "",
          konton: [],
          momssats: 0.25,
          specialtyp: "hyrbil",
        }}
        setCurrentStep={setCurrentStep}
        extrafält={extrafält}
      />
    );
  }
}
