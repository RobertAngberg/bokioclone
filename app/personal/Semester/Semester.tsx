// #region Huvud
"use client";

import { useState, useEffect } from "react";
import Knapp from "../../_components/Knapp";
import Semesterdata from "./Semesterdata";
import Transaktioner from "./Transaktioner";

interface SemesterProps {
  anställd?: any;
}

interface SemesterData {
  semesterdagarPerÅr: string;
  kvarandeDagar: string;
  sparadeDagar: string;
  användaFörskott: string;
  kvarandeFörskott: string;
  innestående: string;
}
// #endregion

export default function Semester({ anställd }: SemesterProps) {
  // #region State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<SemesterData>({
    semesterdagarPerÅr: "",
    kvarandeDagar: "",
    sparadeDagar: "",
    användaFörskott: "",
    kvarandeFörskott: "",
    innestående: "",
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<SemesterData>({
    semesterdagarPerÅr: "",
    kvarandeDagar: "",
    sparadeDagar: "",
    användaFörskott: "",
    kvarandeFörskott: "",
    innestående: "",
  });
  // #endregion

  // #region Initialize Form Data
  useEffect(() => {
    if (anställd && !isEditing) {
      const data: SemesterData = {
        semesterdagarPerÅr: anställd.semesterdagar_per_år?.toString() || "0",
        kvarandeDagar: anställd.kvarvarande_dagar?.toString() || "0",
        sparadeDagar: anställd.sparade_dagar?.toString() || "0",
        användaFörskott: anställd.använda_förskott?.toString() || "0",
        kvarandeFörskott: anställd.kvarvarande_förskott?.toString() || "0",
        innestående: anställd.innestående_ersättning?.toString() || "0",
      };
      setEditData(data);
      setOriginalData(data);
      setHasChanges(false);
    }
  }, [anställd, isEditing]);
  // #endregion

  // #region Handlers
  const handleChange = (name: string, value: any) => {
    const newData = { ...editData, [name]: value };
    setEditData(newData);
    setHasChanges(JSON.stringify(newData) !== JSON.stringify(originalData));
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      // Här skulle du anropa en action för att spara semesterdata
      console.log("Sparar semesterdata:", editData);
      alert("Semesterinformation uppdaterad!");
      setIsEditing(false);
      setHasChanges(false);
      setOriginalData(editData);

      // Uppdatera anställd objekt lokalt
      Object.assign(anställd, {
        semesterdagar_per_år: parseFloat(editData.semesterdagarPerÅr) || 0,
        kvarvarande_dagar: parseFloat(editData.kvarandeDagar) || 0,
        sparade_dagar: parseFloat(editData.sparadeDagar) || 0,
        använda_förskott: parseFloat(editData.användaFörskott) || 0,
        kvarvarande_förskott: parseFloat(editData.kvarandeFörskott) || 0,
        innestående_ersättning: parseFloat(editData.innestående) || 0,
      });
    } catch (error) {
      alert("Ett fel uppstod vid sparande");
    }
  };

  const handleCancel = () => {
    setEditData(originalData);
    setIsEditing(false);
    setHasChanges(false);
  };
  // #endregion

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Semester</h2>
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

      <Semesterdata editData={editData} handleChange={handleChange} isEditing={isEditing} />

      <Transaktioner anställd={anställd} />
    </div>
  );
}
