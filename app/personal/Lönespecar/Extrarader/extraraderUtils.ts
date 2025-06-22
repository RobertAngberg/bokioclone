import { RAD_KONFIGURATIONER } from "./radKonfiguration";

export function filtreraRader(rader: { id: string; label: string }[], sökterm: string) {
  if (!sökterm.trim()) return rader;
  return rader.filter((rad) => rad.label.toLowerCase().includes(sökterm.toLowerCase()));
}

export function beräknaSumma(rowId: string, modalFields: any, grundlön?: number) {
  const config = RAD_KONFIGURATIONER[rowId];

  if (config?.beräknaTotalt && grundlön) {
    const antal = parseFloat(modalFields.kolumn2) || 0;
    let summa = config.beräknaTotalt(grundlön, antal);

    if (config.negativtBelopp) {
      summa = -Math.abs(summa);
    }

    return summa.toFixed(2);
  }

  // Fallback för vanliga beräkningar
  const antal = parseFloat(modalFields.kolumn2) || 0;
  const belopp = parseFloat(modalFields.kolumn3) || 0;
  return (antal * belopp).toString();
}

export function formatKolumn2Värde(rowId: string, modalFields: any) {
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
}

export function initializeModalFields(rowId: string, grundlön?: number) {
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
}

export function getStandardFields(modalFields: any, setModalFields: any) {
  return [
    {
      label: "Antal",
      name: "kolumn2",
      type: "text" as const,
      value: modalFields.kolumn2,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setModalFields((f: any) => ({ ...f, kolumn2: e.target.value })),
      required: true,
      placeholder: "Ange antal",
    },
    {
      label: "à SEK",
      name: "kolumn3",
      type: "number" as const,
      value: modalFields.kolumn3,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setModalFields((f: any) => ({ ...f, kolumn3: e.target.value })),
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
        setModalFields((f: any) => ({ ...f, kolumn4: e.target.value })),
      required: false,
      placeholder: "Valfri kommentar",
    },
  ];
}

export function getFieldsForRow(
  rowId: string,
  modalFields: any,
  setModalFields: any,
  grundlön?: number
) {
  const config = RAD_KONFIGURATIONER[rowId];

  if (config) {
    const fields: any[] = [
      {
        label: config.fält.antalLabel,
        name: "kolumn2",
        type: rowId === "foretagsbilExtra" ? "text" : "number",
        value: modalFields.kolumn2,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
          setModalFields((f: any) => ({ ...f, kolumn2: e.target.value })),
        required: true,
        min: rowId === "foretagsbilExtra" ? undefined : "0",
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
          setModalFields((f: any) => ({ ...f, enhet: e.target.value })),
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
          setModalFields((f: any) => ({ ...f, kolumn3: e.target.value })),
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
          setModalFields((f: any) => ({ ...f, kolumn4: e.target.value })),
        required: false,
        placeholder: "Valfri kommentar",
      });
    }

    return fields;
  }

  // Fallback för okonfigurerade rader
  return getStandardFields(modalFields, setModalFields);
}
