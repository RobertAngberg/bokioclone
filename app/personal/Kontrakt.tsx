"use client";

export default function Kontrakt() {
  const kontraktData = {
    anställningstyp: "Månadslön",
    från: "2025-06-04",
    till: "2026-03-31",
    lön: "45000/Månad, Förskott",
    arbetsbelastning: "Heltidsanställd",
    arbetsvecka: "40 Timmar",
    skatt: "Tabell 32, kolumn 1",
    jobbtitel: "Utvecklare",
    semesterdagar: "25",
    tjänsteställeAdress: "Kontorsgatan 5",
    tjänsteställeOrt: "Stockholm",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Kontrakt</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Nuvarande kontrakt */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Nuvarande kontrakt</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400">Anställningstyp:</span>
              <div className="text-white">{kontraktData.anställningstyp}</div>
            </div>
            <div>
              <span className="text-gray-400">Kontrakt:</span>
              <div className="text-white">Från: {kontraktData.från}</div>
              <div className="text-white">Till: {kontraktData.till}</div>
            </div>
            <div>
              <span className="text-gray-400">Lön:</span>
              <div className="text-white">{kontraktData.lön}</div>
            </div>
            <div>
              <span className="text-gray-400">Arbetsbelastning:</span>
              <div className="text-white">{kontraktData.arbetsbelastning}</div>
            </div>
            <div>
              <span className="text-gray-400">Arbetsvecka:</span>
              <div className="text-white">{kontraktData.arbetsvecka}</div>
            </div>
            <div>
              <span className="text-gray-400">Skatt:</span>
              <div className="text-white">{kontraktData.skatt}</div>
            </div>
            <div>
              <span className="text-gray-400">Jobbtitel:</span>
              <div className="text-white">{kontraktData.jobbtitel}</div>
            </div>
          </div>
        </div>

        {/* Nytt kontrakt */}
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Nytt kontrakt</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400">Kompensation:</span>
              <div className="text-white">Ingen ändring planerad</div>
            </div>
          </div>
        </div>
      </div>

      {/* Semester & Tjänsteställe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Semester</h3>
          <div>
            <span className="text-gray-400">Semesterdagar per år:</span>
            <div className="text-white">{kontraktData.semesterdagar}</div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Tjänsteställe</h3>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400">Adress:</span>
              <div className="text-white">{kontraktData.tjänsteställeAdress}</div>
            </div>
            <div>
              <span className="text-gray-400">Ort:</span>
              <div className="text-white">{kontraktData.tjänsteställeOrt}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
