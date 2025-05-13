// #region Huvud
"use client";

import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import TextFält from "../../_components/TextFält";
import KnappFullWidth from "../../_components/KnappFullWidth";
import { ÅÅÅÅMMDDTillDate, dateTillÅÅÅÅMMDD } from "../../_utils/datum";
import DatePicker from "react-datepicker";
import Steg3 from "../Steg3";

interface Props {
  mode: "steg2" | "steg3";
  belopp?: number | null;
  setBelopp: (amount: number | null) => void;
  transaktionsdatum?: string | null;
  setTransaktionsdatum: (date: string) => void;
  kommentar?: string | null;
  setKommentar?: (comment: string | null) => void;
  setCurrentStep?: (step: number) => void;
  fil: File | null;
  setFil: (file: File | null) => void;
  pdfUrl: string | null;
  setPdfUrl: (url: string) => void;
  extrafält: Record<string, { label: string; debet: number; kredit: number }>;
  setExtrafält?: (fält: Record<string, { label: string; debet: number; kredit: number }>) => void;
}
// #endregion

export default function InkopTjansterSverigeOmvand({
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
  const giltigt = !!belopp && !!transaktionsdatum;

  function gåTillSteg3() {
    const moms = (belopp ?? 0) * 0.25;

    const extrafältObj = {
      "1930": { label: "Företagskonto / affärskonto", debet: 0, kredit: belopp ?? 0 },
      "2617": {
        label: "Utgående moms omvänd skattskyldighet varor och tjänster i Sverige, 25 %",
        debet: 0,
        kredit: moms,
      },
      "2647": {
        label: "Ingående moms omvänd skattskyldighet varor och tjänster i Sverige",
        debet: moms,
        kredit: 0,
      },
      "4400": {
        label: "Inköpta tjänster i Sverige, omvänd skattskyldighet",
        debet: 0,
        kredit: belopp ?? 0,
      },
      "4425": {
        label: "Inköpta tjänster i Sverige, omvänd skattskyldighet, 25 %",
        debet: belopp ?? 0,
        kredit: 0,
      },
      "4600": {
        label: "Legoarbeten och underentreprenader (gruppkonto)",
        debet: belopp ?? 0,
        kredit: 0,
      },
    };

    setExtrafält?.(extrafältObj);
    setCurrentStep?.(3);
  }

  if (mode === "steg2") {
    return (
      <section className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Inköp tjänster Sverige (omvänd moms)</h1>
        <div className="flex flex-col-reverse justify-between max-w-5xl mx-auto px-4 md:flex-row">
          <div className="w-full md:w-[40%] bg-slate-900 border border-gray-700 rounded-xl p-6">
            <LaddaUppFil
              fil={fil}
              setFil={setFil}
              setPdfUrl={setPdfUrl}
              setTransaktionsdatum={setTransaktionsdatum}
              setBelopp={setBelopp}
            />

            <TextFält
              label="Totalt belopp exkl. moms"
              name="belopp"
              value={belopp ?? ""}
              onChange={(e) => setBelopp(Number(e.target.value))}
              required
            />

            <label className="block text-sm font-medium text-white mb-2">Betaldatum</label>
            <DatePicker
              className="w-full p-2 mb-4 rounded bg-slate-900 text-white border border-gray-700"
              selected={ÅÅÅÅMMDDTillDate(transaktionsdatum ?? "")}
              onChange={(date) => setTransaktionsdatum(dateTillÅÅÅÅMMDD(date))}
              dateFormat="yyyy-MM-dd"
              locale="sv"
              required
            />

            <TextFält
              label="Kommentar"
              name="kommentar"
              value={kommentar ?? ""}
              onChange={(e) => setKommentar?.(e.target.value)}
              required={false}
            />

            <KnappFullWidth text="Bokför" onClick={gåTillSteg3} disabled={!giltigt} />
          </div>

          <Forhandsgranskning fil={fil} pdfUrl={pdfUrl} />
        </div>
      </section>
    );
  }

  if (mode === "steg3") {
    return (
      <Steg3
        kontonummer="4400"
        kontobeskrivning="Inköp tjänster Sverige (omvänd moms)"
        belopp={belopp ?? 0}
        transaktionsdatum={transaktionsdatum ?? ""}
        kommentar={kommentar ?? ""}
        valtFörval={{
          id: 0,
          namn: "Inköp tjänster Sverige (omvänd moms)",
          beskrivning: "",
          typ: "",
          kategori: "",
          konton: [],
          momssats: 0.25,
          specialtyp: "inkoptjanstersverigeomvand",
        }}
        setCurrentStep={setCurrentStep}
        extrafält={extrafält}
      />
    );
  }
}
