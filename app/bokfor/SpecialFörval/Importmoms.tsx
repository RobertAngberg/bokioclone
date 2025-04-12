"use client";

import { useState } from "react";
import { LaddaUppFil } from "../LaddaUppFil";
import Forhandsgranskning from "../Forhandsgranskning";
import Falt from "./Falt"; // 👈 ny komponent används här

interface ImportmomsProps {
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

export default function Importmoms({
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
}: ImportmomsProps) {
  const [summaAttBetala, setSummaAttBetala] = useState("");
  const [tullOchSpedition, setTullOchSpedition] = useState("");
  const [ingFiktivMoms, setIngFiktivMoms] = useState("");
  const [ovrigaSkatter, setOvrigaSkatter] = useState("");

  const handleSubmit = () => {
    const val1930 = round(parseFloat(summaAttBetala || "0"));
    const valTull = round(parseFloat(tullOchSpedition || "0"));
    const valFiktiv = round(parseFloat(ingFiktivMoms || "0"));
    const valOvriga = round(parseFloat(ovrigaSkatter || "0"));

    const importVaror = round(valFiktiv * 4);
    const momsPåTull = round(valTull * 0.2);
    const nettobelopp5720 = round(valTull - momsPåTull);
    const totalt5720 = round(nettobelopp5720 + valOvriga);

    const extrafaltObj = {
      "1930": {
        label: "Företagskonto / affärskonto",
        debet: 0,
        kredit: val1930,
      },
      "2615": {
        label: "Utgående moms import av varor, 25%",
        debet: 0,
        kredit: valFiktiv,
      },
      "2640": {
        label: "Ingående moms",
        debet: momsPåTull,
        kredit: 0,
      },
      "2645": {
        label: "Beräknad ingående moms på förvärv från utlandet",
        debet: valFiktiv,
        kredit: 0,
      },
      "4545": {
        label: "Import av varor, 25 % moms",
        debet: importVaror,
        kredit: 0,
      },
      "4549": {
        label: "Motkonto beskattningsunderlag import",
        debet: 0,
        kredit: importVaror,
      },
      "5720": {
        label: "Tull- och speditionskostnader m.m.",
        debet: totalt5720,
        kredit: 0,
      },
    };

    setExtrafält(extrafaltObj);
    setCurrentStep(3);
  };

  return (
    <div className="flex flex-col-reverse justify-between h-auto max-w-4xl px-4 mx-auto md:flex-row text-white">
      <div className="w-full mb-10 md:w-2/5 md:mb-0">
        <h1 className="text-3xl font-bold mb-6 text-center">Steg 2: Importmoms</h1>

        <LaddaUppFil
          fil={fil}
          setFil={setFil}
          setPdfUrl={setPdfUrl}
          setTransaktionsdatum={setTransaktionsdatum}
          setBelopp={() => {}}
        />

        <Falt
          label="Summa att betala in"
          type="number"
          value={summaAttBetala}
          onChange={setSummaAttBetala}
        />

        <Falt
          label="Tull- och speditionskostnader m.m. (inkl. svensk moms)"
          type="number"
          value={tullOchSpedition}
          onChange={setTullOchSpedition}
        />

        <Falt
          label="Ingående fiktiv moms på förvärv från utlandet"
          type="number"
          value={ingFiktivMoms}
          onChange={setIngFiktivMoms}
        />

        <Falt
          label="Övriga skatter och tillval utan moms"
          type="number"
          value={ovrigaSkatter}
          onChange={setOvrigaSkatter}
        />

        <Falt label="Kommentar" type="textarea" value={kommentar ?? ""} onChange={setKommentar} />

        <Falt
          label="Betaldatum"
          type="date"
          value={transaktionsdatum ?? ""}
          onChange={setTransaktionsdatum}
        />

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
