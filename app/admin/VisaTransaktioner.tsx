"use client";

import { useEffect, useState, Fragment } from "react";
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
    <main className="p-6 text-white max-w-6xl mx-auto">
      <h1 className="mb-6 text-3xl font-bold">Transaktioner</h1>
      <p className="text-gray-400 mb-6">
        {transaktioner.length} transaktion{transaktioner.length !== 1 ? "er" : ""}
      </p>
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
                  <Fragment key={t.transaktions_id}>
                    {" "}
                    {/* ⬅️ unikt key här */}
                    <tr className={`${rowBg} text-white`}>{/* ... första raden ... */}</tr>
                    {visaKonton[t.transaktions_id] && konton.length > 0 && (
                      <tr className="bg-slate-900">{/* ... kontotabell ... */}</tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
