interface LönekomponenterProps {
  grundlön: number;
  övertid: number;
  lönespec: any;
  bruttolön: number;
  socialaAvgifter: number;
  skatt: number;
}

export default function Lönekomponenter({
  grundlön,
  övertid,
  lönespec,
  bruttolön,
  socialaAvgifter,
  skatt,
}: LönekomponenterProps) {
  return (
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
          <span className="text-white font-bold">{bruttolön.toLocaleString("sv-SE")} kr</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">varav sociala avgifter</span>
          <span className="text-gray-300">{socialaAvgifter.toLocaleString("sv-SE")} kr</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">varav Skatt</span>
          <span className="text-gray-300">{skatt.toLocaleString("sv-SE")} kr</span>
        </div>
      </div>
    </div>
  );
}
