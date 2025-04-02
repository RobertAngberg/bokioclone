// FakturaPage.tsx
"use client";

import { FakturaProvider } from "./FakturaProvider";
import DinaUppgifter from "./DinaUppgifter";
import ArtiklarTjanster from "./ArtiklarTjanster";
import KundUppgifter from "./KundUppgifter";
import Villkor from "./Villkor";
import Ovrigt from "./Ovrigt";
import Forhandsgranskning from "./Forhandsgranskning";

export default function FakturaPage() {
  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <FakturaProvider>
      <main className="flex flex-col lg:flex-row gap-8 p-8 mx-auto">
        {/* Formulärkolumn */}
        <div className="flex-1 space-y-4 print:hidden">
          <h1 className="text-4xl font-bold mb-4">Skapa en faktura</h1>
          <DinaUppgifter />
          <ArtiklarTjanster />
          <KundUppgifter />
          <Villkor />
          <Ovrigt />
          <button
            onClick={handlePrint}
            className="mt-4 px-4 py-2 bg-cyan-700 text-white rounded hover:bg-cyan-800"
          >
            🖨️ Skriv ut
          </button>
        </div>

        {/* Previewkolumn med print-area */}
        <div className="flex-shrink-0 w-[210mm]" id="print-area">
          <Forhandsgranskning />
        </div>
      </main>
    </FakturaProvider>
  );
}
