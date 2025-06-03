import Knapp from "../../_components/Knapp";
import ExporteraPDFKnapp from "./ExporteraPDFKnapp";
import SkickaEpost from "./SkickaEpost"; // Importera komponenten

interface Props {
  onSave: () => void;
  onReload: () => void;
  onPrint: () => void;
  onPreview: () => void;
}

export default function Alternativ({ onSave, onReload, onPreview }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Knapp onClick={onSave} text="💾 Spara faktura" />
        <Knapp onClick={onPreview} text="👁️ Förhandsgranska" />
        <Knapp onClick={onReload} text="🔄 Återställ" />
        <ExporteraPDFKnapp />
      </div>

      <SkickaEpost
        onSuccess={() => console.log("E-post skickad")}
        onError={(err) => console.error("E-postfel:", err)}
      />
    </div>
  );
}
