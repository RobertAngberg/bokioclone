// #region Huvud
"use client";

import { useState } from "react";
import TextFält from "../../_components/TextFält";
import InfoTooltip from "../../_components/InfoTooltip";
import Knapp from "../../_components/Knapp";

interface SemesterdataProps {
  anställd: any;
}
// #endregion

export default function Semesterdata({ anställd }: SemesterdataProps) {
  // #region State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    semesterdagarPerÅr: anställd?.semesterdata?.semesterdagarPerÅr || "25",
    kvarandeDagar: anställd?.semesterdata?.kvarandeDagar || "0",
    sparadeDagar: anställd?.semesterdata?.sparadeDagar || "0",
    användaFörskott: anställd?.semesterdata?.användaFörskott || "0",
    kvarandeFörskott: anställd?.semesterdata?.kvarandeFörskott || "0",
    innestående: anställd?.semesterdata?.innestående || "0",
  });
  // #endregion

  // #region Info texts
  const infoTexts = {
    semesterdagarPerÅr:
      "Laglig minimum är 25 dagar per år för heltidsanställda. Kan vara högre enligt kollektivavtal eller företagspolicy.",
    kvarandeDagar:
      "Antal semesterdagar som anställd kan ta ut nu. Baserat på intjänade dagar minus redan tagna dagar.",
    sparadeDagar:
      "Semesterdagar som sparats från tidigare år. Max 5 dagar får normalt sparas enligt lag.",
    användaFörskott:
      "Antal semesterdagar som tagits i förskott (innan de intjänats). Ska återbetalas eller dras från framtida intjäning.",
    kvarandeFörskott:
      "Maximalt antal förskottsdagar som kan tas. Oftast begränsat till kommande års intjäning.",
    innestående:
      "Pengar som ska betalas ut för ej uttagen semester vid uppsägning. Beräknas som 12% av bruttolön × sparade dagar.",
  };
  // #endregion

  // #region Handlers
  const handleChange = (name: string, value: any) => {
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // TODO: Spara till databas
    console.log("Sparar semesterdata:", editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Återställ till original data
    setEditData({
      semesterdagarPerÅr: anställd?.semesterdata?.semesterdagarPerÅr || "25",
      kvarandeDagar: anställd?.semesterdata?.kvarandeDagar || "0",
      sparadeDagar: anställd?.semesterdata?.sparadeDagar || "0",
      användaFörskott: anställd?.semesterdata?.användaFörskott || "0",
      kvarandeFörskott: anställd?.semesterdata?.kvarandeFörskott || "0",
      innestående: anställd?.semesterdata?.innestående || "0",
    });
    setIsEditing(false);
  };
  // #endregion

  if (isEditing) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-white">Semesterdata</h3>
            <InfoTooltip
              text="Här hanteras all semesterrelaterad information för anställd. Ändringar sparas direkt till databasen."
              position="right"
            />
          </div>
          <div className="flex gap-2">
            <Knapp text="Spara" onClick={handleSave} />
            <Knapp text="Avbryt" onClick={handleCancel} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-white">Semesterdagar per år</label>
              <InfoTooltip text={infoTexts.semesterdagarPerÅr} />
            </div>
            <TextFält
              label=""
              name="semesterdagarPerÅr"
              type="number"
              value={editData.semesterdagarPerÅr}
              onChange={(e) => handleChange("semesterdagarPerÅr", e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-white">Kvarvarande dagar</label>
              <InfoTooltip text={infoTexts.kvarandeDagar} />
            </div>
            <TextFält
              label=""
              name="kvarandeDagar"
              type="number"
              value={editData.kvarandeDagar}
              onChange={(e) => handleChange("kvarandeDagar", e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-white">Sparade dagar</label>
              <InfoTooltip text={infoTexts.sparadeDagar} />
            </div>
            <TextFält
              label=""
              name="sparadeDagar"
              type="number"
              value={editData.sparadeDagar}
              onChange={(e) => handleChange("sparadeDagar", e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-white">
                Använda förskottssemesterdagar
              </label>
              <InfoTooltip text={infoTexts.användaFörskott} />
            </div>
            <TextFält
              label=""
              name="användaFörskott"
              type="number"
              value={editData.användaFörskott}
              onChange={(e) => handleChange("användaFörskott", e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-white">
                Kvarvarande förskottssemesterdagar
              </label>
              <InfoTooltip text={infoTexts.kvarandeFörskott} />
            </div>
            <TextFält
              label=""
              name="kvarandeFörskott"
              type="number"
              value={editData.kvarandeFörskott}
              onChange={(e) => handleChange("kvarandeFörskott", e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-white">
                Innestående semesterersättning (kr)
              </label>
              <InfoTooltip text={infoTexts.innestående} />
            </div>
            <TextFält
              label=""
              name="innestående"
              type="number"
              value={editData.innestående}
              onChange={(e) => handleChange("innestående", e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold text-white">Semesterdata</h3>
          <InfoTooltip
            text="Visar aktuell semesterstatus för anställd. Klicka 'Redigera' för att ändra värden."
            position="right"
          />
        </div>
        <Knapp text="Redigera" onClick={() => setIsEditing(true)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          ["Semesterdagar per år", editData.semesterdagarPerÅr, infoTexts.semesterdagarPerÅr],
          ["Kvarvarande dagar", editData.kvarandeDagar, infoTexts.kvarandeDagar],
          ["Sparade dagar", editData.sparadeDagar, infoTexts.sparadeDagar],
          ["Använda förskottssemesterdagar", editData.användaFörskott, infoTexts.användaFörskott],
          [
            "Kvarvarande förskottssemesterdagar",
            editData.kvarandeFörskott,
            infoTexts.kvarandeFörskott,
          ],
          ["Innestående semesterersättning", `${editData.innestående} kr`, infoTexts.innestående],
        ].map(([label, value, infoText]) => (
          <div key={label as string}>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-white">{label}</label>
              <InfoTooltip text={infoText as string} />
            </div>
            <div className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white">
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
