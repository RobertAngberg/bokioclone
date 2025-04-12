// Används som Steg2 för specialförval med custom inmatningsfält.
// Ändrar steg3 till custom preview enligt koden nedan.

"use client";

import { useEffect } from "react";
import Information from "../Information";
import { Kommentar } from "../Kommentar";
import Forhandsgranskning from "../Forhandsgranskning";
import LaddaUppFil from "../LaddaUppFil";

interface Props {
  belopp: number | null;
  setBelopp: (amount: number | null) => void;
  transaktionsdatum: string | null;
  setTransaktionsdatum: (date: string | null) => void;
  kommentar: string | null;
  setKommentar: (comment: string | null) => void;
  setCurrentStep: (step: number) => void;
  fil: File | null;
  setFil: (file: File | null) => void;
  pdfUrl: string | null;
  setPdfUrl: (url: string | null) => void;
  extrafält: Record<string, { label: string; debet: number; kredit: number }>;
  setExtrafält: (fält: Record<string, { label: string; debet: number; kredit: number }>) => void;
  specialtyp: string;
}

export default function CustomSteg3({
  belopp,
  setBelopp,
  transaktionsdatum,
  setTransaktionsdatum,
  kommentar,
  setKommentar,
  setCurrentStep,
  fil,
  setFil,
  pdfUrl,
  setPdfUrl,
  extrafält,
  setExtrafält,
  specialtyp,
}: Props) {
  useEffect(() => {
    if (belopp == null) return;

    if (specialtyp === "InköpTjänstUtanfEU") {
      setExtrafält({
        "1930": {
          label: "Företagskonto / affärskonto",
          debet: 0,
          kredit: belopp,
        },
        "2614": {
          label: "Utgående moms omvänd skattskyldighet, 25 %",
          debet: 0,
          kredit: belopp * 0.25,
        },
        "2645": {
          label: "Beräknad ingående moms på förvärv från utlandet",
          debet: belopp * 0.25,
          kredit: 0,
        },
        "4531": {
          label: "Import tjänster land utanför EU, 25% moms",
          debet: belopp,
          kredit: 0,
        },
      });
    }

    // Lägg till fler specialtyper här senare
  }, [belopp, specialtyp, setExtrafält]);

  const handleSubmit = () => {
    setCurrentStep(3);
  };

  return (
    <>
      <h1 className="mb-10 text-4xl font-bold text-center text-white">
        Steg 2: Fyll i uppgifter ({specialtyp})
      </h1>

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
