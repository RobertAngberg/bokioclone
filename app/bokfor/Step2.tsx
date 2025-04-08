"use client";

import { useEffect, useState } from "react";
import { FileUpload } from "./FileUpload";
import { Information } from "./Information";
import { Comment } from "./Comment";
import Image from "next/image";

type KontoRad = {
  beskrivning: string;
  kontonummer?: string;
  debet?: boolean;
  kredit?: boolean;
};

type Forval = {
  id: number;
  namn: string;
  beskrivning: string;
  typ: string;
  kategori: string;
  konton: KontoRad[];
  sökord: string[];
  extrafält?: any[];
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
  valdaFörval: Forval | null;
}

export function Step2({
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
  valdaFörval,
}: Step2Props) {
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    console.log("🧠 Steg 2 – mottagit valdaFörval:", valdaFörval);
  }, [valdaFörval]);

  const handleSubmit = () => {
    setCurrentStep(3);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 1));

  return (
    <>
      <h1 className="mb-6 text-4xl font-bold text-center text-white">Steg 2: Fyll i uppgifter</h1>

      <div className="flex flex-col-reverse justify-between h-auto max-w-4xl px-4 mx-auto md:flex-row">
        <div className="w-full mb-10 text-white md:w-2/5 md:mb-0">
          <FileUpload
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

          <Comment kommentar={kommentar ?? ""} setKommentar={setKommentar} />

          <button
            type="button"
            className="flex items-center justify-center w-full px-4 py-6 font-bold text-white rounded bg-cyan-600 hover:bg-cyan-700"
            onClick={handleSubmit}
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
              className="object-contain object-left w-auto h-auto max-w-full"
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

          {(fil || pdfUrl) && (
            <div className="hidden md:block">
              <button
                onClick={handleZoomIn}
                className="absolute z-10 flex items-center justify-center w-12 h-12 mb-2 text-white rounded-full top-2 right-2 bg-cyan-600 hover:bg-cyan-700"
              >
                🔍+
              </button>
              <button
                onClick={handleZoomOut}
                className="absolute z-10 flex items-center justify-center w-12 h-12 text-white rounded-full top-16 right-2 bg-cyan-600 hover:bg-cyan-700"
              >
                🔍-
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
