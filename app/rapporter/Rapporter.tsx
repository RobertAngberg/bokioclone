"use client";

import Link from "next/link";
import MainLayout from "../_components/MainLayout";

const rapporter = [
  {
    emoji: "📚",
    title: "Huvudbok",
    description: "Transaktioner per konto.",
    href: "/huvudbok",
  },
  {
    emoji: "🏦",
    title: "Balansrapport",
    description: "Tillgångar/skulder vid ett visst datum.",
    href: "/rapporter/balansrapport",
  },
  {
    emoji: "📈",
    title: "Resultatrapport",
    description: "Intäkter minus kostnader för en period.",
    href: "/rapporter/resultatrapport",
  },
  {
    emoji: "📑",
    title: "Momsrapport",
    description: "Summering av ingående/utgående moms.",
    href: "/rapporter/momsrapport",
  },
];

export default function Rapporter() {
  return (
    <MainLayout>
      <h1 className="text-3xl mb-10 text-center text-white">Rapporter</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {rapporter.map((r) => (
          <Link
            key={r.title}
            href={r.href}
            className="block p-5 rounded-lg bg-gray-900 hover:bg-gray-800 transition"
          >
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>{r.emoji}</span>
              {r.title}
            </h2>
            <p className="text-sm italic text-gray-400 mt-1">{r.description}</p>
          </Link>
        ))}
      </div>
    </MainLayout>
  );
}
