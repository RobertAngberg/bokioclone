"use client";

import { useEffect } from "react";
import { LaddaUppFil } from "./LaddaUppFil";
import { Information } from "./Information";
import { Kommentar } from "./Kommentar";
import Forhandsgranskning from "./Forhandsgranskning";
import Importmoms from "./SpecialFörval/Importmoms";
import AmorteringBanklan from "./SpecialFörval/AmorteringBanklan";
import DefaultSpecialFörvalSteg2 from "./SpecialFörval/DefaultSpecialFörvalSteg2";

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

interface Step2Props {
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
}

export default function Steg2({
  setCurrentStep,
  fil,
  setFil,
  pdfUrl,
  setPdfUrl,
  belopp,
  setBelopp,
  transaktionsdatum,
  setTransaktionsdatum,
  kommentar,
  setKommentar,
  valtFörval,
  extrafält,
  setExtrafält,
}: Step2Props) {
  // Hantera specialförval med egna komponenter
  if (valtFörval?.specialtyp === "Importmoms") {
    return (
      <Importmoms
        belopp={belopp}
        setBelopp={setBelopp}
        transaktionsdatum={transaktionsdatum}
        setTransaktionsdatum={setTransaktionsdatum}
        kommentar={kommentar}
        setKommentar={setKommentar}
        setCurrentStep={setCurrentStep}
        fil={fil}
        setFil={setFil}
        pdfUrl={pdfUrl}
        setPdfUrl={setPdfUrl}
        extrafält={extrafält}
        setExtrafält={setExtrafält}
      />
    );
  }

  if (valtFörval?.specialtyp === "AmorteringBanklån") {
    return (
      <AmorteringBanklan
        belopp={belopp}
        setBelopp={setBelopp}
        transaktionsdatum={transaktionsdatum}
        setTransaktionsdatum={setTransaktionsdatum}
        kommentar={kommentar}
        setKommentar={setKommentar}
        setCurrentStep={setCurrentStep}
        fil={fil}
        setFil={setFil}
        pdfUrl={pdfUrl}
        setPdfUrl={setPdfUrl}
        extrafält={extrafält}
        setExtrafält={setExtrafält}
      />
    );
  }

  // Hantera tysta specialförval med autogenererade extrafält
  if (valtFörval?.specialtyp) {
    return (
      <DefaultSpecialFörvalSteg2
        belopp={belopp}
        setBelopp={setBelopp}
        transaktionsdatum={transaktionsdatum}
        setTransaktionsdatum={setTransaktionsdatum}
        kommentar={kommentar}
        setKommentar={setKommentar}
        setCurrentStep={setCurrentStep}
        fil={fil}
        setFil={setFil}
        pdfUrl={pdfUrl}
        setPdfUrl={setPdfUrl}
        extrafält={extrafält}
        setExtrafält={setExtrafält}
        specialtyp={valtFörval.specialtyp}
      />
    );
  }

  // Standardförval (utan specialtyp)
  const handleSubmit = () => {
    setCurrentStep(3);
  };

  return (
    <>
      <h1 className="mb-10 text-4xl font-bold text-center text-white">Steg 2: Fyll i uppgifter</h1>

      <div className="flex flex-col-reverse justify-between h-auto max-w-5xl px-4 mx-auto md:flex-row">
        <div className="w-full mb-10 text-white md:w-[40%] md:mb-0">
          <LaddaUppFil
            fil={fil}
            setFil={setFil}
            setPdfUrl={setPdfUrl}
            setBelopp={setBelopp}
            setTransaktionsdatum={setTransaktionsdatum}
          />

          <Information
            belopp={belopp ?? 0}
            setBelopp={setBelopp}
            transaktionsdatum={transaktionsdatum}
            setTransaktionsdatum={setTransaktionsdatum}
          />

          <Kommentar kommentar={kommentar ?? ""} setKommentar={setKommentar} />

          <button
            type="button"
            className="flex items-center justify-center w-full px-4 py-6 font-bold text-white rounded bg-cyan-600 hover:bg-cyan-700"
            onClick={handleSubmit}
          >
            Bokför
          </button>
        </div>

        <Forhandsgranskning fil={fil} pdfUrl={pdfUrl} />
      </div>
    </>
  );
}
