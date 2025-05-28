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

export default function LaddaUppFil({
  setFil,
  setPdfUrl,
  setTransaktionsdatum,
  setBelopp,
  fil,
}: FileUploadProps) {
  const [recognizedText, setRecognizedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeoutTriggered, setTimeoutTriggered] = useState(false);

  useEffect(() => {
    if (!recognizedText) {
      console.log("⚠️ Ingen text att bearbeta i useEffect");
      return;
    }

    console.log("🤖 Skickar text till OpenAI för tolkning...");
    console.log("📝 Text som skickas (första 500 tecken):", recognizedText.substring(0, 500));
    console.log("📏 Total textlängd:", recognizedText.length);

    (async () => {
      try {
        const parsed = await extractDataFromOCR(recognizedText);
        console.log("📄 Parsed data från OpenAI:", parsed);

        if (parsed?.datum) {
          console.log("📅 Sätter datum:", parsed.datum);
          setTransaktionsdatum(parsed.datum);
        } else {
          console.log("⚠️ Inget datum hittades i OpenAI-svaret");
        }

        if (parsed?.belopp && !isNaN(parsed.belopp)) {
          console.log("💰 Sätter belopp:", parsed.belopp);
          setBelopp(Number(parsed.belopp));
        } else {
          console.log("⚠️ Inget giltigt belopp hittades i OpenAI-svaret");
        }
      } catch (error) {
        console.error("❌ Fel vid OpenAI-tolkning:", error);
      } finally {
        setIsLoading(false);
        console.log("✅ useEffect avslutad, loading = false");
      }
    })();
  }, [recognizedText, setBelopp, setTransaktionsdatum]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("⚠️ Ingen fil vald");
      return;
    }

    console.log("📁 Fil vald:", file.name, "Storlek:", file.size, "Typ:", file.type);

    // Validera filstorlek (4.5 MB limit för Vercel Functions)
    const maxSize = 4.5 * 1024 * 1024; // 4.5 MB i bytes
    if (file.size > maxSize) {
      console.log("❌ Fil för stor:", file.size, "bytes (max:", maxSize, "bytes)");
      alert("Filen är för stor. Maximal storlek är 4.5 MB.");
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    setPdfUrl(fileUrl);
    setFil(file);

    setIsLoading(true);
    setTimeoutTriggered(false);
    console.log("🔄 Startar textextraktion, loading = true");

    // Timeout fallback after 10s
    const timeout = setTimeout(() => {
      console.log("⏰ Timeout efter 10 sekunder!");
      setIsLoading(false);
      setTimeoutTriggered(true);
    }, 10000);

    try {
      let text = "";

      if (file.type === "application/pdf") {
        console.log("🔍 Försöker extrahera text från PDF...");
        text = (await extractTextFromPDF(file, "clean")) || "";
        console.log("📄 Extraherad text från PDF (första 300 tecken):", text.substring(0, 300));
        console.log("📏 PDF textlängd:", text.length);
      } else if (file.type.startsWith("image/")) {
        console.log("🔍 Försöker OCR på bild...");
        text = await förbättraOchLäsBild(file);
        console.log("📄 Extraherad text från bild (första 300 tecken):", text.substring(0, 300));
        console.log("📏 Bild textlängd:", text.length);
      } else {
        console.log("❌ Filtyp stöds inte:", file.type);
      }

      if (!text || text.trim().length === 0) {
        console.log("⚠️ Ingen text kunde extraheras från filen");
        setTimeoutTriggered(true);
        setIsLoading(false);
        clearTimeout(timeout);
        return;
      }

      console.log("✅ Text extraherad, rensar timeout och sätter recognizedText");
      clearTimeout(timeout);
      setRecognizedText(text);
    } catch (error) {
      console.error("❌ Fel vid textextraktion:", error);
      clearTimeout(timeout);
      setTimeoutTriggered(true);
      setIsLoading(false);
    }
  };

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
        {fil ? `📎 ${fil.name}` : "Ladda upp underlag"}
      </label>

      {fil && (
        <div className="mb-4 p-3 bg-slate-700 rounded">
          <div className="text-sm text-slate-300">
            📄 <strong>{fil.name}</strong>
          </div>
          <div className="text-xs text-slate-400">
            {(fil.size / 1024).toFixed(1)} KB • {fil.type}
          </div>
          <div className="text-xs text-green-400 mt-1">✅ Kommer sparas till din dokumentarkiv</div>
        </div>
      )}

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

      {/* Debug-info för utveckling */}
      {process.env.NODE_ENV === "development" && recognizedText && (
        <div className="mb-4 p-3 bg-gray-800 rounded text-xs">
          <div className="text-gray-400 mb-2">🐛 Debug - Extraherad text:</div>
          <div className="text-gray-300 max-h-32 overflow-y-auto">
            {recognizedText.substring(0, 1000)}
            {recognizedText.length > 1000 && "..."}
          </div>
        </div>
      )}
    </>
  );
}

// 🧠 Förbättrad OCR-funktion för bilder
async function förbättraOchLäsBild(file: File): Promise<string> {
  console.log("🖼️ Startar bildbearbetning för OCR...");

  const img = await createImageBitmap(file);
  console.log("🖼️ Bild skapad, storlek:", img.width, "x", img.height);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    console.log("❌ Kunde inte skapa canvas context");
    throw new Error("Kunde inte skapa canvas");
  }

  canvas.width = img.width * 2;
  canvas.height = img.height * 2;
  console.log("🖼️ Canvas storlek:", canvas.width, "x", canvas.height);

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Konvertera till svartvitt för bättre OCR
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

  console.log("🤖 Startar Tesseract OCR...");
  const result = await Tesseract.recognize(processedBlob, "swe+eng", {
    logger: (m) => {
      if (m.status === "recognizing text") {
        console.log(`🤖 OCR progress: ${(m.progress * 100).toFixed(1)}%`);
      }
    },
  });

  console.log("✅ OCR klar, text längd:", result.data.text.length);
  return result.data.text;
}
