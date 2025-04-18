"use client";

// Context används för att centralt hantera fakturaformulärets data (formData)
// så att flera komponenter (t.ex. Avsändare, KundUppgifter, Artiklar och Förhandsgranskning)
// kan läsa och uppdatera datan utan att props behöver skickas runt manuellt.

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
    Object.entries(formData).forEach(([k, v]) =>
      fd.append(k, k === "artiklar" ? JSON.stringify(v) : String(v ?? ""))
    );
    const res = await saveInvoice(fd);
    alert(res.success ? "✅ Faktura sparad!" : "❌ Kunde inte spara fakturan.");
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 print:hidden text-slate-100 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        <div
          className="
            w-full space-y-6 p-8 bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg
            [&_details]:border [&_details]:border-slate-700 [&_details]:rounded-lg
            [&_details>summary]:rounded-lg [&_details>summary]:cursor-pointer
            [&_input]:rounded-lg [&_select]:rounded-lg [&_textarea]:rounded-lg
            [&_input]:bg-slate-900 [&_select]:bg-slate-900 [&_textarea]:bg-slate-900
            [&_input]:text-white [&_select]:text-white [&_textarea]:text-white
            [&_input]:border [&_select]:border [&_textarea]:border border-slate-700
          "
        >
          <h1 className="text-3xl text-center">Fakturor</h1>

          {/* Tidigare fakturor */}
          {/* <details>
            <summary className="px-4 py-3 text-lg font-semibold flex items-center justify-between bg-slate-900 hover:bg-slate-800">
              🧾 Tidigare fakturor <span className="ml-auto text-white">▼</span>
            </summary>
            <div className="p-4 bg-slate-900 rounded-b-lg">
              <FakturorLista />
            </div>
          </details> */}

          {/* Avsändare */}
          {/* <details>
            <summary className="px-4 py-3 text-lg font-semibold flex items-center justify-between bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer">
              🧑‍💼 Avsändare <span className="ml-auto text-white">▼</span>
            </summary>
            <Avsandare />
          </details> */}

          {/* Kunduppgifter */}
          <details>
            <summary className="px-4 py-3 text-lg font-semibold flex items-center justify-between bg-slate-900 hover:bg-slate-800">
              🧑‍💻 Kunduppgifter <span className="ml-auto text-white">▼</span>
            </summary>
            <div className="p-4 bg-slate-900 rounded-b-lg">
              <KundUppgifter />
            </div>
          </details>

          {/* Artiklar & Tjänster */}
          <details>
            <summary className="px-4 py-3 text-lg font-semibold flex items-center justify-between bg-slate-900 hover:bg-slate-800">
              📦 Produkter & Tjänster <span className="ml-auto text-white">▼</span>
            </summary>
            <div className="p-4 bg-slate-900 rounded-b-lg">
              <ArtiklarTjanster />
            </div>
          </details>

          {/* Villkor */}
          <details>
            <summary className="px-4 py-3 text-lg font-semibold flex items-center justify-between bg-slate-900 hover:bg-slate-800">
              ⚖️ Villkor <span className="ml-auto text-white">▼</span>
            </summary>
            <div className="p-4 bg-slate-900 rounded-b-lg">
              <Villkor />
            </div>
          </details>

          {/* Övrigt */}
          <details>
            <summary className="px-4 py-3 text-lg font-semibold flex items-center justify-between bg-slate-900 hover:bg-slate-800">
              🗒️ Övrigt <span className="ml-auto text-white">▼</span>
            </summary>
            <div className="p-4 bg-slate-900 rounded-b-lg">
              <Ovrigt />
            </div>
          </details>

          {/* Knapprad */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSave}
                className="h-10 px-4 bg-cyan-700 rounded-lg hover:bg-cyan-800"
              >
                💾 Spara
              </button>
              <ExportPdfButton />
              <button
                onClick={() => window.print()}
                className="h-10 px-4 bg-cyan-700 rounded-lg hover:bg-cyan-800"
              >
                🖨️ Skriv ut
              </button>
            </div>

            <ForhandsgranskaKnapp
              onClick={() => setShowPreview(true)}
              className="h-10 px-4 bg-cyan-700 rounded-lg hover:bg-cyan-800"
            />
          </div>
        </div>
      </div>

      {/* Dold för PDF-export */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <Forhandsgranskning />
      </div>

      {/* Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative bg-white shadow-xl rounded-2xl max-w-[95vw] max-h-[95vh] overflow-auto">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 rounded px-3 py-1"
            >
              Stäng
            </button>
            <div className="p-4 flex justify-center">
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
