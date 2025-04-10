"use client";

import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import { extractDataFromOCR } from "./actions";
import React from "react";

interface FileUploadProps {
  setFil: (file: File | null) => void;
  setPdfUrl: (url: string) => void;
  setTransaktionsdatum: (datum: string) => void;
  setBelopp: (belopp: number) => void;
  fil: File | null;
}

function LaddaUppFil({ setFil, setPdfUrl, setTransaktionsdatum, setBelopp }: FileUploadProps) {
  const [recognizedText, setRecognizedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeoutTriggered, setTimeoutTriggered] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setPdfUrl(fileUrl);
    setFil(file);

    if (file.type.startsWith("image/")) {
      setIsLoading(true);
      setTimeoutTriggered(false);

      // Timeout fallback after 7s
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setTimeoutTriggered(true);
      }, 7000);

      Tesseract.recognize(file, "swe").then((result) => {
        clearTimeout(timeout); // Cancel timeout if done in time
        setRecognizedText(result.data.text);
      });
    }
  };

  useEffect(() => {
    if (!recognizedText) return;

    (async () => {
      try {
        const parsed = await extractDataFromOCR(recognizedText);

        console.log("Parsed data:", parsed);

        if (parsed?.datum) setTransaktionsdatum(parsed.datum);
        if (!isNaN(parsed?.belopp)) setBelopp(Number(parsed.belopp));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [recognizedText, setBelopp, setTransaktionsdatum]);

  return (
    <>
      <input
        type="file"
        id="fileUpload"
        accept="application/pdf,image/png,image/jpeg"
        onChange={handleFileChange}
        required
        style={{ display: "none" }}
      />
      <label
        htmlFor="fileUpload"
        className="flex items-center justify-center px-4 py-2 mb-2 font-bold text-white rounded cursor-pointer bg-cyan-600 hover:bg-cyan-700"
      >
        Välj fil
      </label>

      {isLoading && (
        <div className="flex flex-col items-center justify-center mb-6 text-white">
          <div className="w-6 h-6 mb-2 border-4 rounded-full border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-sm text-cyan-200">Analyserar underlaget...</span>
        </div>
      )}

      {timeoutTriggered && (
        <div className="mb-6 text-sm text-center text-yellow-300">
          ⏱️ Tolkningen tog för lång tid – fyll i uppgifterna manuellt.
        </div>
      )}
    </>
  );
}

export { LaddaUppFil };
