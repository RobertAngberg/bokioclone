"use client";

import { useState } from "react";
import { FakturaProvider, useFakturaContext } from "./FakturaProvider";
import ArtiklarTjanster from "./ArtiklarTjanster";
import Avsandare from "./Avsandare";
import KundUppgifter from "./KundUppgifter";
import Villkor from "./Villkor";
import Ovrigt from "./Ovrigt";
import Forhandsgranskning from "./Forhandsgranskning";
import ExportPdfButton from "./ExportPdfButton";
import ForhandsgranskaKnapp from "./ForhandsgranskaKnapp";
import FakturorLista from "./FakturorLista";
import { saveInvoice } from "./actions";

function InnerFakturaPage() {
  const [showPreview, setShowPreview] = useState(false);
  const { formData } = useFakturaContext();

  const handleSave = async () => {
    const fd = new FormData();

    for (const [key, value] of Object.entries(formData)) {
      if (key === "artiklar") {
        fd.append(key, JSON.stringify(value));
      } else {
        fd.append(key, String(value ?? ""));
      }
    }

    const result = await saveInvoice(fd);
    if (result.success) {
      alert("✅ Faktura sparad!");
    } else {
      alert("❌ Kunde inte spara fakturan.");
    }
  };

  return (
    <main className="flex justify-center p-4 print:hidden">
      <div className="w-full max-w-3xl space-y-4 mx-auto">
        <h1 className="mt-6 mb-10 text-3xl text-center text-white">Fakturor</h1>
        <FakturorLista />
        <ArtiklarTjanster />
        <Avsandare />
        <KundUppgifter />
        <Villkor />
        <Ovrigt />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSave}
              className="h-10 px-4 bg-cyan-700 text-white rounded hover:bg-cyan-800"
            >
              💾 Spara
            </button>
            <ExportPdfButton />
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

      {/* Osynlig version för PDF-export */}
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
    </main>
  );
}

export default function FakturaPage() {
  return (
    <FakturaProvider>
      <InnerFakturaPage />
    </FakturaProvider>
  );
}
