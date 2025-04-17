"use client";

import VisaTransaktioner from "./VisaTransaktioner";
import ForvalDatabas from "./ForvalDatabas";
import VisaKonton from "./VisaKonton";
import SQLEditor from "./SQLEditor";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-10 bg-slate-950 md:px-10 text-slate-100">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <h1 className="mb-10 text-3xl text-center text-white">Adminpanel</h1>

        {/* =============  SQL‑verktyg  ============= */}
        <details
          className="group rounded-lg bg-slate-800/60 backdrop-blur-md shadow-lg ring-1 ring-slate-700/40"
          /* open  ➜  bort!  */
        >
          <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer list-none">
            <span className="text-lg">🛠 SQL‑verktyg</span>
            <span className="ml-auto transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div className="border-t border-slate-700/40 p-4">
            <SQLEditor />
          </div>
        </details>

        {/* =============  Transaktioner  ============= */}
        <details className="group rounded-lg bg-slate-800/60 backdrop-blur-md shadow-lg ring-1 ring-slate-700/40">
          <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer list-none">
            <span className="text-lg">💾 Transaktioner</span>
            <span className="ml-auto transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div className="border-t border-slate-700/40 p-4">
            <VisaTransaktioner />
          </div>
        </details>

        {/* =============  Kontoplan  ============= */}
        <details className="group rounded-lg bg-slate-800/60 backdrop-blur-md shadow-lg ring-1 ring-slate-700/40">
          <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer list-none">
            <span className="text-lg">📚 Kontoplan</span>
            <span className="ml-auto transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div className="border-t border-slate-700/40 p-4">
            <VisaKonton />
          </div>
        </details>

        {/* =============  Förval‑databas  ============= */}
        <details className="group rounded-lg bg-slate-800/60 backdrop-blur-md shadow-lg ring-1 ring-slate-700/40">
          <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer list-none">
            <span className="text-lg">📋 Förval</span>
            <span className="ml-auto transition-transform group-open:rotate-180">▼</span>
          </summary>
          <div className="border-t border-slate-700/40 p-4">
            <ForvalDatabas />
          </div>
        </details>
      </div>
    </main>
  );
}
