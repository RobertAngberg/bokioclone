"use client";

import { useState, useEffect, useCallback } from "react";
import { hämtaLönespecifikationer, hämtaUtlägg, hämtaFöretagsprofil } from "../actions";
import AnimeradFlik from "../../_components/AnimeradFlik";
import Lönekomponenter from "./Lönekomponenter";
import Utlägg from "./Utlägg";
import Sammanfattning from "./Sammanfattning";
import Förhandsgranskning from "./Förhandsgranskning";
import Knapp from "../../_components/Knapp";

interface LönespecProps {
  anställd: any;
}

export default function Lönespecar({ anställd }: LönespecProps) {
  const [lönespecar, setLönespecar] = useState<any[]>([]);
  const [utlägg, setUtlägg] = useState<any[]>([]);
  const [företagsprofil, setFöretagsprofil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [visaFörhandsgranskning, setVisaFörhandsgranskning] = useState<string | null>(null);
  const [beräknadeVärden, setBeräknadeVärden] = useState<any>({});

  useEffect(() => {
    const loadData = async () => {
      if (!anställd?.id) return;

      try {
        setLoading(true);
        const [lönespecarData, utläggData] = await Promise.all([
          hämtaLönespecifikationer(anställd.id),
          hämtaUtlägg(anställd.id),
        ]);

        setLönespecar(lönespecarData);
        setUtlägg(utläggData);

        // Hämta företagsprofil separat eftersom den inte behöver userId
        const session = await fetch("/api/session").then((r) => r.json());
        if (session?.user?.id) {
          const företagsprofilData = await hämtaFöretagsprofil(session.user.id);
          setFöretagsprofil(företagsprofilData);
        }
      } catch (error) {
        console.error("Fel vid laddning av data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [anställd?.id]);

  // Handler för att ta emot uppdaterade beräkningar - använd useCallback för att undvika oändlig loop
  const handleBeräkningarUppdaterade = useCallback((lönespecId: string, beräkningar: any) => {
    setBeräknadeVärden((prev: any) => ({
      ...prev,
      [lönespecId]: beräkningar,
    }));
  }, []);

  function getMånadsNamn(månad: number, år: number): string {
    const månader = [
      "Januari",
      "Februari",
      "Mars",
      "April",
      "Maj",
      "Juni",
      "Juli",
      "Augusti",
      "September",
      "Oktober",
      "November",
      "December",
    ];
    return `${månader[månad - 1]} ${år}`;
  }

  function getLönespecStatusBadge(status: string) {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      utkast: {
        label: "Utkast",
        className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      },
      klar: { label: "Klar", className: "bg-green-500/20 text-green-400 border-green-500/30" },
      skickad: { label: "Skickad", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      betald: { label: "Betald", className: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    };

    const statusInfo = statusMap[status] || statusMap.utkast;
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  }

  function getStatusBadge(status: string) {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      väntande: {
        label: "Väntande",
        className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      },
      godkänd: {
        label: "Godkänd",
        className: "bg-green-500/20 text-green-400 border-green-500/30",
      },
      nekad: { label: "Nekad", className: "bg-red-500/20 text-red-400 border-red-500/30" },
      utbetald: { label: "Utbetald", className: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    };

    const statusInfo = statusMap[status] || statusMap.väntande;
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        <span className="ml-3 text-white">Laddar lönespecar...</span>
      </div>
    );
  }

  if (!loading && lönespecar.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        Inga lönespecifikationer hittades för {anställd.förnamn} {anställd.efternamn}.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 max-w-6xl mx-auto">
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

            // Hämta beräknade värden för denna lönespec
            const aktuellBeräkning = beräknadeVärden[lönespec.id];

            // Använd beräknade värden om de finns, annars fallback till originala
            const visaBruttolön = aktuellBeräkning?.bruttolön ?? bruttolön;
            const visaSkatt = aktuellBeräkning?.skatt ?? skatt;
            const visaNettolön = aktuellBeräkning?.nettolön ?? nettolön;
            const visaSocialaAvgifter = aktuellBeräkning?.socialaAvgifter ?? socialaAvgifter;
            const visaLönekostnad = aktuellBeräkning?.lönekostnad ?? bruttolön + socialaAvgifter;

            const lönespecUtlägg = utlägg.filter(
              (u) => u.lönespecifikation_id === lönespec.id || !u.lönespecifikation_id
            );

            return (
              <AnimeradFlik
                key={lönespec.id}
                title={`Lönespec ${månadsNamn}`}
                icon="📅"
                visaSummaDirekt={`Netto: ${visaNettolön.toLocaleString("sv-SE")} kr`}
              >
                <div className="space-y-6">
                  {/* Toppinfo */}
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-bold text-white">
                        Lönespecifikation {månadsNamn}
                      </h2>
                      {getLönespecStatusBadge(lönespec.status || "utkast")}
                    </div>
                    <div className="space-y-1 text-sm text-gray-400">
                      <div>
                        Anställd: {anställd.förnamn} {anställd.efternamn}
                      </div>
                      <div>Jobbtitel: {anställd.jobbtitel}</div>
                      <div>
                        Löneperiod: {lönespec.startdatum || "2025-06-01"} -{" "}
                        {lönespec.slutdatum || "2025-06-30"}
                      </div>
                      <div>Bankkonto: {anställd.bankkonto || "3300-1234567890"}</div>
                      <div>Lönespec ID: #{lönespec.id}</div>
                    </div>
                  </div>

                  <Lönekomponenter
                    grundlön={grundlön}
                    övertid={övertid}
                    lönespec={lönespec}
                    bruttolön={bruttolön}
                    socialaAvgifter={socialaAvgifter}
                    skatt={skatt}
                    onBeräkningarUppdaterade={handleBeräkningarUppdaterade}
                  />

                  <Utlägg lönespecUtlägg={lönespecUtlägg} getStatusBadge={getStatusBadge} />

                  <Sammanfattning
                    utbetalningsDatum={utbetalningsDatum}
                    nettolön={visaNettolön}
                    lönespec={lönespec}
                    anställd={anställd}
                    bruttolön={visaBruttolön}
                    skatt={visaSkatt}
                    socialaAvgifter={visaSocialaAvgifter}
                    lönekostnad={visaLönekostnad}
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
