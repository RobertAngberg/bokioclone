//#region Huvud
"use client";

import { useState, useEffect, useCallback } from "react";
import AnimeradFlik from "../../_components/AnimeradFlik";
import Förhandsgranskning from "./Förhandsgranskning";
import Knapp from "../../_components/Knapp";
import ToppInfo from "./ToppInfo";
import Lönekomponenter from "./Lönekomponenter";
import Utlägg from "./Utlägg";
import Sammanfattning from "./Sammanfattning";
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
              📋 Inga lönespecifikationer eller utlägg skapade än.
            </h3>
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
                  <ToppInfo
                    månadsNamn={månadsNamn}
                    lönespec={lönespec}
                    anställd={anställd}
                    getLönespecStatusBadge={getLönespecStatusBadge}
                  />

                  <Lönekomponenter
                    grundlön={grundlön}
                    övertid={övertid}
                    lönespec={lönespec}
                    bruttolön={bruttolön}
                    socialaAvgifter={socialaAvgifter}
                    skatt={skatt}
                  />

                  <Utlägg lönespecUtlägg={lönespecUtlägg} getStatusBadge={getStatusBadge} />

                  <Sammanfattning
                    utbetalningsDatum={utbetalningsDatum}
                    nettolön={nettolön}
                    lönespec={lönespec}
                    anställd={anställd}
                    bruttolön={bruttolön}
                    skatt={skatt}
                  />

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
