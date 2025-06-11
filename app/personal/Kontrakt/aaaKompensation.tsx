// #region Huvud
"use client";

import TextFält from "../../_components/TextFält";
import Dropdown from "../../_components/Dropdown";

interface KompensationProps {
  editData?: any;
  handleChange?: (name: string, value: any) => void;
  anställd?: any;
  viewMode?: boolean;
}
// #endregion

export default function Kompensation({
  editData,
  handleChange,
  anställd,
  viewMode,
}: KompensationProps) {
  // #region Dropdown Options
  const dropdownOptions = {
    betalningssätt: [
      { value: "", label: "Välj betalningssätt" },
      { value: "Efterskott", label: "Efterskott" },
      { value: "Förskott", label: "Förskott" },
    ],
  };
  // #endregion

  if (viewMode) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Kompensation</h3>
        <div className="space-y-3">
          {[
            ["Månadslön", anställd.månadslön ? `${anställd.månadslön} kr` : null],
            ["Betalningssätt", anställd.betalningssätt],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-gray-400">{label}:</span>
              <div className="text-white">{value || "Ej angiven"}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Kompensation</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextFält
          label="Månadslön (kr)"
          name="månadslön"
          type="number"
          value={editData.månadslön || ""}
          onChange={(e) => handleChange?.("månadslön", e.target.value)}
        />
        <Dropdown
          label="Betalningssätt"
          value={editData.betalningssätt || ""}
          onChange={(value) => handleChange?.("betalningssätt", value)}
          options={dropdownOptions.betalningssätt}
        />
      </div>
    </div>
  );
}
