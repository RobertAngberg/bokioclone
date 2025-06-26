import { beräknaKarensavdrag, beräknaDaglön, beräknaObetaldDag } from "../../löneberäkningar";

export interface RadKonfiguration {
  label: string;
  enhet: string;
  beräknaVärde?: (grundlön: number) => number;
  beräknaTotalt?: (grundlön: number, antal: number) => number;
  negativtBelopp?: boolean;
  skattepliktig?: boolean;
  fält: {
    antalLabel: string;
    antalPlaceholder: string;
    beloppPlaceholder?: string;
    step?: string;
    visaBelopp?: boolean;
    enhetDropdown?: string[];
    skipKommentar?: boolean;
  };
}

export const RAD_KONFIGURATIONER: Record<string, RadKonfiguration> = {
  karensavdrag: {
    label: "Karensavdrag",
    enhet: "st",
    beräknaVärde: (grundlön) => beräknaKarensavdrag(grundlön),
    beräknaTotalt: (grundlön, antal) => beräknaKarensavdrag(grundlön) * antal,
    negativtBelopp: true,
    fält: {
      antalLabel: "Antal",
      antalPlaceholder: "Vanligtvis 1",
      step: "1",
      visaBelopp: true,
    },
  },

  obetaldaDagar: {
    label: "Obetalda dagar",
    enhet: "dagar",
    beräknaVärde: (grundlön) => beräknaObetaldDag(grundlön),
    beräknaTotalt: (grundlön, antal) => beräknaObetaldDag(grundlön) * antal,
    negativtBelopp: true,
    fält: {
      antalLabel: "Antal dagar",
      antalPlaceholder: "Ange antal dagar",
      step: "1",
      visaBelopp: false,
    },
  },

  reduceradeDagar: {
    label: "Reducerade dagar",
    enhet: "dagar",
    beräknaVärde: (grundlön) => beräknaDaglön(grundlön) * 0.2,
    beräknaTotalt: (grundlön, antal) => beräknaDaglön(grundlön) * 0.2 * antal,
    negativtBelopp: true,
    fält: {
      antalLabel: "Antal dagar",
      antalPlaceholder: "Ange antal dagar",
      step: "1",
      visaBelopp: false,
    },
  },

  vab: {
    label: "Vård av sjukt barn",
    enhet: "dagar",
    beräknaVärde: (grundlön) => beräknaDaglön(grundlön),
    beräknaTotalt: (grundlön, antal) => beräknaDaglön(grundlön) * antal,
    negativtBelopp: true,
    fält: {
      antalLabel: "Antal dagar",
      antalPlaceholder: "Ange antal dagar",
      step: "1",
      visaBelopp: false,
    },
  },

  foraldraledighet: {
    label: "Föräldraledighet",
    enhet: "dagar",
    beräknaVärde: (grundlön) => beräknaDaglön(grundlön),
    beräknaTotalt: (grundlön, antal) => beräknaDaglön(grundlön) * antal,
    negativtBelopp: true,
    fält: {
      antalLabel: "Antal dagar",
      antalPlaceholder: "Ange antal dagar",
      step: "1",
      visaBelopp: false,
    },
  },

  forsakring: {
    label: "Försäkring",
    enhet: "st",
    skattepliktig: true,
    fält: {
      antalLabel: "Antal",
      antalPlaceholder: "Ange antal",
      step: "1",
      visaBelopp: true,
    },
  },

  ranteforman: {
    label: "Ränteförmån",
    enhet: "st",
    skattepliktig: true,
    fält: {
      antalLabel: "Antal",
      antalPlaceholder: "Ange antal",
      step: "1",
      visaBelopp: true,
    },
  },

  parkering: {
    label: "Parkering",
    enhet: "st",
    skattepliktig: true,
    fält: {
      antalLabel: "Antal",
      antalPlaceholder: "Ange antal",
      step: "1",
      visaBelopp: true,
    },
  },

  annanForman: {
    label: "Annan förmån",
    enhet: "st",
    skattepliktig: true,
    fält: {
      antalLabel: "Antal",
      antalPlaceholder: "Ange antal",
      step: "1",
      visaBelopp: true,
    },
  },

  gratisFrukost: {
    label: "Gratis frukost",
    enhet: "mål",
    skattepliktig: true,
    beräknaVärde: () => 61,
    beräknaTotalt: (grundlön, antal) => 61 * antal,
    fält: {
      antalLabel: "Antal mål",
      antalPlaceholder: "Ange antal mål",
      step: "1",
      visaBelopp: false,
    },
  },

  gratisLunchMiddag: {
    label: "Gratis lunch eller middag",
    enhet: "mål",
    skattepliktig: true,
    beräknaVärde: () => 122,
    beräknaTotalt: (grundlön, antal) => 122 * antal,
    fält: {
      antalLabel: "Antal mål",
      antalPlaceholder: "Ange antal mål",
      step: "1",
      visaBelopp: false,
    },
  },

  gratisMat: {
    label: "Gratis mat",
    enhet: "dagar",
    skattepliktig: true,
    beräknaVärde: () => 305,
    beräknaTotalt: (grundlön, antal) => 305 * antal,
    fält: {
      antalLabel: "Antal dagar",
      antalPlaceholder: "Ange antal dagar",
      step: "1",
      visaBelopp: false,
    },
  },

  boende: {
    label: "Boende",
    enhet: "kvm",
    skattepliktig: true,
    beräknaVärde: () => 135,
    beräknaTotalt: (grundlön, antal) => 135 * antal,
    fält: {
      antalLabel: "Kvadratmeter",
      antalPlaceholder: "Ange antal kvm",
      step: "0.5",
      visaBelopp: false,
    },
  },

  resersattning: {
    label: "Reseersättning",
    enhet: "st",
    skattepliktig: true,
    fält: {
      antalLabel: "Antal",
      antalPlaceholder: "Ange antal",
      step: "1",
      visaBelopp: true,
    },
  },

  logi: {
    label: "Logi",
    enhet: "st",
    skattepliktig: true,
    fält: {
      antalLabel: "Antal",
      antalPlaceholder: "Ange antal",
      step: "1",
      visaBelopp: true,
    },
  },

  uppehalleInrikes: {
    label: "Uppehälle, inrikes",
    enhet: "st",
    skattepliktig: true,
    fält: {
      antalLabel: "Antal",
      antalPlaceholder: "Ange antal",
      step: "1",
      visaBelopp: true,
    },
  },

  uppehalleUtrikes: {
    label: "Uppehälle, utrikes",
    enhet: "st",
    skattepliktig: true,
    fält: {
      antalLabel: "Antal",
      antalPlaceholder: "Ange antal",
      step: "1",
      visaBelopp: true,
    },
  },

  annanKompensation: {
    label: "Annan kompensation",
    enhet: "st",
    skattepliktig: true,
    fält: {
      antalLabel: "Antal",
      antalPlaceholder: "Ange antal",
      step: "1",
      visaBelopp: true,
    },
  },

  privatBil: {
    label: "Privat bil",
    enhet: "km",
    skattepliktig: true,
    beräknaVärde: () => 2.5,
    beräknaTotalt: (grundlön, antal) => 2.5 * antal,
    fält: {
      antalLabel: "Kilometer",
      antalPlaceholder: "Ange antal kilometer",
      step: "0.1",
      visaBelopp: true,
    },
  },

  foretagsbilBensinDiesel: {
    label: "Företagsbil, bensin eller diesel",
    enhet: "km",
    skattepliktig: true,
    beräknaVärde: () => 1.2,
    beräknaTotalt: (grundlön, antal) => 1.2 * antal,
    fält: {
      antalLabel: "Kilometer",
      antalPlaceholder: "Ange antal kilometer",
      step: "0.1",
      visaBelopp: true,
    },
  },

  foretagsbilEl: {
    label: "Företagsbil, el",
    enhet: "km",
    skattepliktig: true,
    beräknaVärde: () => 0.95,
    beräknaTotalt: (grundlön, antal) => 0.95 * antal,
    fält: {
      antalLabel: "Kilometer",
      antalPlaceholder: "Ange antal kilometer",
      step: "0.1",
      visaBelopp: true,
    },
  },

  semestertillagg: {
    label: "Semestertillägg",
    enhet: "dagar",
    skattepliktig: true,
    beräknaVärde: () => 150.5,
    beräknaTotalt: (grundlön, antal) => 150.5 * antal,
    fält: {
      antalLabel: "Antal dagar",
      antalPlaceholder: "Ange antal dagar",
      step: "1",
      visaBelopp: false,
    },
  },

  semesterskuld: {
    label: "Semesterskuld",
    enhet: "variabel",
    skattepliktig: true,
    fält: {
      antalLabel: "Antal",
      antalPlaceholder: "Ange antal",
      step: "1",
      visaBelopp: true,
      enhetDropdown: ["Timme", "Dag", "St"],
    },
  },

  overtid: {
    label: "Övertid",
    enhet: "kr",
    skattepliktig: true,
    beräknaVärde: () => 1,
    beräknaTotalt: (grundlön, antal) => antal * 1,
    fält: {
      antalLabel: "Summa",
      antalPlaceholder: "Ange summa i kronor",
      step: "0.01",
      visaBelopp: false,
    },
  },

  obTillagg: {
    label: "OB-tillägg",
    enhet: "kr",
    skattepliktig: true,
    fält: {
      antalLabel: "Summa",
      antalPlaceholder: "Ange summa i kronor",
      step: "0.01",
      visaBelopp: false,
    },
  },

  risktillagg: {
    label: "Risktillägg",
    enhet: "kr",
    skattepliktig: true,
    beräknaVärde: () => 1,
    beräknaTotalt: (grundlön, antal) => antal * 1,
    fält: {
      antalLabel: "Summa",
      antalPlaceholder: "Ange summa i kronor",
      step: "0.01",
      visaBelopp: false,
    },
  },

  obetaldFranvaro: {
    label: "Obetald frånvaro",
    enhet: "kr",
    beräknaVärde: () => 1,
    beräknaTotalt: (grundlön, antal) => antal * 1,
    negativtBelopp: true,
    fält: {
      antalLabel: "Summa",
      antalPlaceholder: "Ange summa i kronor",
      step: "0.01",
      visaBelopp: false,
    },
  },

  foretagsbilExtra: {
    label: "Företagsbil",
    enhet: "st",
    skattepliktig: true,
    fält: {
      antalLabel: "Modell",
      antalPlaceholder: "Modell",
      beloppPlaceholder: "Belopp",
      step: "1",
      visaBelopp: true,
    },
  },

  nettolönejustering: {
    label: "Nettolönejustering",
    enhet: "variabel",
    fält: {
      antalLabel: "Antal",
      antalPlaceholder: "Ange antal",
      step: "1",
      visaBelopp: true,
      beloppPlaceholder: "Belopp (använd - för avdrag)",
      enhetDropdown: ["Timme", "Dag", "St"],
    },
  },
};

export type RadKonfigurationType = RadKonfiguration;

// Tom export för att säkerställa att filen behandlas som en modul
export {};
