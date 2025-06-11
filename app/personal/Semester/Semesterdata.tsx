// #region Huvud
"use client";

import TextFält from "../../_components/TextFält";

interface SemesterdataProps {
  editData?: any;
  handleChange?: (name: string, value: any) => void;
  isEditing?: boolean;
}
// #endregion

export default function Semesterdata({ editData, handleChange, isEditing }: SemesterdataProps) {
  if (isEditing) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Semesterdata</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TextFält
            label="Semesterdagar per år"
            name="semesterdagarPerÅr"
            type="number"
            value={editData.semesterdagarPerÅr}
            onChange={(e) => handleChange?.("semesterdagarPerÅr", e.target.value)}
          />
          <TextFält
            label="Kvarvarande dagar"
            name="kvarandeDagar"
            type="number"
            value={editData.kvarandeDagar}
            onChange={(e) => handleChange?.("kvarandeDagar", e.target.value)}
          />
          <TextFält
            label="Sparade dagar"
            name="sparadeDagar"
            type="number"
            value={editData.sparadeDagar}
            onChange={(e) => handleChange?.("sparadeDagar", e.target.value)}
          />
          <TextFält
            label="Använda förskottssemesterdagar"
            name="användaFörskott"
            type="number"
            value={editData.användaFörskott}
            onChange={(e) => handleChange?.("användaFörskott", e.target.value)}
          />
          <TextFält
            label="Kvarvarande förskottssemesterdagar"
            name="kvarandeFörskott"
            type="number"
            value={editData.kvarandeFörskott}
            onChange={(e) => handleChange?.("kvarandeFörskott", e.target.value)}
          />
          <TextFält
            label="Innestående semesterersättning (kr)"
            name="innestående"
            type="number"
            value={editData.innestående}
            onChange={(e) => handleChange?.("innestående", e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Semesterdata</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          ["Semesterdagar per år", editData.semesterdagarPerÅr],
          ["Kvarvarande dagar", editData.kvarandeDagar],
          ["Sparade dagar", editData.sparadeDagar],
          ["Använda förskottssemesterdagar", editData.användaFörskott],
          ["Kvarvarande förskottssemesterdagar", editData.kvarandeFörskott],
          ["Innestående semesterersättning", `${editData.innestående} kr`],
        ].map(([label, value]) => (
          <div key={label}>
            <label className="block text-sm font-medium text-white mb-2">{label}</label>
            <div className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white">
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
