//#region Huvud
"use client";

import { useState, useEffect, useCallback } from "react";
import AnimeradFlik from "../../_components/AnimeradFlik";
import Förhandsgranskning from "./Förhandsgranskning";
import ExporteraPDFKnapp from "./ExporteraPDFKnapp";
import Knapp from "../../_components/Knapp";
import {
  hämtaLönespecifikationer,
  genereraLönespecifikation,
  hämtaFöretagsprofil,
} from "../actions";

interface LönespecProps {
  anställd?: any;
}
//#endregion

export default function Lönespecar({ anställd }: LönespecProps) {
  //#region State
  const [lönespecar, setLönespecar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genererar, setGenererar] = useState(false);
  const [företagsprofil, setFöretagsprofil] = useState<any>(null);
  const [visaFörhandsgranskning, setVisaFörhandsgranskning] = useState<string | null>(null);
  //#endregion

  //#region Handlers
  const laddaLönespecifikationer = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Laddar lönespecifikationer för anställd ID:", anställd.id);
      const [lönespecData, företagsData] = await Promise.all([
        hämtaLönespecifikationer(anställd.id),
        hämtaFöretagsprofil(anställd.user_id?.toString() || ""),
      ]);

      setLönespecar(lönespecData);
      setFöretagsprofil(företagsData);
      console.log("✅ Laddade", lönespecData.length, "lönespecifikationer");
    } catch (err) {
      console.error("❌ Fel vid laddning av lönespecifikationer:", err);
      setError("Kunde inte ladda lönespecifikationer");
    } finally {
      setLoading(false);
    }
  }, [anställd?.id, anställd?.user_id]);

  const handleGenereraLönespec = async () => {
    setGenererar(true);

    try {
      const result = await genereraLönespecifikation(anställd.id);

      if (result.success) {
        alert(`✅ ${result.message}`);
        await laddaLönespecifikationer();
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (error) {
      console.error("Fel vid generering:", error);
      alert("Ett fel uppstod vid generering av lönespecifikation");
    } finally {
      setGenererar(false);
    }
  };

  const getNuvarandeMånad = (): string => {
    const now = new Date();
    return now.toLocaleDateString("sv-SE", { month: "long", year: "numeric" });
  };
  //#endregion

  //#region Effects
  useEffect(() => {
    if (anställd?.id) {
      laddaLönespecifikationer();
    }
  }, [anställd?.id, laddaLönespecifikationer]);
  //#endregion

  //#region Helper Functions
  const getMånadsNamn = (månad: number, år: number): string => {
    const datum = new Date(år, månad - 1, 1);
    const månadsnamn = datum.toLocaleDateString("sv-SE", { month: "long", year: "numeric" });
    return månadsnamn.charAt(0).toUpperCase() + månadsnamn.slice(1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Utkast: { color: "bg-yellow-600", text: "📝 Utkast" },
      Godkänd: { color: "bg-blue-600", text: "✅ Godkänd" },
      Utbetald: { color: "bg-green-600", text: "💰 Utbetald" },
      Arkiverad: { color: "bg-gray-600", text: "📁 Arkiverad" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["Utkast"];

    return (
      <span className={`${config.color} text-white px-2 py-1 rounded-md text-sm font-medium`}>
        {config.text}
      </span>
    );
  };
  //#endregion

  return (
    <>
      <div className="space-y-4 max-w-6xl mx-auto">
        {
          //#region Anställd Header
        }
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">
              {anställd.förnamn} {anställd.efternamn}
            </h3>

            <button
              onClick={handleGenereraLönespec}
              disabled={genererar || loading}
              className={`${
                genererar || loading
                  ? "bg-gray-600 cursor-not-allowed opacity-50"
                  : "bg-green-600 hover:bg-green-700"
              } text-white px-6 py-2 rounded-lg font-semibold transition-colors text-base flex items-center gap-2`}
            >
              {genererar ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Genererar...
                </>
              ) : (
                <>⚡ Generera lönespec för {getNuvarandeMånad()}</>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-base text-gray-300">
            <div>
              <span className="font-semibold text-white">Adress:</span>
              <br />
              <span className="text-base">
                {anställd.adress} {anställd.postnummer} {anställd.ort}
              </span>
            </div>
            <div>
              <span className="font-semibold text-white">Mail:</span>
              <br />
              <span className="text-base">{anställd.mail}</span>
            </div>
            <div>
              <span className="font-semibold text-white">Personnummer:</span>
              <br />
              <span className="text-base">{anställd.personnummer}</span>
            </div>
            <div>
              <span className="font-semibold text-white">Bankkonto:</span>
              <br />
              <span className="text-base">
                {anställd.clearingnummer}-{anställd.bankkonto}
              </span>
            </div>
            <div>
              <span className="font-semibold text-white">Skattetabell:</span>
              <br />
              <span className="text-base">{anställd.skattetabell}</span>
            </div>
            <div>
              <span className="font-semibold text-white">Skattekolumn:</span>
              <br />
              <span className="text-base">{anställd.skattekolumn}</span>
            </div>
          </div>
        </div>
        {
          //#endregion
        }

        {
          //#region Empty State
        }
        {!loading && !error && lönespecar.length === 0 && (
          <div className="bg-slate-800 p-8 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-white mb-3">
              📋 Inga lönespecifikationer skapade än
            </h3>
            <p className="text-gray-400 text-base mb-4">
              Klicka på &quot;Generera lönespec&quot; ovan för att skapa den första
              lönespecifikationen.
            </p>
          </div>
        )}
        {
          //#endregion
        }

        {
          //#region Lönespecifikationer Lista
        }
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

            return (
              <AnimeradFlik
                key={lönespec.id}
                title={`Lönespec ${månadsNamn}`}
                icon="💰"
                visaSummaDirekt={`Netto: ${nettolön.toLocaleString("sv-SE")} kr`}
              >
                <div className="space-y-6">
                  {
                    //#region Header
                  }
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-bold text-white">
                        Lönespecifikation {månadsNamn}
                      </h4>
                      <div className="flex gap-2 items-center">
                        {getStatusBadge(lönespec.status)}
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
                  {
                    //#endregion
                  }

                  {
                    //#region Lönetabell
                  }
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
                  {
                    //#endregion
                  }

                  {
                    //#region Sammanfattning
                  }
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
                  {
                    //#endregion
                  }

                  {
                    //#region Knappar
                  }
                  <div className="flex gap-2 mt-4">
                    <Knapp
                      text="👁️ Förhandsgranska & Exportera PDF"
                      onClick={() => setVisaFörhandsgranskning(lönespec.id)}
                    />
                  </div>
                  {
                    //#endregion
                  }
                </div>
              </AnimeradFlik>
            );
          })}
        {
          //#endregion
        }
      </div>

      {
        //#region Modal
      }
      {visaFörhandsgranskning && (
        <Förhandsgranskning
          lönespec={lönespecar.find((l) => l.id === visaFörhandsgranskning)}
          anställd={anställd}
          företagsprofil={företagsprofil}
          onStäng={() => setVisaFörhandsgranskning(null)}
        />
      )}
      {
        //#endregion
      }
    </>
  );
}
