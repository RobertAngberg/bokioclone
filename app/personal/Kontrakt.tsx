"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TextFält from "../_components/TextFält";
import Dropdown from "../_components/Dropdown";
import Knapp from "../_components/Knapp";
import { sparaAnställd } from "./actions";

interface KontraktProps {
  anställd?: any;
  onRedigera?: () => void;
}

// Definiera typen för editData
interface EditData {
  anställningstyp: string;
  startdatum: Date;
  förnyaKontrakt: Date;
  kompensation: string;
  ersättningPer: string;
  arbetsbelastning: string;
  arbetsveckaTimmar: string;
  deltidProcent: string;
  skattetabell: string;
  skattekolumn: string;
  växaStöd: boolean;
  tjänsteställeAdress: string;
  tjänsteställeOrt: string;
}

export default function Kontrakt({ anställd, onRedigera }: KontraktProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EditData>({
    anställningstyp: "",
    startdatum: new Date(),
    förnyaKontrakt: new Date(),
    kompensation: "",
    ersättningPer: "",
    arbetsbelastning: "",
    arbetsveckaTimmar: "",
    deltidProcent: "",
    skattetabell: "",
    skattekolumn: "",
    växaStöd: false,
    tjänsteställeAdress: "",
    tjänsteställeOrt: "",
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<EditData>({
    anställningstyp: "",
    startdatum: new Date(),
    förnyaKontrakt: new Date(),
    kompensation: "",
    ersättningPer: "",
    arbetsbelastning: "",
    arbetsveckaTimmar: "",
    deltidProcent: "",
    skattetabell: "",
    skattekolumn: "",
    växaStöd: false,
    tjänsteställeAdress: "",
    tjänsteställeOrt: "",
  });

  // Initialize data when anställd changes
  useEffect(() => {
    if (anställd && !isEditing) {
      const data: EditData = {
        anställningstyp: anställd.anställningstyp || "",
        startdatum: anställd.startdatum ? new Date(anställd.startdatum) : new Date(),
        förnyaKontrakt: anställd.förnya_kontrakt ? new Date(anställd.förnya_kontrakt) : new Date(),
        kompensation: anställd.kompensation?.toString() || "",
        ersättningPer: anställd.ersättning_per || "",
        arbetsbelastning: anställd.arbetsbelastning || "",
        arbetsveckaTimmar: anställd.arbetsvecka_timmar?.toString() || "",
        deltidProcent: anställd.deltid_procent?.toString() || "",
        skattetabell: anställd.skattetabell?.toString() || "",
        skattekolumn: anställd.skattekolumn?.toString() || "",
        växaStöd: anställd.växa_stöd || false,
        tjänsteställeAdress: anställd.tjänsteställe_adress || "",
        tjänsteställeOrt: anställd.tjänsteställe_ort || "",
      };
      setEditData(data);
      setOriginalData(data);
      setHasChanges(false);
    }
  }, [anställd, isEditing]);

  // Generic change handler with proper typing
  const handleChange = (name: keyof EditData, value: any) => {
    const newData = { ...editData, [name]: value };
    setEditData(newData);
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(originalData));
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      const result = await sparaAnställd(
        {
          ...anställd,
          anställningstyp: editData.anställningstyp,
          startdatum: editData.startdatum.toISOString().split("T")[0],
          förnyaKontrakt: editData.förnyaKontrakt.toISOString().split("T")[0],
          kompensation: editData.kompensation,
          ersättningPer: editData.ersättningPer,
          arbetsbelastning: editData.arbetsbelastning,
          arbetsvecka: editData.arbetsveckaTimmar,
          deltidProcent: editData.deltidProcent,
          skattetabell: editData.skattetabell,
          skattekolumn: editData.skattekolumn,
          växaStöd: editData.växaStöd,
          tjänsteställeAdress: editData.tjänsteställeAdress,
          tjänsteställeOrt: editData.tjänsteställeOrt,
        },
        anställd.id
      );

      if (result.success) {
        alert("Kontraktsinformation uppdaterad!");
        setIsEditing(false);
        setHasChanges(false);
        setOriginalData(editData);
        // Update the anställd object locally
        Object.assign(anställd, {
          anställningstyp: editData.anställningstyp,
          startdatum: editData.startdatum.toISOString().split("T")[0],
          förnya_kontrakt: editData.förnyaKontrakt.toISOString().split("T")[0],
          kompensation: parseFloat(editData.kompensation) || 0,
          ersättning_per: editData.ersättningPer,
          arbetsbelastning: editData.arbetsbelastning,
          arbetsvecka_timmar: parseFloat(editData.arbetsveckaTimmar) || 0,
          deltid_procent: parseFloat(editData.deltidProcent) || 0,
          skattetabell: parseFloat(editData.skattetabell) || 0,
          skattekolumn: parseFloat(editData.skattekolumn) || 0,
          växa_stöd: editData.växaStöd,
          tjänsteställe_adress: editData.tjänsteställeAdress,
          tjänsteställe_ort: editData.tjänsteställeOrt,
        });
      } else {
        alert("Fel: " + result.error);
      }
    } catch (error) {
      alert("Ett fel uppstod vid sparande");
    }
  };

  const handleCancel = () => {
    setEditData(originalData);
    setIsEditing(false);
    setHasChanges(false);
  };

  // Dropdown options
  const dropdownOptions = {
    anställningstyp: [
      { value: "", label: "Välj anställningstyp" },
      { value: "Tillsvidare", label: "Tillsvidare" },
      { value: "Visstid", label: "Visstid" },
      { value: "Provanställning", label: "Provanställning" },
      { value: "Säsongsanställning", label: "Säsongsanställning" },
      { value: "Månadslön", label: "Månadslön" },
    ],
    ersättningPer: [
      { value: "", label: "Välj period" },
      { value: "Månad", label: "Månad" },
      { value: "Timme", label: "Timme" },
      { value: "Dag", label: "Dag" },
      { value: "Vecka", label: "Vecka" },
      { value: "År", label: "År" },
    ],
    skattetabell: [
      { value: "", label: "Välj skattetabell" },
      ...Array.from({ length: 14 }, (_, i) => ({
        value: (29 + i).toString(),
        label: `Tabell ${29 + i}`,
      })),
    ],
    skattekolumn: [
      { value: "", label: "Välj skattekolumn" },
      ...Array.from({ length: 6 }, (_, i) => ({
        value: (1 + i).toString(),
        label: `Kolumn ${1 + i}`,
      })),
    ],
  };

  if (!anställd) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl text-white font-semibold">Kontrakt</h3>
        <p className="text-gray-400">Välj en anställd för att visa kontrakt.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white mb-6">
          Kontrakt för {anställd.förnamn} {anställd.efternamn}
        </h2>
        <div className="flex gap-2">
          {!isEditing ? (
            <Knapp text="Redigera" onClick={() => setIsEditing(true)} />
          ) : (
            <>
              <div className={!hasChanges ? "opacity-50 cursor-not-allowed" : ""}>
                <Knapp text="Spara" onClick={hasChanges ? handleSave : undefined} />
              </div>
              <Knapp text="Avbryt" onClick={handleCancel} />
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-8">
          {/* Kontraktsinformation */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Kontraktsinformation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Anställningstyp */}
              <Dropdown
                label="Anställningstyp"
                value={editData.anställningstyp || ""}
                onChange={(value) => handleChange("anställningstyp", value)}
                options={dropdownOptions.anställningstyp}
              />

              {/* Ersättning per */}
              <Dropdown
                label="Ersättning per"
                value={editData.ersättningPer || ""}
                onChange={(value) => handleChange("ersättningPer", value)}
                options={dropdownOptions.ersättningPer}
              />

              {/* Arbetsbelastning */}
              <Dropdown
                label="Arbetsbelastning"
                value={editData.arbetsbelastning || ""}
                onChange={(value) => handleChange("arbetsbelastning", value)}
                options={[
                  { value: "", label: "Välj arbetsbelastning" },
                  { value: "Heltid", label: "Heltid" },
                  { value: "Deltid", label: "Deltid" },
                ]}
              />

              {/* Deltid (%) - visas bredvid Arbetsbelastning om Deltid är valt */}
              {editData.arbetsbelastning === "Deltid" && (
                <TextFält
                  label="Deltid (%)"
                  name="deltidProcent"
                  type="number"
                  value={editData.deltidProcent || ""}
                  onChange={(e) => handleChange("deltidProcent", e.target.value)}
                />
              )}

              {/* Skattetabell */}
              <Dropdown
                label="Skattetabell"
                value={editData.skattetabell || ""}
                onChange={(value) => handleChange("skattetabell", value)}
                options={dropdownOptions.skattetabell}
              />

              {/* Skattekolumn */}
              <Dropdown
                label="Skattekolumn"
                value={editData.skattekolumn || ""}
                onChange={(value) => handleChange("skattekolumn", value)}
                options={dropdownOptions.skattekolumn}
              />

              {/* Date pickers */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Startdatum</label>
                <DatePicker
                  selected={editData.startdatum}
                  onChange={(date) => date && handleChange("startdatum", date)}
                  dateFormat="yyyy-MM-dd"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Förnya kontrakt</label>
                <DatePicker
                  selected={editData.förnyaKontrakt}
                  onChange={(date) => date && handleChange("förnyaKontrakt", date)}
                  dateFormat="yyyy-MM-dd"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Text fields */}
              <TextFält
                label="Kompensation (kr)"
                name="kompensation"
                type="number"
                value={editData.kompensation || ""}
                onChange={(e) => handleChange("kompensation", e.target.value)}
              />

              <TextFält
                label="Arbetsvecka (timmar)"
                name="arbetsveckaTimmar"
                type="number"
                value={editData.arbetsveckaTimmar || ""}
                onChange={(e) => handleChange("arbetsveckaTimmar", e.target.value)}
              />

              {/* Checkbox - centrerad vertikalt */}
              <div className="flex items-center">
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={editData.växaStöd || false}
                    onChange={(e) => handleChange("växaStöd", e.target.checked)}
                    className="mr-2 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  VÄXA-stöd
                </label>
              </div>
            </div>
          </div>

          {/* Tjänsteställe */}
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Tjänsteställe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(["tjänsteställeAdress", "tjänsteställeOrt"] as const).map((field) => (
                <TextFält
                  key={field}
                  label={field === "tjänsteställeAdress" ? "Adress" : "Ort"}
                  name={field}
                  value={editData[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // VIEW MODE - Kompakt visning
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Nuvarande kontrakt</h3>
            <div className="space-y-3">
              {[
                ["Anställningstyp", anställd.anställningstyp],
                [
                  "Startdatum",
                  anställd.startdatum ? new Date(anställd.startdatum).toLocaleDateString() : null,
                ],
                [
                  "Slutdatum",
                  anställd.förnya_kontrakt
                    ? new Date(anställd.förnya_kontrakt).toLocaleDateString()
                    : null,
                ],
                [
                  "Lön",
                  `${anställd.kompensation || "Ej angiven"} kr/${anställd.ersättning_per || "månad"}`,
                ],
                [
                  "Arbetsbelastning",
                  anställd.arbetsbelastning === "Deltid" && anställd.deltid_procent
                    ? `${anställd.arbetsbelastning} (${anställd.deltid_procent}%)`
                    : anställd.arbetsbelastning,
                ],
                ["Arbetsvecka", `${anställd.arbetsvecka_timmar || "Ej angiven"} timmar`],
                [
                  "Skatt",
                  `Tabell ${anställd.skattetabell || "Ej angiven"}, kolumn ${anställd.skattekolumn || "Ej angiven"}`,
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <span className="text-gray-400">{label}:</span>
                  <div className="text-white">{value || "Ej angiven"}</div>
                </div>
              ))}
              {anställd.växa_stöd && (
                <div>
                  <span className="text-gray-400">VÄXA-stöd:</span>
                  <div className="text-green-400">Ja</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Tjänsteställe</h3>
            <div className="space-y-3">
              {[
                ["Adress", anställd.tjänsteställe_adress],
                ["Ort", anställd.tjänsteställe_ort],
              ].map(([label, value]) => (
                <div key={label}>
                  <span className="text-gray-400">{label}:</span>
                  <div className="text-white">{value || "Ej angiven"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
