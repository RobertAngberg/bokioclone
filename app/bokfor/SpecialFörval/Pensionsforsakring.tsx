// #region Huvud
"use client";

import { useState } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import TextFält from "../../_components/TextFält";
import KnappFullWidth from "../../_components/KnappFullWidth";
import DatePicker from "react-datepicker";
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
  setExtrafält?: (fält: Record<string, { label: string; debet: number; kredit: number }>) => void;
}
// #endregion

export default function Pensionsforsakring({
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

  const giltigt = !!total && !!transaktionsdatum && Number(total) > 0;

  function gåVidare() {
    const val = Number(total);
    const loneskatt = val * 0.2425;

    const extrafaltObj = {
      "1930": { label: "Företagskonto / affärskonto", debet: 0, kredit: val },
      "2514": {
        label: "Beräknad särskild löneskatt på pensionskostnader",
        debet: 0,
        kredit: loneskatt,
      },
      "7412": {
        label: "Premier för individuella pensionsförsäkringar",
        debet: val,
        kredit: 0,
      },
      "7533": {
        label: "Särskild löneskatt för pensionskostnader",
        debet: loneskatt,
        kredit: 0,
      },
    };

    setBelopp(val);
    setExtrafält?.(extrafaltObj);
    setCurrentStep?.(3);
  }

  if (mode === "steg2") {
    return (
      <div className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Pensionsförsäkring</h1>
        <div className="flex flex-col-reverse justify-between max-w-5xl mx-auto px-4 md:flex-row">
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
              name="belopp"
              label="Totalt belopp"
              type="number"
              value={total}
              onChange={(e) => {
                setTotal(e.target.value);
                setBelopp(Number(e.target.value));
              }}
            />

            <TextFält
              name="kommentar"
              label="Kommentar"
              type="textarea"
              value={kommentar ?? ""}
              onChange={(e) => setKommentar?.(e.target.value)}
            />

            <label className="block text-sm font-medium text-white mb-2">
              Betaldatum (ÅÅÅÅ‑MM‑DD)
            </label>
            <DatePicker
              className="w-full p-2 mb-4 rounded text-white bg-slate-900 border border-gray-700"
              selected={transaktionsdatum ? new Date(transaktionsdatum) : null}
              onChange={(d) => setTransaktionsdatum(d ? d.toISOString().split("T")[0] : "")}
              dateFormat="yyyy-MM-dd"
              locale="sv"
              required
            />

            <KnappFullWidth text="Bokför" onClick={gåVidare} disabled={!giltigt} />
          </div>

          <Forhandsgranskning fil={fil ?? null} pdfUrl={pdfUrl ?? null} />
        </div>
      </div>
    );
  }

  if (mode === "steg3") {
    return (
      <Steg3
        kontonummer="7412"
        kontobeskrivning="Pensionsförsäkring"
        belopp={belopp ?? 0}
        transaktionsdatum={transaktionsdatum ?? ""}
        kommentar={kommentar ?? ""}
        valtFörval={{
          id: 0,
          namn: "Pensionsförsäkring",
          beskrivning: "",
          typ: "",
          kategori: "",
          konton: [],
          momssats: 0,
          specialtyp: "pensionsforsakring",
        }}
        setCurrentStep={setCurrentStep}
        extrafält={extrafält}
      />
    );
  }
}
