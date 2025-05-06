// #region Huvud
"use client";

import LaddaUppFil from "./LaddaUppFil";
import Information from "./Information";
import Kommentar from "./Kommentar";
import Forhandsgranskning from "./Förhandsgranskning";

type KontoRad = {
  beskrivning: string;
  kontonummer?: string;
  debet?: boolean;
  kredit?: boolean;
};

type Förval = {
  id: number;
  namn: string;
  beskrivning: string;
  typ: string;
  kategori: string;
  konton: KontoRad[];
  sökord: string[];
  specialtyp?: string | null;
};

type Step2Props = {
  setCurrentStep: (step: number) => void;
  fil: File | null;
  setFil: (file: File | null) => void;
  pdfUrl: string | null;
  setPdfUrl: (url: string | null) => void;
  belopp: number | null;
  setBelopp: (amount: number | null) => void;
  transaktionsdatum: string | null;
  setTransaktionsdatum: (date: string | null) => void;
  kommentar: string | null;
  setKommentar: (comment: string | null) => void;
  valtFörval: Förval | null;
  extrafält: Record<string, { label: string; debet: number; kredit: number }>;
  setExtrafält: (fält: Record<string, { label: string; debet: number; kredit: number }>) => void;
};
// #endregion

export default function Steg2(props: Step2Props) {
  const { valtFörval } = props;

  // Rendera specialförval om sådant finns
  if (valtFörval?.specialtyp) {
    try {
      const SpecialComponent = require(`./SpecialFörval/${valtFörval.specialtyp}`).default;
      return <SpecialComponent mode="steg2" {...props} />;
    } catch (err) {
      return (
        <div className="p-10 text-white bg-red-900 text-center">
          ⚠️ Kunde inte ladda specialförval: {valtFörval.specialtyp}
        </div>
      );
    }
  }

  // Standardformulär
  return (
    <>
      <h1 className="mb-6 text-3xl text-center text-white">Steg 2: Fyll i uppgifter</h1>
      <div className="flex flex-col-reverse justify-between h-auto max-w-5xl px-4 mx-auto md:flex-row">
        {/* Formulärsektion */}
        <div className="w-full mb-10 md:w-[40%] md:mb-0 bg-slate-900 border border-gray-700 rounded-xl p-6 text-white">
          <LaddaUppFil
            fil={props.fil}
            setFil={props.setFil}
            setPdfUrl={props.setPdfUrl}
            setBelopp={props.setBelopp}
            setTransaktionsdatum={props.setTransaktionsdatum}
          />
          <Information
            belopp={props.belopp ?? 0}
            setBelopp={props.setBelopp}
            transaktionsdatum={props.transaktionsdatum}
            setTransaktionsdatum={props.setTransaktionsdatum}
          />

          <Kommentar kommentar={props.kommentar ?? ""} setKommentar={props.setKommentar} />
          <button
            type="button"
            onClick={() => props.setCurrentStep(3)}
            className="w-full flex items-center justify-center px-4 py-4 font-bold text-white rounded cursor-pointer bg-cyan-600 hover:bg-cyan-700"
          >
            Bokför
          </button>
        </div>

        {/* Förhandsgranskning */}
        <Forhandsgranskning fil={props.fil} pdfUrl={props.pdfUrl} />
      </div>
    </>
  );
}
