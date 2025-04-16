"use client";

import { useEffect, useState } from "react";
import { hämtaAllaTransaktioner, taBortTransaktion, hämtaTransaktionsposter } from "./actions";

type Transaktion = {
  transaktions_id: number;
  transaktionsdatum: string;
  kontobeskrivning: string;
  belopp: number;
  fil: string;
  kommentar: string;
  userId: number | null;
};

type KontoRad = {
  kontonummer?: string;
  beskrivning?: string;
  debet: number;
  kredit: number;
};

export default function VisaTransaktioner() {
  const [transaktioner, setTransaktioner] = useState<Transaktion[]>([]);
  const [loading, setLoading] = useState(true);
  const [visaKonton, setVisaKonton] = useState<Record<number, boolean>>({});
  const [kontonPerTransaktion, setKontonPerTransaktion] = useState<Record<number, KontoRad[]>>({});

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

  const toggleKonton = async (id: number) => {
    const redanHämtade = kontonPerTransaktion[id];
    if (!redanHämtade) {
      const poster = await hämtaTransaktionsposter(id);
      setKontonPerTransaktion((prev) => ({ ...prev, [id]: poster }));
    }
    setVisaKonton((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm("Ta bort denna transaktion?");
    if (!confirm) return;
    await taBortTransaktion(id);
    setTransaktioner((prev) => prev.filter((t) => t.transaktions_id !== id));
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
                <th className="p-3">Belopp</th>
                <th className="p-3">Fil</th>
                <th className="p-3">Kommentar</th>
                <th className="p-3">Användare</th>
                <th className="p-3">Konton</th>
                <th className="p-3 text-center text-2xl">🗑</th>
              </tr>
            </thead>
            <tbody>
              {transaktioner.map((t, i) => {
                const rowBg = i % 2 === 0 ? "bg-slate-850" : "bg-slate-800";
                const konton = kontonPerTransaktion[t.transaktions_id] ?? [];

                return (
                  <>
                    <tr key={`rad-${t.transaktions_id}`} className={`${rowBg} text-white`}>
                      <td className="p-3">{t.transaktions_id}</td>
                      <td className="p-3">{t.transaktionsdatum}</td>
                      <td className="p-3">{t.kontobeskrivning}</td>
                      <td className="p-3">
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
                        {t.kommentar ? (
                          t.kommentar
                        ) : (
                          <span className="italic text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        {t.userId !== null ? (
                          t.userId
                        ) : (
                          <span className="italic text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleKonton(t.transaktions_id)}
                          className="text-cyan-400 underline"
                        >
                          {visaKonton[t.transaktions_id] ? "Dölj konton" : "Visa konton"}
                        </button>
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

                    {visaKonton[t.transaktions_id] && konton.length > 0 && (
                      <tr key={`konton-${t.transaktions_id}`} className="bg-slate-900">
                        <td colSpan={9} className="p-4">
                          <table className="w-full border border-slate-700 text-sm text-white">
                            <thead>
                              <tr className="bg-slate-800">
                                <th className="p-2 text-left">Konto</th>
                                <th className="p-2 text-left">Beskrivning</th>
                                <th className="p-2 text-left">Debet</th>
                                <th className="p-2 text-left">Kredit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {konton.map((rad, index) => (
                                <tr
                                  key={`${rad.kontonummer ?? "okänt"}-${index}`}
                                  className="border-t border-slate-800"
                                >
                                  <td className="p-3 text-left">{rad.kontonummer ?? "okänt"}</td>
                                  <td className="p-3 text-left">{rad.beskrivning ?? "okänt"}</td>
                                  <td className="p-3 text-left">
                                    {rad.debet > 0
                                      ? rad.debet.toLocaleString("sv-SE", {
                                          minimumFractionDigits: 2,
                                        }) + " kr"
                                      : ""}
                                  </td>
                                  <td className="p-3 text-left">
                                    {rad.kredit > 0
                                      ? rad.kredit.toLocaleString("sv-SE", {
                                          minimumFractionDigits: 2,
                                        }) + " kr"
                                      : ""}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
