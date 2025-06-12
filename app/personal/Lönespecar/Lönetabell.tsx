interface LönetabellProps {
  bruttolön: number;
}

export default function Lönetabell({ bruttolön }: LönetabellProps) {
  return (
    <div className="bg-slate-700 rounded-lg overflow-hidden mb-6">
      <table className="w-full">
        <thead className="bg-slate-600">
          <tr>
            <th className="px-4 py-2 text-left text-white">Benämning</th>
            <th className="px-4 py-2 text-left text-white">Antal</th>
            <th className="px-4 py-2 text-left text-white">Kostnad</th>
            <th className="px-4 py-2 text-left text-white">Summa</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-600">
            <td className="px-4 py-2 text-white">Lön</td>
            <td className="px-4 py-2 text-gray-300">1 Månad</td>
            <td className="px-4 py-2 text-gray-300">
              {bruttolön.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
            </td>
            <td className="px-4 py-2 text-white">
              {bruttolön.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
