//#region Huvud
"use client";

import { useState } from "react";
import AnimeradFlik from "../../../_components/AnimeradFlik";
import Modal from "./Modal";
import Rad from "./Rad";
import DropdownRad from "./DropdownRad";
import { sparaExtrarad } from "../../actions";

export default function ExtraRader({
  lönespecId,
  onNyRad,
}: {
  lönespecId: number;
  onNyRad: () => void;
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
  });
  //#endregion

  //#region Togglers
  const toggleCheckbox = (id: string, label: string) => {
    setState((prev) => ({ ...prev, [id]: !prev[id] }));
    setModalRow({ id, label });
    setModalFields({
      kolumn2: "",
      kolumn3: "",
      kolumn4: "",
    });
    setModalOpen(true);
  };

  const toggleDropdown = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  //#endregion

  //#region Rader
  // Alla val (utom dropdowns) i bokstavsordning, men Fritext och Lön sist
  const staticRows = [
    { id: "foretagsbilExtra", label: "Företagsbil" },
    { id: "foraldraledighet", label: "Föräldraledighet" },
    { id: "jamkning", label: "Jämkning" },
    { id: "nettolönejustering", label: "Nettolönejustering" },
    { id: "obetaldFranvaro", label: "Obetald frånvaro" },
    { id: "obTillagg", label: "OB-tillägg" },
    { id: "overtid", label: "Övertid" },
    { id: "risktillagg", label: "Risktillägg" },
    { id: "semesterskuld", label: "Semesterskuld" },
    { id: "semestertillagg", label: "Semestertillägg" },
    { id: "vab", label: "Vård av sjukt barn" },
    // Fritext och Lön sist
    { id: "lon", label: "Lön" },
    { id: "fritext", label: "Fritext" },
  ];

  const mittenRows = staticRows.slice(0, Math.ceil(staticRows.length / 2));
  const hogerRows = staticRows.slice(Math.ceil(staticRows.length / 2));
  //#endregion

  //#region Render
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
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalRow?.label}
        fields={[
          {
            label: "Antal",
            name: "kolumn2",
            value: modalFields.kolumn2,
            onChange: (e) => setModalFields((f) => ({ ...f, kolumn2: e.target.value })),
          },
          {
            label: "à SEK",
            name: "kolumn3",
            value: modalFields.kolumn3,
            onChange: (e) => setModalFields((f) => ({ ...f, kolumn3: e.target.value })),
          },
          {
            label: "Kommentar",
            name: "kolumn4",
            value: modalFields.kolumn4,
            onChange: (e) => setModalFields((f) => ({ ...f, kolumn4: e.target.value })),
          },
        ]}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!lönespecId) return;
          await sparaExtrarad({
            lönespecifikation_id: lönespecId,
            kolumn1: modalRow?.label ?? "",
            kolumn2: modalFields.kolumn2,
            kolumn3: modalFields.kolumn3,
            kolumn4: modalFields.kolumn4,
          });
          setModalOpen(false);
          onNyRad();
        }}
      />
    </AnimeradFlik>
  );
}
//#endregion
