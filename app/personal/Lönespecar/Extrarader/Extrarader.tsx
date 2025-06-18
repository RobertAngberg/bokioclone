//#region Huvud
"use client";

import { useState } from "react";
import AnimeradFlik from "../../../_components/AnimeradFlik";
import ExtraraderModal from "./ExtraraderModal";
import Rad from "./Rad";
import DropdownRad from "./DropdownRad";
import { sparaExtrarad } from "../../actions";
import { RAD_KONFIGURATIONER } from "./radKonfiguration";

export default function ExtraRader({
  lönespecId,
  onNyRad,
  grundlön,
}: {
  lönespecId: number;
  onNyRad: () => void;
  grundlön?: number;
}) {
  //#endregion

  //#region State
  const [state, setState] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({
    sjukfranvaro: false,
    skattadeFormaner: false,
    skattefrittTraktamente: false,
    bilersattning: false,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRow, setModalRow] = useState<{ id: string; label: string } | null>(null);
  const [modalFields, setModalFields] = useState({
    kolumn2: "",
    kolumn3: "",
    kolumn4: "",
    enhet: "", // Nytt: för dropdown-enhet
  });
  //#endregion

  //#region Helper Functions
  const getStandardFields = () => [
    {
      label: "Antal",
      name: "kolumn2",
      type: "text" as const,
      value: modalFields.kolumn2,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setModalFields((f) => ({ ...f, kolumn2: e.target.value })),
      required: true,
      placeholder: "Ange antal",
    },
    {
      label: "à SEK",
      name: "kolumn3",
      type: "number" as const,
      value: modalFields.kolumn3,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setModalFields((f) => ({ ...f, kolumn3: e.target.value })),
      step: "0.01",
      required: true,
      placeholder: "Belopp per enhet",
    },
    {
      label: "Kommentar",
      name: "kolumn4",
      type: "text" as const,
      value: modalFields.kolumn4,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setModalFields((f) => ({ ...f, kolumn4: e.target.value })),
      required: false,
      placeholder: "Valfri kommentar",
    },
  ];

  const getFieldsForRow = (rowId: string) => {
    const config = RAD_KONFIGURATIONER[rowId];

    if (config) {
      const fields: any[] = [
        {
          label: config.fält.antalLabel,
          name: "kolumn2",
          type: rowId === "foretagsbilExtra" ? "text" : "number", // Text för Företagsbil, number för resten
          value: modalFields.kolumn2,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setModalFields((f) => ({ ...f, kolumn2: e.target.value })),
          required: true,
          min: rowId === "foretagsbilExtra" ? undefined : "0", // Ingen min för text-fält
          step: config.fält.step || "1",
          placeholder: config.fält.antalPlaceholder,
        },
      ];

      // Lägg till dropdown för enhet om konfigurerat
      if (config.fält.enhetDropdown) {
        fields.push({
          label: "Enhet",
          name: "enhet",
          type: "select" as const,
          value: modalFields.enhet,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
            setModalFields((f) => ({ ...f, enhet: e.target.value })),
          required: true,
          options: config.fält.enhetDropdown,
        });
      }

      // Lägg till belopp-fält om konfigurerat
      if (config.fält.visaBelopp) {
        fields.push({
          label: "à SEK",
          name: "kolumn3",
          type: "number" as const,
          value: modalFields.kolumn3,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setModalFields((f) => ({ ...f, kolumn3: e.target.value })),
          step: "0.01",
          required: true,
          min: "0",
          placeholder: "Belopp per " + config.enhet,
        });
      } else {
        // Dolt fält för automatisk beräkning
        fields.push({
          label: "à SEK",
          name: "kolumn3",
          type: "text" as const,
          value: config.beräknaVärde && grundlön ? config.beräknaVärde(grundlön).toFixed(2) : "0",
          onChange: () => {},
          required: false,
          placeholder: "",
          hidden: true,
        });
      }

      // Lägg till kommentar-fält ENDAST om inte skipKommentar är sant
      if (!config.fält.skipKommentar) {
        fields.push({
          label: "Kommentar",
          name: "kolumn4",
          type: "text" as const,
          value: modalFields.kolumn4,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
            setModalFields((f) => ({ ...f, kolumn4: e.target.value })),
          required: false,
          placeholder: "Valfri kommentar",
        });
      }

      return fields;
    }

    // Fallback för okonfigurerade rader
    return getStandardFields();
  };

  const initializeModalFields = (rowId: string) => {
    const config = RAD_KONFIGURATIONER[rowId];

    if (config?.beräknaVärde && grundlön) {
      const värde = config.beräknaVärde(grundlön);
      return {
        kolumn2: config.fält.visaBelopp ? "1" : "",
        kolumn3: värde.toFixed(2),
        kolumn4: "",
        enhet: config.fält.enhetDropdown ? config.fält.enhetDropdown[0] : "",
      };
    }

    return {
      kolumn2: "",
      kolumn3: "",
      kolumn4: "",
      enhet: config?.fält.enhetDropdown ? config.fält.enhetDropdown[0] : "",
    };
  };

  const beräknaSumma = (rowId: string) => {
    const config = RAD_KONFIGURATIONER[rowId];

    if (config?.beräknaTotalt && grundlön) {
      const antal = parseFloat(modalFields.kolumn2) || 0;
      let summa = config.beräknaTotalt(grundlön, antal);

      if (config.negativtBelopp) {
        summa = -Math.abs(summa);
      }

      return summa.toFixed(2);
    }

    return modalFields.kolumn3;
  };

  const formatKolumn2Värde = (rowId: string) => {
    const config = RAD_KONFIGURATIONER[rowId];

    // För rader med dropdown, kombinera antal + enhet
    if (config?.fält.enhetDropdown && modalFields.enhet) {
      return `${modalFields.kolumn2} ${modalFields.enhet}`;
    }

    // För alla andra rader, lägg till enhetstext baserat på konfiguration
    if (config) {
      const antal = modalFields.kolumn2;

      // Mappning av enheter till visningstext
      const enhetTexts: Record<string, string> = {
        dagar: "Dag",
        timmar: "Timme",
        st: "st",
        mål: "Mål",
        kvm: "m²",
        km: "km",
        kr: "", // Ingen enhetstext för kronor (bara summan)
      };

      const enhetText = enhetTexts[config.enhet] || "";

      // Specialfall för olika rader
      if (rowId === "boende") {
        return `${antal}m²`; // "1m²"
      } else if (rowId === "gratisFrukost" || rowId === "gratisLunchMiddag") {
        return `${antal} Mål`; // "1 Mål"
      } else if (config.enhet === "kr") {
        return antal; // Bara summan för kronor
      } else if (enhetText) {
        return `${antal} ${enhetText}`; // "1 Dag", "1 st", etc.
      }
    }

    return modalFields.kolumn2;
  };
  //#endregion

  //#region Togglers
  const toggleCheckbox = (id: string, label: string) => {
    const newCheckedState = !state[id];
    setState((prev) => ({ ...prev, [id]: newCheckedState }));

    // Öppna modal endast om raden kryssas I (inte ur)
    if (newCheckedState) {
      setModalRow({ id, label });
      setModalFields(initializeModalFields(id));
      setModalOpen(true);
    }
  };

  const toggleDropdown = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  //#endregion

  //#region Rader
  const staticRows = [
    { id: "foretagsbilExtra", label: "Företagsbil" },
    { id: "foraldraledighet", label: "Föräldraledighet" },
    { id: "jamkning", label: "Jämkning" },
    { id: "nettolönejustering", label: "Nettolönejustering" },
    { id: "obetaldFranvaro", label: "Obetald frånvaro" },
    { id: "obTillagg", label: "OB-tillägg" },
    { id: "overtid", label: "Övertid" },
    { id: "risktillagg", label: "Risktillägg" },
    { id: "semesterskuld", label: "Semesterskuld" },
    { id: "semestertillagg", label: "Semestertillägg" },
    { id: "vab", label: "Vård av sjukt barn" },
    { id: "fritext", label: "Fritext" },
    { id: "lon", label: "Lön" },
  ];

  const mittenRows = staticRows.slice(0, Math.ceil(staticRows.length / 2));
  const hogerRows = staticRows.slice(Math.ceil(staticRows.length / 2));
  //#endregion

  return (
    <AnimeradFlik title="Extra rader" icon="➕">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vänster kolumn: Dropdowns */}
        <div className="space-y-1">
          <DropdownRad
            label="Sjukfrånvaro"
            open={open.sjukfranvaro}
            toggle={() => toggleDropdown("sjukfranvaro")}
          />
          {open.sjukfranvaro && (
            <div className="ml-6 space-y-1">
              {[
                { id: "karensavdrag", label: "Karensavdrag" },
                { id: "obetaldaDagar", label: "Obetalda dagar" },
                { id: "reduceradeDagar", label: "Reducerade dagar" },
              ]
                .sort((a, b) => a.label.localeCompare(b.label, "sv"))
                .map((item) => (
                  <Rad
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    checked={state[item.id]}
                    toggle={() => toggleCheckbox(item.id, item.label)}
                  />
                ))}
            </div>
          )}

          <DropdownRad
            label="Skattade förmåner"
            open={open.skattadeFormaner}
            toggle={() => toggleDropdown("skattadeFormaner")}
          />
          {open.skattadeFormaner && (
            <div className="ml-6 space-y-1">
              {[
                { id: "annanForman", label: "Annan förmån" },
                { id: "boende", label: "Boende" },
                { id: "forsakring", label: "Försäkring" },
                { id: "gratisFrukost", label: "Gratis frukost" },
                { id: "gratisLunchMiddag", label: "Gratis lunch eller middag" },
                { id: "gratisMat", label: "Gratis mat" },
                { id: "parkering", label: "Parkering" },
                { id: "ranteforman", label: "Ränteförmån" },
              ]
                .sort((a, b) => a.label.localeCompare(b.label, "sv"))
                .map((item) => (
                  <Rad
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    checked={state[item.id]}
                    toggle={() => toggleCheckbox(item.id, item.label)}
                  />
                ))}
            </div>
          )}

          <DropdownRad
            label="Skattefritt traktamente"
            open={open.skattefrittTraktamente}
            toggle={() => toggleDropdown("skattefrittTraktamente")}
          />
          {open.skattefrittTraktamente && (
            <div className="ml-6 space-y-1">
              {[
                { id: "annanKompensation", label: "Annan kompensation" },
                { id: "logi", label: "Logi" },
                { id: "resersattning", label: "Reseersättning" },
                { id: "uppehalleInrikes", label: "Uppehälle, inrikes" },
                { id: "uppehalleUtrikes", label: "Uppehälle, utrikes" },
              ]
                .sort((a, b) => a.label.localeCompare(b.label, "sv"))
                .map((item) => (
                  <Rad
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    checked={state[item.id]}
                    toggle={() => toggleCheckbox(item.id, item.label)}
                  />
                ))}
            </div>
          )}

          <DropdownRad
            label="Bilersättning"
            open={open.bilersattning}
            toggle={() => toggleDropdown("bilersattning")}
          />
          {open.bilersattning && (
            <div className="ml-6 space-y-1">
              {[
                { id: "foretagsbilBensinDiesel", label: "Företagsbil, bensin eller diesel" },
                { id: "foretagsbilEl", label: "Företagsbil, el" },
                { id: "privatBil", label: "Privat bil" },
              ]
                .sort((a, b) => a.label.localeCompare(b.label, "sv"))
                .map((item) => (
                  <Rad
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    checked={state[item.id]}
                    toggle={() => toggleCheckbox(item.id, item.label)}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Mitten kolumn */}
        <div className="space-y-1">
          {mittenRows.map((item) => (
            <Rad
              key={item.id}
              id={item.id}
              label={item.label}
              checked={state[item.id]}
              toggle={() => toggleCheckbox(item.id, item.label)}
            />
          ))}
        </div>

        {/* Höger kolumn */}
        <div className="space-y-1">
          {hogerRows.map((item) => (
            <Rad
              key={item.id}
              id={item.id}
              label={item.label}
              checked={state[item.id]}
              toggle={() => toggleCheckbox(item.id, item.label)}
            />
          ))}
        </div>
      </div>

      <ExtraraderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalRow?.label}
        fields={getFieldsForRow(modalRow?.id || "")}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!lönespecId) return;

          const kolumn3Value = beräknaSumma(modalRow?.id || "");
          const kolumn2Value = formatKolumn2Värde(modalRow?.id || "");

          await sparaExtrarad({
            lönespecifikation_id: lönespecId,
            kolumn1: modalRow?.label ?? "",
            kolumn2: kolumn2Value,
            kolumn3: kolumn3Value,
            kolumn4: modalFields.kolumn4,
          });
          setModalOpen(false);
          onNyRad();
        }}
      />
    </AnimeradFlik>
  );
}
