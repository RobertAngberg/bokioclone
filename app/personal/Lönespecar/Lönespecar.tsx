//#region Huvud
"use client";

import { useState, useEffect, useCallback } from "react";
import AnimeradFlik from "../../_components/AnimeradFlik";
import Förhandsgranskning from "./Förhandsgranskning";
import Knapp from "../../_components/Knapp";
import { hämtaLönespecifikationer, hämtaFöretagsprofil, hämtaUtlägg } from "../actions";

interface LönespecProps {
  anställd?: any;
}
//#endregion

//#region State och Handlers
export default function Lönespecar({ anställd }: LönespecProps) {
  const [lönespecar, setLönespecar] = useState<any[]>([]);
  const [utlägg, setUtlägg] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [företagsprofil, setFöretagsprofil] = useState<any>(null);
  const [visaFörhandsgranskning, setVisaFörhandsgranskning] = useState<string | null>(null);

  const laddaLönespecifikationer = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Laddar lönespecifikationer för anställd ID:", anställd.id);
      const [lönespecData, företagsData, utläggData] = await Promise.all([
        hämtaLönespecifikationer(anställd.id),
        hämtaFöretagsprofil(anställd.user_id?.toString() || ""),
        hämtaUtlägg(anställd.id),
      ]);

      setLönespecar(lönespecData);
      setFöretagsprofil(företagsData);
      setUtlägg(utläggData);
      console.log(
        "✅ Laddade",
        lönespecData.length,
        "lönespecifikationer och",
        utläggData.length,
        "utlägg"
      );
    } catch (err) {
      console.error("❌ Fel vid laddning av lönespecifikationer:", err);
      setError("Kunde inte ladda lönespecifikationer");
    } finally {
      setLoading(false);
    }
  }, [anställd?.id, anställd?.user_id]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Avvisad: { color: "bg-red-600", text: "❌ Avvisad" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-gray-600",
      text: status,
    };

    return (
      <span className={`${config.color} text-white px-2 py-1 rounded-md text-sm font-medium`}>
        {config.text}
      </span>
    );
  };

  const getMånadsNamn = (månad: number, år: number): string => {
    const datum = new Date(år, månad - 1, 1);
    const månadsnamn = datum.toLocaleDateString("sv-SE", { month: "long", year: "numeric" });
    return månadsnamn.charAt(0).toUpperCase() + månadsnamn.slice(1);
  };

  const getLönespecStatusBadge = (status: string) => {
    const statusConfig = {
      Arkiverad: { color: "bg-gray-600", text: "📁 Arkiverad" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-blue-600",
      text: status,
    };

    return (
      <span className={`${config.color} text-white px-2 py-1 rounded-md text-sm font-medium`}>
        {config.text}
      </span>
    );
  };

  useEffect(() => {
    if (anställd?.id) {
      laddaLönespecifikationer();
    }
  }, [anställd?.id, laddaLönespecifikationer]);
  //#endregion

  return (
    <>
      <div className="space-y-4 max-w-6xl mx-auto">
        {/* Empty State */}
        {!loading && !error && lönespecar.length === 0 && utlägg.length === 0 && (
          <div className="bg-slate-800 p-8 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-white mb-3">
              📋 Inga lönespecifikationer eller utlägg skapade än
            </h3>
            <p className="text-gray-400 text-base mb-4">
              Klicka på &quot;Generera lönespec&quot; ovan för att skapa den första
              lönespecifikationen.
            </p>
          </div>
        )}

        {/* Lönespecifikationer Lista */}
        {!loading &&
          lönespecar.length > 0 &&
          lönespecar.map((lönespec) => {
            const månadsNamn = getMånadsNamn(lönespec.månad || 1, lönespec.år || 2025);
            const grundlön = parseFloat(lönespec.grundlön || lönespec.bruttolön || 0);
            const övertid = parseFloat(lönespec.övertid || 0);
            const bruttolön = parseFloat(lönespec.bruttolön || 0);
            const socialaAvgifter = parseFloat(lönespec.sociala_avgifter || 0);
            const skatt = parseFloat(lönespec.skatt || 0);
            const nettolön = parseFloat(lönespec.nettolön || 0);
            const utbetalningsDatum = new Date(lönespec.år, (lönespec.månad || 1) - 1, 25);

            // Alla utlägg för denna lönespec (även okopplade visas)
            const lönespecUtlägg = utlägg.filter(
              (u) => u.lönespecifikation_id === lönespec.id || !u.lönespecifikation_id
            );

            return (
              <AnimeradFlik
                key={lönespec.id}
                title={`Lönespec ${månadsNamn}`}
                icon="📅"
                visaSummaDirekt={`Netto: ${nettolön.toLocaleString("sv-SE")} kr`}
              >
                <div className="space-y-6">
                  {/* Header */}
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-bold text-white">
                        Lönespecifikation {månadsNamn}
                      </h4>
                      <div className="flex gap-2 items-center">
                        {getLönespecStatusBadge(lönespec.status)}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
                      <div>
                        <span className="font-semibold text-white">Löneperiod:</span>
                        <br />
                        <span className="text-gray-300">
                          {new Date(lönespec.period_start || lönespec.skapad).toLocaleDateString(
                            "sv-SE"
                          )}{" "}
                          -{" "}
                          {new Date(lönespec.period_slut || lönespec.skapad).toLocaleDateString(
                            "sv-SE"
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-white">Bankkonto:</span>
                        <br />
                        <span className="text-gray-300">
                          {anställd.clearingnummer}-{anställd.bankkonto}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-white">Lönespec ID:</span>
                        <br />
                        <span className="text-gray-300">#{lönespec.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lönetabell */}
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="text-lg font-bold text-white mb-4">Lönekomponenter</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="text-left text-white font-semibold py-2">Benämning</th>
                            <th className="text-right text-white font-semibold py-2">Antal</th>
                            <th className="text-right text-white font-semibold py-2">Kostnad</th>
                            <th className="text-right text-white font-semibold py-2">Summa</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-gray-300 py-2">Lön</td>
                            <td className="text-right text-gray-300 py-2">1 Månad</td>
                            <td className="text-right text-gray-300 py-2">
                              {grundlön.toLocaleString("sv-SE")} kr
                            </td>
                            <td className="text-right text-white font-medium py-2">
                              {grundlön.toLocaleString("sv-SE")} kr
                            </td>
                          </tr>
                          {övertid > 0 && (
                            <tr className="border-b border-slate-600">
                              <td className="text-gray-300 py-2">Övertid</td>
                              <td className="text-right text-gray-300 py-2">
                                {parseFloat(lönespec.övertid_timmar || 0)} h
                              </td>
                              <td className="text-right text-gray-300 py-2">
                                {övertid.toLocaleString("sv-SE")} kr
                              </td>
                              <td className="text-right text-white font-medium py-2">
                                {övertid.toLocaleString("sv-SE")} kr
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-600 space-y-2">
                      <div className="flex justify-between text-base">
                        <span className="text-white font-semibold">Totalt Lönekostnad</span>
                        <span className="text-white font-bold">
                          {(bruttolön + socialaAvgifter).toLocaleString("sv-SE")} kr
                        </span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span className="text-white font-semibold">Totalt Bruttolön</span>
                        <span className="text-white font-bold">
                          {bruttolön.toLocaleString("sv-SE")} kr
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">varav sociala avgifter</span>
                        <span className="text-gray-300">
                          {socialaAvgifter.toLocaleString("sv-SE")} kr
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">varav Skatt</span>
                        <span className="text-gray-300">{skatt.toLocaleString("sv-SE")} kr</span>
                      </div>
                    </div>
                  </div>

                  {/* Utlägg Sektion - inuti lönespec */}
                  {lönespecUtlägg.length > 0 && (
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        💳 Utlägg ({lönespecUtlägg.length})
                        <span className="text-sm font-normal text-gray-300">
                          {lönespecUtlägg
                            .reduce((sum, u) => sum + parseFloat(u.belopp || 0), 0)
                            .toLocaleString("sv-SE")}{" "}
                          kr
                        </span>
                      </h4>
                      <div className="space-y-3">
                        {lönespecUtlägg.map((utläggItem) => (
                          <div key={utläggItem.id} className="bg-slate-800 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="text-white font-medium">{utläggItem.beskrivning}</h5>
                                <p className="text-gray-400 text-sm">
                                  {new Date(utläggItem.datum).toLocaleDateString("sv-SE")}
                                  {utläggItem.kategori && ` • ${utläggItem.kategori}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-white font-bold">
                                  {parseFloat(utläggItem.belopp).toLocaleString("sv-SE")} kr
                                </div>
                              </div>
                            </div>

                            {utläggItem.kommentar && (
                              <div className="text-gray-400 text-sm mb-2">
                                {utläggItem.kommentar}
                              </div>
                            )}

                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>ID: #{utläggItem.id}</span>
                              <div className="flex gap-3">
                                {utläggItem.kvitto_fil && (
                                  <span>📎 Kvitto: {utläggItem.kvitto_fil}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sammanfattning */}
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="text-lg font-bold text-white mb-4">Sammanfattning</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-slate-800 p-4 rounded">
                          <div className="text-sm text-gray-400 mb-1">
                            Utbetalas: {utbetalningsDatum.toLocaleDateString("sv-SE")}
                          </div>
                          <div className="text-xl font-bold text-green-400">
                            Nettolön: {nettolön.toLocaleString("sv-SE")} kr
                          </div>
                        </div>

                        <div>
                          <h5 className="text-white font-semibold mb-2">Semesterdagar</h5>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">Betalda</span>
                              <div className="text-white font-medium">
                                {parseFloat(lönespec.semester_uttag || 0)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-400">Sparade</span>
                              <div className="text-white font-medium">
                                {parseFloat(anställd.sparade_dagar || 0)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-400">Förskott</span>
                              <div className="text-white font-medium">
                                {parseFloat(anställd.använda_förskott || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h5 className="text-white font-semibold mb-2">Skatt beräknad på</h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">Skattetabell</span>
                              <div className="text-white font-medium">{anställd.skattetabell}</div>
                            </div>
                            <div>
                              <span className="text-gray-400">Skattekolumn</span>
                              <div className="text-white font-medium">{anställd.skattekolumn}</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-white font-semibold mb-2">Totalt detta år</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Brutto</span>
                              <span className="text-white">
                                {bruttolön.toLocaleString("sv-SE")} kr
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Förmåner</span>
                              <span className="text-white">0,00 kr</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Skatt</span>
                              <span className="text-white">{skatt.toLocaleString("sv-SE")} kr</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 justify-center">
                    <Knapp
                      text="👁️ Förhandsgranska & Exportera PDF"
                      onClick={() => setVisaFörhandsgranskning(lönespec.id)}
                    />
                  </div>
                </div>
              </AnimeradFlik>
            );
          })}
      </div>

      {/* Modal */}
      {visaFörhandsgranskning && (
        <Förhandsgranskning
          lönespec={lönespecar.find((l) => l.id === visaFörhandsgranskning)}
          anställd={anställd}
          företagsprofil={företagsprofil}
          onStäng={() => setVisaFörhandsgranskning(null)}
        />
      )}
    </>
  );
}
