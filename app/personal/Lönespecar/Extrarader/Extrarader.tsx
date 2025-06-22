//#region: Huvud
"use client";

import AnimeradFlik from "../../../_components/AnimeradFlik";
import ExtraraderModal from "./ExtraraderModal";
import ExtraraderSökning from "./ExtraraderSökning";
import ExtraraderGrid from "./ExtraraderGrid";
import { sparaExtrarad } from "../../actions";
import { useExtraraderState } from "./useExtraraderState";
import {
  beräknaSumma,
  formatKolumn2Värde,
  initializeModalFields,
  getFieldsForRow,
} from "./extraraderUtils";

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
  const {
    state,
    setState,
    open,
    setOpen,
    modalOpen,
    setModalOpen,
    modalRow,
    setModalRow,
    modalFields,
    setModalFields,
    sökterm,
    setSökterm,
  } = useExtraraderState();

  const toggleDropdown = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCheckbox = (id: string, label: string) => {
    const newCheckedState = !state[id];
    setState((prev) => ({ ...prev, [id]: newCheckedState }));

    // Öppna modal endast om raden kryssas I (inte ur)
    if (newCheckedState) {
      setModalRow({ id, label });
      setModalFields(initializeModalFields(id, grundlön));
      setModalOpen(true);
    }
  };

  return (
    <AnimeradFlik title="Extra rader" icon="➕">
      <ExtraraderSökning sökterm={sökterm} setSökterm={setSökterm} />

      <ExtraraderGrid
        sökterm={sökterm}
        state={state}
        open={open}
        toggleDropdown={toggleDropdown}
        toggleCheckbox={toggleCheckbox}
      />

      <ExtraraderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalRow?.label}
        fields={getFieldsForRow(modalRow?.id || "", modalFields, setModalFields, grundlön)}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!lönespecId) return;

          const kolumn3Value = beräknaSumma(modalRow?.id || "", modalFields, grundlön);
          const kolumn2Value = formatKolumn2Värde(modalRow?.id || "", modalFields);

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
