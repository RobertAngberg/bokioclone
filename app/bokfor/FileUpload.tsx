"use client";

import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
// import { extractDataFromOCR } from "./actions"; ❌ Temporarily disabled

interface FileUploadProps {
  setFil: (file: File | null) => void;
  setPdfUrl: (url: string) => void;
  setTransaktionsdatum: (datum: string) => void;
  setBelopp: (belopp: number) => void;
  fil: File | null;
}

function FileUpload({ setFil, setPdfUrl, setTransaktionsdatum, setBelopp, fil }: FileUploadProps) {
  const [recognizedText, setRecognizedText] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setPdfUrl(fileUrl); // For preview
    setFil(file); // For form submission

    if (file.type.startsWith("image/")) {
      Tesseract.recognize(file, "swe").then((result) => {
        setRecognizedText(result.data.text);
      });
    }
  };

  useEffect(() => {
    if (!recognizedText) return;

    (async () => {
      // const parsed = await extractDataFromOCR(recognizedText); ❌ Disabled temporarily
      // if (parsed?.datum) setTransaktionsdatum(parsed.datum);
      // if (!isNaN(parsed?.belopp)) setBelopp(Number(parsed.belopp));
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
        className="flex items-center justify-center px-4 py-2 mb-6 font-bold text-white rounded cursor-pointer bg-cyan-600 hover:bg-cyan-700"
      >
        Välj fil
      </label>
    </>
  );
}

export { FileUpload };
