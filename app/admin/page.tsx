"use client";

import { useState } from "react";
import VisaTransaktioner from "./VisaTransaktioner";
import ForvalDatabas from "./ForvalDatabas";
import VisaKonton from "./VisaKonton";

export default function Home() {
  const [öppen, setÖppen] = useState({
    forvalDatabas: true,
    transaktioner: true,
    visuellaFörval: false,
    konton: false,
  });

  return (
    <main className="min-h-screen px-4 py-10 text-white bg-slate-950 md:px-10">
      <div className="w-full max-w-5xl mx-auto text-center">
        <h1 className="mb-6 text-3xl">Admin</h1>
        {/* Förval-databas */}
        {/* <section>
          <h2
            className="text-2xl font-bold mb-4 border-b border-cyan-700 pb-1 cursor-pointer hover:text-cyan-300"
            onClick={() => setÖppen((prev) => ({ ...prev, forvalDatabas: !prev.forvalDatabas }))}
          >
            📋 Förval-databas
          </h2>
          {öppen.forvalDatabas && <ForvalDatabas />}
        </section> */}

        {/* Transaktioner */}
        <section>
          <h2
            className="text-2xl font-bold mb-4 border-b border-cyan-700 pb-1 cursor-pointer hover:text-cyan-300"
            onClick={() => setÖppen((prev) => ({ ...prev, transaktioner: !prev.transaktioner }))}
          >
            💾 Sparade transaktioner - Ta inte bort nåt
          </h2>
          {öppen.transaktioner && <VisaTransaktioner />}
        </section>

        {/* Kontoplan */}
        {/* <section>
          <h2
            className="text-2xl font-bold mb-4 border-b border-cyan-700 pb-1 cursor-pointer hover:text-cyan-300"
            onClick={() => setÖppen((prev) => ({ ...prev, konton: !prev.konton }))}
          >
            📚 Kontoplan
          </h2>
          {öppen.konton && <VisaKonton />}
        </section> */}
      </div>
    </main>
  );
}
