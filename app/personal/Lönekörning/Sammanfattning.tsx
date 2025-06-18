"use client";

interface SammanfattningProps {
  anställda: any[];
}

export default function Sammanfattning({ anställda }: SammanfattningProps) {
  const totalBrutto = anställda.reduce((sum, a) => sum + parseFloat(a.kompensation || 0), 0);
  const totalLönekostnad = totalBrutto * 1.3142; // Approximation med sociala avgifter

  const handleKörLönekörning = () => {
    console.log("Kör lönekörning för alla anställda");
    // Här kan du lägga till logik för att köra lönekörning
  };

  return (
    <div className="space-y-6">
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

      {/* Kör lönekörning knapp */}
      <div className="flex justify-center">
        <button
          onClick={handleKörLönekörning}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          🚀 Kör lönekörning
        </button>
      </div>
    </div>
  );
}
