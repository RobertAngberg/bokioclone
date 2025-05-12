// #region Huvud
"use client";

import { useState } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import TextFält from "../../_components/TextFält";
import KnappFullWidth from "../../_components/KnappFullWidth";
import DatePicker from "react-datepicker";
import { formatSEK } from "../../_utils/format";
import { ÅÅÅÅMMDDTillDate, dateTillÅÅÅÅMMDD } from "../../_utils/datum";
import Steg3 from "../Steg3";

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
}
// #endregion

export default function Rantekostnader({
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
}: Props) {
  const [total, setTotal] = useState<string>(belopp ? belopp.toString() : "");
  const [amortering, setAmortering] = useState<string>("");

  const giltigt = !!total && !!transaktionsdatum && Number(total) > 0;

  function gåTillSteg3() {
    const totalVal = Number(total || "0");
    const amorteringVal = Number(amortering || "0");
    const rantaVal = Math.max(totalVal - amorteringVal, 0);

    const extrafaltObj = {
      "1930": { label: "Företagskonto / affärskonto", debet: 0, kredit: totalVal },
      "2310": { label: "Obligations- och förlagslån", debet: amorteringVal, kredit: 0 },
      "8410": {
        label: "Räntekostnader för långfristiga skulder",
        debet: rantaVal,
        kredit: 0,
      },
    };

    setExtrafält?.(extrafaltObj);
    setBelopp(totalVal);
    setCurrentStep?.(3);
  }

  if (mode === "steg2") {
    return (
      <div className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Räntekostnader</h1>
        <div className="flex flex-col-reverse md:flex-row justify-between max-w-5xl mx-auto px-4">
          <div className="w-full md:w-[40%] bg-slate-900 border border-gray-700 rounded-xl p-6">
            <LaddaUppFil
              fil={fil}
              setFil={setFil}
              setPdfUrl={setPdfUrl}
              setTransaktionsdatum={setTransaktionsdatum}
              setBelopp={(v) => {
                setBelopp(v);
                setTotal(v ? v.toString() : "");
              }}
            />

            <TextFält
              name="total"
              label="Summa ränta & amortering"
              type="number"
              value={total}
              onChange={(e) => {
                setTotal(e.target.value);
                setBelopp(Number(e.target.value));
              }}
            />
            <TextFält
              name="amortering"
              label="Varav amortering"
              type="number"
              value={amortering}
              onChange={(e) => setAmortering(e.target.value)}
            />

            <p className="text-sm text-gray-400 mb-4">
              Ränta: {formatSEK(Math.max(Number(total || 0) - Number(amortering || 0), 0))} kr
            </p>

            <TextFält
              name="kommentar"
              label="Kommentar"
              type="textarea"
              value={kommentar ?? ""}
              onChange={(e) => setKommentar?.(e.target.value)}
            />

            <label className="block text-sm font-medium text-white mb-2">Betaldatum</label>
            <DatePicker
              className="w-full p-2 mb-4 rounded text-white bg-slate-900 border border-gray-700"
              selected={transaktionsdatum ? new Date(transaktionsdatum) : null}
              onChange={(d) => setTransaktionsdatum(d ? d.toISOString().split("T")[0] : "")}
              dateFormat="yyyy-MM-dd"
              locale="sv"
              required
            />

            <KnappFullWidth text="Bokför" onClick={gåTillSteg3} disabled={!giltigt} />
          </div>
          <Forhandsgranskning fil={fil} pdfUrl={pdfUrl} />
        </div>
      </div>
    );
  }

  if (mode === "steg3") {
    return (
      <Steg3
        kontonummer="8410"
        kontobeskrivning="Räntekostnader"
        belopp={belopp ?? 0}
        transaktionsdatum={transaktionsdatum ?? ""}
        kommentar={kommentar ?? ""}
        valtFörval={{
          id: 0,
          namn: "Räntekostnader",
          beskrivning: "",
          typ: "",
          kategori: "",
          konton: [],
          momssats: 0,
          specialtyp: "rantekostnader",
        }}
        setCurrentStep={setCurrentStep}
        extrafält={extrafält}
      />
    );
  }
}
