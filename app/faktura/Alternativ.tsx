//#region Huvud
"use client";

import Knapp from "../_components/Knapp";
import ExportPdfButton from "./ExporteraPDFKnapp";

type AlternativProps = {
  onSave: () => void;
  onReload: () => void;
  onPrint: () => void;
  onPreview: () => void;
};
//#endregion

export default function Alternativ({ onSave, onReload, onPrint, onPreview }: AlternativProps) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 p-4">
      {/* Vänster sida: Spara, Exportera, Skriv ut, Börja om */}
      <div className="flex flex-wrap gap-2">
        <Knapp onClick={onSave} text="💾 Spara" />
        <ExportPdfButton />
      </div>

      {/* Höger sida: Förhandsgranska */}
      <div className="flex">
        <Knapp onClick={onPreview} text="🔍 Förhandsgranska" />
      </div>
    </div>
  );
}
