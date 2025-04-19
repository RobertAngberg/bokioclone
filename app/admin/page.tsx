"use client";

import VisaAllt from "./VisaAllt";
import VisaTransaktioner from "./VisaTransaktioner";
import ForvalDatabas from "./ForvalDatabas";
import VisaKonton from "./VisaKonton";
import SQLEditor from "./SQLEditor";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-10 bg-slate-950 md:px-10 text-slate-100">
      <div className="w-full max-w-5xl mx-auto">
        {/* Cyan-wrapper */}
        <div
          className="
            w-full space-y-6 p-8 bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg
            [&_details]:border [&_details]:border-slate-700 [&_details]:rounded-lg
            [&_details>summary]:bg-slate-900 [&_details>summary:hover]:bg-slate-800
            [&_details>summary]:rounded-lg [&_details>summary]:cursor-pointer
            [&_details>summary]:px-4 [&_details>summary]:py-3
            [&_details>summary]:flex [&_details>summary]:items-center [&_details>summary]:justify-between
            [&_details>summary]:text-lg [&_details>summary]:font-semibold
            [&_details>summary>span]:ml-auto
          "
        >
          <h1 className="text-3xl text-center text-white mb-6">Adminpanel</h1>

          {/* =============  Alla tabeller  ============= */}
          <details className="group">
            <summary>
              📑 Visa alla tabeller <span className="text-white">▼</span>
            </summary>
            <div className="p-4 bg-slate-900 group-open:rounded-b-lg">
              <VisaAllt />
            </div>
          </details>

          {/* =============  SQL‑verktyg  ============= */}
          <details className="group">
            <summary>
              🛠 SQL‑verktyg <span className="text-white">▼</span>
            </summary>
            <div className="p-4 bg-slate-900 group-open:rounded-b-lg">
              <SQLEditor />
            </div>
          </details>

          {/* =============  Transaktioner  ============= */}
          <details className="group">
            <summary>
              💾 Transaktioner <span className="text-white">▼</span>
            </summary>
            <div className="p-4 bg-slate-900 group-open:rounded-b-lg">
              <VisaTransaktioner />
            </div>
          </details>

          {/* =============  Kontoplan  ============= */}
          <details className="group">
            <summary>
              📚 Konton <span className="text-white">▼</span>
            </summary>
            <div className="p-4 bg-slate-900 group-open:rounded-b-lg">
              <VisaKonton />
            </div>
          </details>

          {/* =============  Förval‑databas  ============= */}
          <details className="group">
            <summary>
              📋 Förval <span className="text-white">▼</span>
            </summary>
            <div className="p-4 bg-slate-900 group-open:rounded-b-lg">
              <ForvalDatabas />
            </div>
          </details>
        </div>
      </div>
    </main>
  );
}
