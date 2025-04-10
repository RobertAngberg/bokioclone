"use client";

import { useState } from "react";
import { FileUpload } from "../FileUpload";
import Image from "next/image";

interface ImportmomsProps {
  transaktionsdatum: string | null;
  setTransaktionsdatum: (date: string | null) => void;
  kommentar: string | null;
  setKommentar: (comment: string | null) => void;
  fil: File | null;
  setFil: (file: File | null) => void;
  pdfUrl: string | null;
  setPdfUrl: (url: string | null) => void;
  setCurrentStep: (step: number) => void;
  extrafält: Record<string, any>;
  setExtrafält: (fält: Record<string, any>) => void;
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
  const [zoomLevel, setZoomLevel] = useState(1);

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

        <FileUpload
          fil={fil}
          setFil={setFil}
          setPdfUrl={setPdfUrl}
          setTransaktionsdatum={setTransaktionsdatum}
          setBelopp={() => {}}
        />

        <div className="mb-4">
          <label>Summa att betala in</label>
          <input
            type="number"
            className="w-full p-2 rounded text-black"
            value={summaAttBetala}
            onChange={(e) => setSummaAttBetala(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label>Tull- och speditionskostnader m.m. (inkl. svensk moms)</label>
          <input
            type="number"
            className="w-full p-2 rounded text-black"
            value={tullOchSpedition}
            onChange={(e) => setTullOchSpedition(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label>Ingående fiktiv moms på förvärv från utlandet</label>
          <input
            type="number"
            className="w-full p-2 rounded text-black"
            value={ingFiktivMoms}
            onChange={(e) => setIngFiktivMoms(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label>Övriga skatter och tillval utan moms</label>
          <input
            type="number"
            className="w-full p-2 rounded text-black"
            value={ovrigaSkatter}
            onChange={(e) => setOvrigaSkatter(e.target.value)}
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
