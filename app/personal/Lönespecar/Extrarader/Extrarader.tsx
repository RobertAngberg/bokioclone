//#region Huvud
"use client";

import { useState } from "react";
import AnimeradFlik from "../../../_components/AnimeradFlik";
import Modal from "./Modal";
import Rad from "./Rad";
import DropdownRad from "./DropdownRad";

export default function ExtraRader() {
  //#endregion

  //#region State
  const [state, setState] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({
    sjukfranvaro: false,
    skattadeFormaner: false,
    skattefrittTraktamente: false,
    bilersattning: false,
  });

  //#region Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRow, setModalRow] = useState<{ id: string; label: string } | null>(null);
  //#endregion

  ///#region Toggles
  const toggleCheckbox = (id: string, label: string) => {
    setState((prev) => ({ ...prev, [id]: !prev[id] }));
    setModalRow({ id, label });
    setModalOpen(true);
  };

  const toggleDropdown = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  //#endregion

  //#region Rader
  const staticRows = [
    { id: "semesterersattning", label: "Semesterersättning" },
    { id: "avanceradSemesterersattning", label: "Avancerad semesterersättning" },
    { id: "semestertillagg", label: "Semestertillägg" },
    { id: "semesterskuld", label: "Semesterskuld" },
    { id: "overtid", label: "Övertid" },
    { id: "obTillagg", label: "OB-tillägg" },
    { id: "risktillagg", label: "Risktillägg" },
    { id: "obetaldFranvaro", label: "Obetald frånvaro" },
    { id: "foretagsbilExtra", label: "Företagsbil" },
    { id: "jamkning", label: "Jämkning" },
    { id: "nettolönejustering", label: "Nettolönejustering" },
    { id: "lon", label: "Lön" },
    { id: "fritext", label: "Fritext" },
  ];
  const mittenRows = staticRows.slice(0, Math.ceil(staticRows.length / 2));
  const hogerRows = staticRows.slice(Math.ceil(staticRows.length / 2));
  //#endregion

  return (
    <AnimeradFlik title="Extra rader" icon="➕">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolumn vänster */}
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
                { id: "reduceradeDagar", label: "Reducerade dagar" },
                { id: "obetaldaDagar", label: "Obetalda dagar" },
              ].map((item) => (
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
                { id: "forsakring", label: "Försäkring" },
                { id: "ranteforman", label: "Ränteförmån" },
                { id: "parkering", label: "Parkering" },
                { id: "annanForman", label: "Annan förmån" },
                { id: "gratisFrukost", label: "Gratis frukost" },
                { id: "gratisLunchMiddag", label: "Gratis lunch eller middag" },
                { id: "gratisMat", label: "Gratis mat" },
                { id: "boende", label: "Boende" },
              ].map((item) => (
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
                { id: "resersattning", label: "Reseersättning" },
                { id: "logi", label: "Logi" },
                { id: "uppehalleInrikes", label: "Uppehälle, inrikes" },
                { id: "uppehalleUtrikes", label: "Uppehälle, utrikes" },
                { id: "annanKompensation", label: "Annan kompensation" },
              ].map((item) => (
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
                { id: "privatBil", label: "Privat bil" },
                { id: "privatBil2023", label: "Privat bil (resor innan 2023)" },
                { id: "foretagsbilBensinDiesel", label: "Företagsbil, bensin eller diesel" },
                { id: "foretagsbilEl", label: "Företagsbil, el" },
                { id: "foretagsbilBensin2023", label: "Företagsbil, bensin (resor innan 2023)" },
                { id: "foretagsbilDiesel2023", label: "Företagsbil, diesel (resor innan 2023)" },
              ].map((item) => (
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

        {/* Kolumn mitten */}
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

        {/* Kolumn höger */}
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={modalRow?.label} />
    </AnimeradFlik>
  );
}
