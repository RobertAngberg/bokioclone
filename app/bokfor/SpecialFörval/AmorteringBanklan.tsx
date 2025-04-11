"use client";

import { useState } from "react";
import { LaddaUppFil } from "../LaddaUppFil";
import Forhandsgranskning from "../Forhandsgranskning";

interface AmorteringProps {
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
}

const round = (val: number): number => Math.round((val + Number.EPSILON) * 100) / 100;

export default function AmorteringBanklan({
  fil,
  setFil,
  pdfUrl,
  setPdfUrl,
  transaktionsdatum,
  setTransaktionsdatum,
  kommentar,
  setKommentar,
  setCurrentStep,
  setExtrafält,
}: AmorteringProps) {
  const [total, setTotal] = useState("");
  const [ränta, setRänta] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleSubmit = () => {
    const valTotal = round(parseFloat(total || "0"));
    const valRänta = round(parseFloat(ränta || "0"));
    const amortering = round(valTotal - valRänta);

    const extrafaltObj = {
      "1930": {
        label: "Företagskonto / affärskonto",
        debet: 0,
        kredit: valTotal,
      },
      "2350": {
        label: "Andra långfristiga skulder till kreditinstitut",
        debet: amortering,
        kredit: 0,
      },
      "8410": {
        label: "Räntekostnader för långfristiga skulder",
        debet: valRänta,
        kredit: 0,
      },
    };

    setExtrafält(extrafaltObj);
    setCurrentStep(3);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 1));

  return (
    <div className="flex flex-col-reverse justify-between h-auto max-w-5xl px-4 mx-auto md:flex-row">
      <div className="w-full mb-10 text-white md:w-[40%] md:mb-0">
        <h1 className="text-3xl font-bold mb-6 text-center">Steg 2: Amortering Banklån</h1>

        <LaddaUppFil
          fil={fil}
          setFil={setFil}
          setPdfUrl={setPdfUrl}
          setTransaktionsdatum={setTransaktionsdatum}
          setBelopp={() => {}}
        />

        <div className="mb-4">
          <label>Summa amortering + ränta</label>
          <input
            type="number"
            className="w-full p-2 rounded text-black"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label>Varav ränta</label>
          <input
            type="number"
            className="w-full p-2 rounded text-black"
            value={ränta}
            onChange={(e) => setRänta(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label>Kommentar</label>
          <textarea
            className="w-full p-2 rounded text-black"
            value={kommentar ?? ""}
            onChange={(e) => setKommentar(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label>Betaldatum</label>
          <input
            type="date"
            className="w-full p-2 rounded text-black"
            value={transaktionsdatum ?? ""}
            onChange={(e) => setTransaktionsdatum(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full px-4 py-6 font-bold text-white rounded bg-cyan-600 hover:bg-cyan-700"
        >
          Bokför
        </button>
      </div>

      <Forhandsgranskning fil={fil} pdfUrl={pdfUrl} />
    </div>
  );
}
