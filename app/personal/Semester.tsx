"use client";

export default function Semester() {
  const semesterData = {
    användaDagar: "5",
    kvarandeDagar: "20",
    sparadeDagar: "3",
    användaFörskott: "0",
    kvarandeFörskott: "5",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Semester</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Använda dagar</label>
          <div className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white">
            {semesterData.användaDagar}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Kvarvarande dagar</label>
          <div className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white">
            {semesterData.kvarandeDagar}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Sparade dagar</label>
          <div className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white">
            {semesterData.sparadeDagar}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Använda förskottssemesterdagar
          </label>
          <div className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white">
            {semesterData.användaFörskott}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Kvarvarande förskottssemesterdagar
          </label>
          <div className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white">
            {semesterData.kvarandeFörskott}
          </div>
        </div>
      </div>
    </div>
  );
}
