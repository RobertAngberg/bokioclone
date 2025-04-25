"use client";

import React from "react";
import MainLayout from "../_components/MainLayout";

const intäkter = [
  { namn: "Försäljning av varor", belopp: 120_000 },
  { namn: "Tjänsteintäkter", belopp: 45_000 },
];

const kostnader = [
  { namn: "Löner", belopp: 60_000 },
  { namn: "Lokalhyra", belopp: 15_000 },
  { namn: "Kontorsmaterial", belopp: 3_000 },
  { namn: "Övriga kostnader", belopp: 5_500 },
];

export default function Resultaträkning() {
  const summaIntäkter = intäkter.reduce((sum, post) => sum + post.belopp, 0);
  const summaKostnader = kostnader.reduce((sum, post) => sum + post.belopp, 0);
  const resultat = summaIntäkter - summaKostnader;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-white text-center">📈 Resultaträkning</h1>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-cyan-300 mb-2">Intäkter</h2>
          <ul className="space-y-1">
            {intäkter.map((post) => (
              <li key={post.namn} className="flex justify-between text-white">
                <span>{post.namn}</span>
                <span>{post.belopp.toLocaleString("sv-SE")} kr</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-slate-600 mt-3 pt-2 font-semibold text-white">
            <span>Summa intäkter</span>
            <span>{summaIntäkter.toLocaleString("sv-SE")} kr</span>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-cyan-300 mb-2">Kostnader</h2>
          <ul className="space-y-1">
            {kostnader.map((post) => (
              <li key={post.namn} className="flex justify-between text-white">
                <span>{post.namn}</span>
                <span>{post.belopp.toLocaleString("sv-SE")} kr</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-slate-600 mt-3 pt-2 font-semibold text-white">
            <span>Summa kostnader</span>
            <span>{summaKostnader.toLocaleString("sv-SE")} kr</span>
          </div>
        </section>

        <section className="mt-6 border-t border-slate-700 pt-4">
          <div className="flex justify-between text-lg font-bold text-white">
            <span>Resultat</span>
            <span className={resultat >= 0 ? "text-green-400" : "text-red-400"}>
              {resultat.toLocaleString("sv-SE")} kr
            </span>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
