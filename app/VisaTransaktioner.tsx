"use client";

import { useEffect, useState } from "react";
import { hämtaAllaTransaktioner } from "./start/actions";

type Transaktion = {
  transaktions_id: number;
  transaktionsdatum: string;
  kontobeskrivning: string;
  kontotyp: string;
  belopp: number;
  fil: string;
  kommentar: string;
  userId: number | null;
};

export default function VisaTransaktioner() {
  const [transaktioner, setTransaktioner] = useState<Transaktion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hämta = async () => {
      const data = await hämtaAllaTransaktioner();

      const konverterade = data.map((rad: any) => ({
        transaktions_id: rad.transaktions_id,
        transaktionsdatum: new Date(rad.transaktionsdatum).toISOString().split("T")[0],
        kontobeskrivning: rad.kontobeskrivning ?? "",
        kontotyp: rad.kontotyp ?? "",
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-white">Alla transaktioner</h2>

      {loading ? (
        <div className="text-white">🔄 Laddar transaktioner...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border border-gray-300 bg-white rounded shadow">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border border-gray-300">ID</th>
                <th className="px-4 py-2 border border-gray-300">Datum</th>
                <th className="px-4 py-2 border border-gray-300">Kontobeskrivning</th>
                <th className="px-4 py-2 border border-gray-300">Typ</th>
                <th className="px-4 py-2 border border-gray-300 text-right">Belopp</th>
                <th className="px-4 py-2 border border-gray-300">Fil</th>
                <th className="px-4 py-2 border border-gray-300">Kommentar</th>
                <th className="px-4 py-2 border border-gray-300">Användare</th>
              </tr>
            </thead>
            <tbody>
              {transaktioner.map((t) => (
                <tr key={t.transaktions_id} className="border-t border-gray-200">
                  <td className="px-4 py-2 border border-gray-300 text-gray-600">
                    {t.transaktions_id}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-gray-600">
                    {t.transaktionsdatum}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-gray-600">
                    {t.kontobeskrivning}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-gray-600">{t.kontotyp}</td>
                  <td className="px-4 py-2 border border-gray-300 text-right text-gray-600">
                    {t.belopp.toLocaleString("sv-SE", {
                      style: "currency",
                      currency: "SEK",
                    })}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-gray-600">
                    {t.fil ? t.fil : <span className="italic text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-gray-600">
                    {t.kommentar ? t.kommentar : <span className="italic text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-gray-600">
                    {t.userId ?? <span className="italic text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
