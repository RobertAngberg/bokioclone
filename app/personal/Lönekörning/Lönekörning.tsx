//#region Huvud
"use client";

import { useState, useEffect } from "react";
import { hämtaAllaAnställda } from "../actions";
import AnimeradFlik from "../../_components/AnimeradFlik";
import Lönespecar from "../Lönespecar/Lönespecar";

export default function Lönekörning() {
  //#endregion

  //#region State
  const [anställda, setAnställda] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [valtMånadIndex, setValtMånadIndex] = useState(0); // Första = senaste månaden
  const [valdAnställd, setValdAnställd] = useState<any>(null);
  //#endregion

  //#region Ladda anställda
  useEffect(() => {
    const laddaAnställda = async () => {
      try {
        setLoading(true);
        const data = await hämtaAllaAnställda();
        setAnställda(data);
      } catch (error) {
        console.error("❌ Fel vid laddning av anställda:", error);
      } finally {
        setLoading(false);
      }
    };

    laddaAnställda();
  }, []);
  //#endregion

  //#region Get senaste 6 månader
  const getSenaste6Månader = () => {
    const månader = [];
    for (let i = 0; i < 6; i++) {
      const datum = new Date();
      datum.setMonth(datum.getMonth() - i);
      månader.push({
        label: datum.toLocaleDateString("sv-SE", { month: "long", year: "numeric" }),
      });
    }
    return månader;
  };
  //#endregion

  //#region Formler
  const totalBrutto = anställda.reduce((sum, a) => sum + parseFloat(a.kompensation || 0), 0);
  const totalLönekostnad = totalBrutto * 1.3142; // Approximation med sociala avgifter
  //#endregion

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white text-center">Kör löner för alla anställda</h2>

      {/* Senaste 6 månaderna */}
      <div className="bg-slate-700 p-4 rounded-lg">
        <h5 className="text-white font-semibold mb-3">Välj löneperiod</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {getSenaste6Månader().map((månad, index) => (
            <button
              key={index}
              onClick={() => setValtMånadIndex(index)}
              className={`p-3 rounded-lg text-sm transition-colors ${
                index === valtMånadIndex
                  ? "bg-blue-600 text-white border-2 border-blue-400"
                  : "bg-slate-800 hover:bg-slate-600 text-white"
              }`}
            >
              {månad.label.charAt(0).toUpperCase() + månad.label.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Anställda som AnimeradFlik */}
      <div className="bg-slate-700 p-4 rounded-lg">
        <h5 className="text-white font-semibold mb-3">
          Anställda som kommer få lönespec ({anställda.length})
        </h5>

        {loading ? (
          <div className="text-gray-300 text-center py-4">Laddar anställda...</div>
        ) : anställda.length === 0 ? (
          <div className="text-gray-300 text-center py-4">Inga anställda hittades</div>
        ) : (
          <div className="space-y-2">
            {anställda.map((anställd) => (
              <AnimeradFlik
                key={anställd.id}
                title={`${anställd.förnamn} ${anställd.efternamn}`}
                icon="👤"
                visaSummaDirekt={`${parseFloat(anställd.kompensation || 0).toLocaleString("sv-SE")} kr`}
              >
                <Lönespecar anställd={anställd} />
              </AnimeradFlik>
            ))}
          </div>
        )}
      </div>

      {/* Sammanfattning */}
      <div className="bg-slate-700 p-4 rounded-lg">
        <h5 className="text-white font-semibold mb-3">Sammanfattning</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 p-3 rounded text-center">
            <div className="text-2xl font-bold text-blue-400">{anställda.length}</div>
            <div className="text-gray-300 text-sm">Anställda</div>
          </div>
          <div className="bg-slate-800 p-3 rounded text-center">
            <div className="text-2xl font-bold text-green-400">
              {totalBrutto.toLocaleString("sv-SE")}
            </div>
            <div className="text-gray-300 text-sm">Total bruttolön (kr)</div>
          </div>
          <div className="bg-slate-800 p-3 rounded text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {Math.round(totalLönekostnad).toLocaleString("sv-SE")}
            </div>
            <div className="text-gray-300 text-sm">Total lönekostnad (kr)</div>
          </div>
        </div>
      </div>

      {/* Knappar */}
      <div className="flex gap-3 justify-center">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
          📋 Förhandsgranska alla
        </button>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
          🚀 Kör lönekörning
        </button>
      </div>
    </div>
  );
}
