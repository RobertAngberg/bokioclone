"use client";

import { useState } from "react";
import { FileUpload } from "../FileUpload";
import Image from "next/image";

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
  extrafält: Record<string, any>;
  setExtrafält: (fält: Record<string, any>) => void;
}

const extrafältDefinitioner = [
  {
    namn: "summa_att_betala",
    label: "Summa att betala in",
    konto: "1930",
    beskrivning: "Företagskonto / affärskonto",
    debet: false,
    kredit: true,
  },
  {
    namn: "tull_och_spedition",
    label: "Tull- och speditionskostnader inkl. moms",
    konto: "5720",
    beskrivning: "Tull- och speditionskostnader m.m.",
    debet: true,
    kredit: false,
  },
  {
    namn: "ingående_fiktiv_moms",
    label: "Ingående fiktiv moms",
    konto: "2645",
    beskrivning: "Beräknad ingående moms på förvärv från utlandet",
    debet: true,
    kredit: false,
  },
  {
    namn: "övriga_skatter",
    label: "Övriga skatter och tillval utan moms",
    konto: "4549",
    beskrivning: "Motkonto beskattningsunderlag import",
    debet: false,
    kredit: true,
  },
];

export default function Importmoms({
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
  setExtrafält,
}: ImportmomsProps) {
  const [fält, setFält] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    const updated = {
      ...fält,
      [key]: value,
    };
    console.log("🟡 Uppdaterade fält:", updated);
    setFält(updated);

    const enriched: Record<string, any> = {};
    for (const def of extrafältDefinitioner) {
      enriched[def.namn] = {
        ...def,
        värde: updated[def.namn] || "0",
      };
    }

    console.log("🟢 Enriched extrafält skickas vidare till parent:", enriched);
    setExtrafält(enriched);
  };

  const handleSubmit = () => {
    setCurrentStep(3);
  };

  const [zoomLevel, setZoomLevel] = useState(1);

  return (
    <div className="flex flex-col-reverse justify-between h-auto max-w-4xl px-4 mx-auto md:flex-row text-white">
      <div className="w-full mb-10 md:w-2/5 md:mb-0">
        <h1 className="text-3xl font-bold mb-6 text-center">Steg 2: Importmoms</h1>

        <FileUpload
          fil={fil}
          setFil={setFil}
          setPdfUrl={setPdfUrl}
          setTransaktionsdatum={setTransaktionsdatum}
          setBelopp={setBelopp}
        />

        {extrafältDefinitioner.map((f) => (
          <div className="mb-4" key={f.namn}>
            <label>{f.label}</label>
            <input
              type="number"
              className="w-full p-2 rounded text-black"
              value={fält[f.namn] || ""}
              onChange={(e) => handleChange(f.namn, e.target.value)}
            />
          </div>
        ))}

        <div className="mb-4">
          <label>Kommentar</label>
          <textarea
            className="w-full p-2 rounded text-black"
            value={kommentar ?? ""}
            onChange={(e) => setKommentar(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label>Betaldatum (ÅÅÅÅ-MM-DD)</label>
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

      <div className="relative flex flex-col items-center justify-center w-full h-auto border-2 border-dashed border-cyan-500 md:w-3/5 md:ml-4 mb-4 md:mb-0">
        {!pdfUrl && !fil && <p className="text-gray-500">Ditt underlag kommer att visas här</p>}

        {fil?.type.startsWith("image/") && (
          <Image
            src={URL.createObjectURL(fil)}
            alt="Uploaded"
            width={800}
            height={600}
            className="object-contain object-left max-w-full"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}
          />
        )}

        {pdfUrl && !fil?.type.startsWith("image/") && (
          <iframe
            src={pdfUrl}
            className="w-full h-auto max-w-full"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}
            title="PDF Viewer"
          />
        )}
      </div>
    </div>
  );
}
