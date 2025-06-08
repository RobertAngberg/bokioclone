"use client";

export default function Lönespecar() {
  const löneData = [
    { månad: "Juni 2025", brutto: "45000", skatt: "12150", netto: "32850", socialSkatt: "14175" },
    { månad: "Maj 2025", brutto: "45000", skatt: "12150", netto: "32850", socialSkatt: "14175" },
    { månad: "April 2025", brutto: "45000", skatt: "12150", netto: "32850", socialSkatt: "14175" },
    { månad: "Mars 2025", brutto: "45000", skatt: "12150", netto: "32850", socialSkatt: "14175" },
    {
      månad: "Februari 2025",
      brutto: "45000",
      skatt: "12150",
      netto: "32850",
      socialSkatt: "14175",
    },
    {
      månad: "Januari 2025",
      brutto: "45000",
      skatt: "12150",
      netto: "32850",
      socialSkatt: "14175",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Lönespecar</h2>

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                Månad
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                Brutto
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                Skatt
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                Netto
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white uppercase tracking-wider">
                Total social skatt
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600">
            {löneData.map((rad, index) => (
              <tr key={index} className="hover:bg-slate-700">
                <td className="px-6 py-4 whitespace-nowrap text-white">{rad.månad}</td>
                <td className="px-6 py-4 whitespace-nowrap text-white">{rad.brutto} kr</td>
                <td className="px-6 py-4 whitespace-nowrap text-white">{rad.skatt} kr</td>
                <td className="px-6 py-4 whitespace-nowrap text-white">{rad.netto} kr</td>
                <td className="px-6 py-4 whitespace-nowrap text-white">{rad.socialSkatt} kr</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
