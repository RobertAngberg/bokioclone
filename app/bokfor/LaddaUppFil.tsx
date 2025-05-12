// #region
"use client";

import { useState, useEffect } from "react";
import extractTextFromPDF from "pdf-parser-client-side";
import { extractDataFromOCR } from "./actions";
import Tesseract from "tesseract.js";

interface FileUploadProps {
  setFil: (file: File | null) => void;
  setPdfUrl: (url: string) => void;
  setTransaktionsdatum: (datum: string) => void;
  setBelopp: (belopp: number) => void;
  fil: File | null;
}
// #endregion

export default function LaddaUppFil({
  setFil,
  setPdfUrl,
  setTransaktionsdatum,
  setBelopp,
}: FileUploadProps) {
  const [recognizedText, setRecognizedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeoutTriggered, setTimeoutTriggered] = useState(false);

  useEffect(() => {
    if (!recognizedText) return;

    (async () => {
      try {
        const parsed = await extractDataFromOCR(recognizedText);
        console.log("📄 Parsed data från OpenAI:", parsed);

        if (!isNaN(parsed?.belopp)) setBelopp(Number(parsed.belopp));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [recognizedText, setBelopp, setTransaktionsdatum]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setPdfUrl(fileUrl);
    setFil(file);

    setIsLoading(true);
    setTimeoutTriggered(false);

    // Timeout fallback after 10s
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setTimeoutTriggered(true);
    }, 10000);

    try {
      let text = "";

      if (file.type === "application/pdf") {
        text = (await extractTextFromPDF(file, "clean")) || "";
      } else if (file.type.startsWith("image/")) {
        text = await förbättraOchLäsBild(file);
      }

      clearTimeout(timeout);
      setRecognizedText(text);
    } catch (error) {
      clearTimeout(timeout);
      setTimeoutTriggered(true);
      console.error("Fel vid textextraktion:", error);
    }
  };

  useEffect(() => {
    if (!recognizedText) return;

    (async () => {
      try {
        const parsed = await extractDataFromOCR(recognizedText);
        console.log("📄 Parsed data från OpenAI:", parsed);

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
        autoFocus
      />
      <label
        htmlFor="fileUpload"
        className="flex items-center justify-center px-4 py-2 mb-6 font-bold text-white rounded cursor-pointer bg-cyan-600 hover:bg-cyan-700"
      >
        Ladda upp underlag
      </label>

      {isLoading && (
        <div className="flex flex-col items-center justify-center mb-6 text-white">
          <div className="w-6 h-6 mb-2 border-4 rounded-full border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-sm text-cyan-200">Läser och tolkar dokument...</span>
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

// 🧠 Förbättrad OCR-funktion för bilder
async function förbättraOchLäsBild(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Kunde inte skapa canvas");

  canvas.width = img.width * 2;
  canvas.height = img.height * 2;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    const bw = avg > 150 ? 255 : 0;
    imageData.data[i] = bw;
    imageData.data[i + 1] = bw;
    imageData.data[i + 2] = bw;
  }
  ctx.putImageData(imageData, 0, 0);

  const processedBlob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/png")
  );

  const result = await Tesseract.recognize(processedBlob, "swe+eng", {
    logger: (m) => console.log(m),
  });

  return result.data.text;
}
