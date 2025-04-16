"use client";

import { useEffect, useState } from "react";
import { hämtaAllaTransaktioner, hämtaTransaktionsposter, taBortTransaktion } from "./actions";

type Transaktion = {
  transaktions_id: number;
  transaktionsdatum: string;
  kontobeskrivning: string;
  belopp: number;
  fil: string;
  kommentar: string;
  userId: number | null;
  konton?: Transaktionskonto[];
};

type Transaktionskonto = {
  konto_id: number;
  kontobeskrivning: string;
  debet: number;
  kredit: number;
};

export default function VisaTransaktioner() {
  const [transaktioner, setTransaktioner] = useState<Transaktion[]>([]);
  const [loading, setLoading] = useState(true);
  const [öppen, setÖppen] = useState<number | null>(null);

  useEffect(() => {
    const hämta = async () => {
      const data = await hämtaAllaTransaktioner();

      const konverterade = data.map((rad: any) => ({
        transaktions_id: rad.transaktions_id,
        transaktionsdatum: new Date(rad.transaktionsdatum).toISOString().split("T")[0],
        kontobeskrivning: rad.kontobeskrivning ?? "",
        belopp: Number(rad.belopp ?? 0),
        fil: rad.fil ?? "",
        kommentar: rad.kommentar ?? "",
        userId: rad.userId ?? null,
      }));

      setTransaktioner(konverterade);
      setLoading(false);
    };

    hämta();
  }, []);

  const handleDelete = async (id: number) => {
    const confirm = window.confirm("Ta bort denna transaktion?");
    if (!confirm) return;

    await taBortTransaktion(id);
    setTransaktioner((prev) => prev.filter((t) => t.transaktions_id !== id));
  };

  const visaKonton = async (transaktionsId: number) => {
    if (öppen === transaktionsId) {
      setÖppen(null);
      return;
    }

    const poster = await hämtaTransaktionsposter(transaktionsId);
    setTransaktioner((prev) =>
      prev.map((t) => (t.transaktions_id === transaktionsId ? { ...t, konton: poster } : t))
    );
    setÖppen(transaktionsId);
  };

  return (
    <main className="p-6 text-white my-10 max-w-6xl mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-center">Transaktioner</h1>

      {loading ? (
        <p className="text-center text-gray-300">🔄 Laddar transaktioner...</p>
      ) : transaktioner.length === 0 ? (
        <p className="text-center text-gray-400 italic">Inga transaktioner hittades.</p>
      ) : (
        <div className="overflow-x-auto border border-slate-700 rounded-lg shadow">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-800 text-left">
                <th className="p-3">ID</th>
                <th className="p-3">Datum</th>
                <th className="p-3">Konto</th>
                <th className="p-3 text-right">Belopp</th>
                <th className="p-3">Fil</th>
                <th className="p-3">Kommentar</th>
                <th className="p-3">Användare</th>
                <th className="p-3 text-center text-2xl">🗑</th>
              </tr>
            </thead>
            <tbody>
              {transaktioner.map((t, i) => {
                const rowBg = i % 2 === 0 ? "bg-slate-850" : "bg-slate-800";
                return (
                  <tr key={t.transaktions_id} className={`${rowBg} text-white`}>
                    <td className="p-3">{t.transaktions_id}</td>
                    <td className="p-3">{t.transaktionsdatum}</td>
                    <td className="p-3">
                      <button
                        className="text-cyan-400 underline hover:text-cyan-300"
                        onClick={() => visaKonton(t.transaktions_id)}
                      >
                        Visa konton
                      </button>
                      {t.transaktions_id === öppen && t.konton && (
                        <ul className="mt-2 text-sm text-gray-300 space-y-1">
                          {t.konton.map((konto, i) => (
                            <li key={`${konto.konto_id}_${i}`}>
                              <span className="font-medium text-white">
                                {konto.kontobeskrivning}
                              </span>{" "}
                              – Debet:{" "}
                              {konto.debet.toLocaleString("sv-SE", {
                                style: "currency",
                                currency: "SEK",
                              })}{" "}
                              | Kredit:{" "}
                              {konto.kredit.toLocaleString("sv-SE", {
                                style: "currency",
                                currency: "SEK",
                              })}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {t.belopp.toLocaleString("sv-SE", {
                        style: "currency",
                        currency: "SEK",
                      })}
                    </td>
                    <td className="p-3">
                      {t.fil ? (
                        <span className="text-cyan-300 underline">{t.fil}</span>
                      ) : (
                        <span className="italic text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      {t.kommentar ? t.kommentar : <span className="italic text-gray-400">—</span>}
                    </td>
                    <td className="p-3">
                      {t.userId !== null ? (
                        t.userId
                      ) : (
                        <span className="italic text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(t.transaktions_id)}
                        className="text-red-500 hover:text-red-700"
                        title="Radera transaktion"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
