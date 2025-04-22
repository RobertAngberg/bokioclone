"use client";

import React, { useState, useEffect } from "react";
import VisaAllt from "./VisaAllt";
import VisaTransaktioner from "./VisaTransaktioner";
import ForvalDatabas from "./ForvalDatabas";
import VisaKonton from "./VisaKonton";
import SQLEditor from "./SQLEditor";
import Foretagsprofil from "./Foretagsprofil";
import Loading from "./Loading";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  // Exempel ifall du i framtiden vill ladda något centralt:
  // useEffect(() => {
  //   setIsLoading(true);
  //   someInit().finally(() => setIsLoading(false));
  // }, []);

  return (
    <main className="min-h-screen px-4 py-10 bg-slate-950 md:px-10 text-slate-100">
      <div className="w-full max-w-5xl mx-auto">
        <Loading isLoading={isLoading} minHeight="20rem">
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

            <details className="group">
              <summary>
                🧑‍💼 Företagsprofil <span className="text-white">▼</span>
              </summary>
              <div className="p-4 bg-slate-900 group-open:rounded-b-lg">
                <Foretagsprofil />
              </div>
            </details>

            <details className="group">
              <summary>
                📑 Visa alla tabeller <span className="text-white">▼</span>
              </summary>
              <div className="p-4 bg-slate-900 group-open:rounded-b-lg">
                <VisaAllt />
              </div>
            </details>

            <details className="group">
              <summary>
                🛠 SQL‑verktyg <span className="text-white">▼</span>
              </summary>
              <div className="p-4 bg-slate-900 group-open:rounded-b-lg">
                <SQLEditor />
              </div>
            </details>

            <details className="group">
              <summary>
                💾 Transaktioner <span className="text-white">▼</span>
              </summary>
              <div className="p-4 bg-slate-900 group-open:rounded-b-lg">
                <VisaTransaktioner />
              </div>
            </details>

            <details className="group">
              <summary>
                📚 Konton <span className="text-white">▼</span>
              </summary>
              <div className="p-4 bg-slate-900 group-open:rounded-b-lg">
                <VisaKonton />
              </div>
            </details>

            <details className="group">
              <summary>
                📋 Förval <span className="text-white">▼</span>
              </summary>
              <div className="p-4 bg-slate-900 group-open:rounded-b-lg">
                <ForvalDatabas />
              </div>
            </details>
          </div>
        </Loading>
      </div>
    </main>
  );
}
