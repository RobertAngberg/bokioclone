// #region Huvud
"use client";

import { useState } from "react";
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

export default function Importmoms({
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
  const [tull, setTull] = useState("");
  const [fiktiv, setFiktiv] = useState("");
  const [ovrigt, setOvrigt] = useState("");
  const giltigt = !!belopp && !!transaktionsdatum;
  const moms = parseFloat((parseFloat(tull || "0") * 0.25).toFixed(2));

  function gåTillSteg3() {
    const extrafältObj = {
      "1930": { label: "Företagskonto / affärskonto", debet: 0, kredit: belopp ?? 0 },
      "2641": { label: "Debiterad ingående moms", debet: moms, kredit: 0 },
      "4545": { label: "Inköp varor utanför EU", debet: parseFloat(tull || "0"), kredit: 0 },
      "2645": { label: "Beräknad moms utland", debet: parseFloat(fiktiv || "0"), kredit: 0 },
      "4799": { label: "Övriga avgifter", debet: parseFloat(ovrigt || "0"), kredit: 0 },
    };

    setExtrafält?.(extrafältObj);
    setCurrentStep?.(3);
  }

  if (mode === "steg2") {
    return (
      <section className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Importmoms</h1>
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
              label="Totalt belopp"
              name="belopp"
              value={belopp ?? ""}
              onChange={(e) => setBelopp(Number(e.target.value))}
              required
            />
            <TextFält
              label="Tull och spedition"
              name="tull"
              value={tull}
              onChange={(e) => setTull(e.target.value)}
              required
            />
            <TextFält
              label="Fiktiv moms"
              name="fiktiv"
              value={fiktiv}
              onChange={(e) => setFiktiv(e.target.value)}
              required
            />
            <TextFält
              label="Övriga skatter"
              name="ovrigt"
              value={ovrigt}
              onChange={(e) => setOvrigt(e.target.value)}
              required={false}
            />

            <label className="block text-sm font-medium text-white mb-2">Betaldatum</label>
            <DatePicker
              className="w-full p-2 mb-4 rounded bg-slate-900 text-white border border-gray-700"
              selected={ÅÅÅÅMMDDTillDate(transaktionsdatum)}
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
        kontonummer="4545"
        kontobeskrivning="Importmoms"
        belopp={belopp ?? 0}
        transaktionsdatum={transaktionsdatum ?? ""}
        kommentar={kommentar ?? ""}
        valtFörval={{
          id: 0,
          namn: "Importmoms",
          beskrivning: "",
          typ: "",
          kategori: "",
          konton: [],
          momssats: 0.25,
          specialtyp: "importmoms",
        }}
        setCurrentStep={setCurrentStep}
        extrafält={extrafält}
      />
    );
  }
}
