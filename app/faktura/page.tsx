"use client";

import { useState } from "react";
import { FakturaProvider } from "./FakturaProvider";
import DinaUppgifter from "./DinaUppgifter";
import ArtiklarTjanster from "./ArtiklarTjanster";
import KundUppgifter from "./KundUppgifter";
import Villkor from "./Villkor";
import Ovrigt from "./Ovrigt";
import Forhandsgranskning from "./Forhandsgranskning";
import ExportPdfButton from "./ExportPdfButton";
import ForhandsgranskaKnapp from "./ForhandsgranskaKnapp";

export default function FakturaPage() {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <FakturaProvider>
      <main className="flex justify-center p-4 print:hidden">
        <div className="w-full max-w-3xl space-y-4 mx-auto">
          <h1 className="mt-10 mb-10 text-4xl font-bold text-center text-white">
            Skapa en faktura
          </h1>

          <DinaUppgifter />
          <ArtiklarTjanster />
          <KundUppgifter />
          <Villkor />
          <Ovrigt />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <ExportPdfButton />
              <button
                onClick={() => console.log("💾 Spara")}
                className="h-10 px-4 bg-cyan-700 text-white rounded hover:bg-cyan-800"
              >
                💾 Spara
              </button>

              <button
                onClick={() => window.print()}
                className="h-10 px-4 bg-cyan-700 text-white rounded hover:bg-cyan-800"
              >
                🖨️ Skriv ut
              </button>
            </div>

            <ForhandsgranskaKnapp
              onClick={() => setShowPreview(true)}
              className="h-10 px-4 bg-cyan-700 text-white rounded hover:bg-cyan-800"
            />
          </div>
        </div>
      </main>

      {/* Osynlig version för PDF-export (måste ha layout!) */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <Forhandsgranskning />
      </div>

      {/* Modal med förhandsgranskning */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="relative shadow-xl rounded overflow-auto max-h-[95vh] max-w-[95vw] bg-white">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-2 right-2 text-black bg-gray-200 hover:bg-gray-300 rounded px-3 py-1 z-10"
            >
              Stäng
            </button>
            <div className="p-4 flex justify-center items-center">
              <div className="w-[210mm] h-[297mm] shadow border">
                <Forhandsgranskning />
              </div>
            </div>
          </div>
        </div>
      )}
    </FakturaProvider>
  );
}
