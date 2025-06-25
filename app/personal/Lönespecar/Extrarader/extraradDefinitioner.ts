import { beräknaKarensavdrag, beräknaDaglön, beräknaObetaldDag } from "../Formler";

export interface RadKonfiguration {
  label: string;
  enhet: string;
  beräknaVärde?: (grundlön: number) => number;
  beräknaTotalt?: (grundlön: number, antal: number) => number;
  negativtBelopp?: boolean;
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
    enhet: "timmar",
    beräknaVärde: (grundlön) => (beräknaDaglön(grundlön) * 0.2) / 8, // Per timme
    beräknaTotalt: (grundlön, antal) => ((beräknaDaglön(grundlön) * 0.2) / 8) * antal,
    negativtBelopp: true,
    fält: {
      antalLabel: "Antal timmar",
      antalPlaceholder: "Ange antal timmar",
      step: "0.5",
      visaBelopp: false,
    },
  },

  vab: {
    label: "Vård av sjukt barn",
    enhet: "dagar",
    beräknaVärde: (grundlön) => beräknaDaglön(grundlön), // 4,6% av månadslön
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
    beräknaVärde: (grundlön) => beräknaDaglön(grundlön), // 4,6% av månadslön
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
    beräknaVärde: () => 61, // Fast belopp 61 kr per mål
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
    beräknaVärde: () => 122, // Fast belopp 122 kr per mål
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
    beräknaVärde: () => 305, // Fast belopp 305 kr per dag
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
    beräknaVärde: () => 135, // Fast belopp 135 kr per kvm (ändrat från 134)
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
    beräknaVärde: () => 2.5, // Fast ersättning 2,50 kr per km
    beräknaTotalt: (grundlön, antal) => 2.5 * antal,
    fält: {
      antalLabel: "Kilometer",
      antalPlaceholder: "Ange antal kilometer",
      step: "0.1",
      visaBelopp: true, // Visar förifyllt värde som användaren kan ändra
    },
  },

  foretagsbilBensinDiesel: {
    label: "Företagsbil, bensin eller diesel",
    enhet: "km",
    beräknaVärde: () => 1.2, // Fast ersättning 1,20 kr per km
    beräknaTotalt: (grundlön, antal) => 1.2 * antal,
    fält: {
      antalLabel: "Kilometer",
      antalPlaceholder: "Ange antal kilometer",
      step: "0.1",
      visaBelopp: true, // Visar förifyllt värde som användaren kan ändra
    },
  },

  foretagsbilEl: {
    label: "Företagsbil, el",
    enhet: "km",
    beräknaVärde: () => 0.95, // Fast ersättning 0,95 kr per km
    beräknaTotalt: (grundlön, antal) => 0.95 * antal,
    fält: {
      antalLabel: "Kilometer",
      antalPlaceholder: "Ange antal kilometer",
      step: "0.1",
      visaBelopp: true, // Visar förifyllt värde som användaren kan ändra
    },
  },

  semestertillagg: {
    label: "Semestertillägg",
    enhet: "dagar",
    beräknaVärde: () => 150.5, // Fast belopp 150,50 kr per dag
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
    beräknaVärde: () => 1, // 1 kr per kr (passthrough)
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
    beräknaVärde: () => 1, // 1 kr per kr (passthrough)
    beräknaTotalt: (grundlön, antal) => antal * 1, // Totalen = summan användaren anger
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
    beräknaVärde: () => 1, // 1 kr per kr (passthrough)
    beräknaTotalt: (grundlön, antal) => antal * 1, // Totalen = summan användaren anger
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
      beloppPlaceholder: "Belopp (använd - för avdrag)", // ← UPPDATERA PLACEHOLDER
      enhetDropdown: ["Timme", "Dag", "St"],
    },
  },

  // jamkning: {
  //   label: "Jämkning",
  //   enhet: "st",
  //   fält: {
  //     antalLabel: "Antal",
  //     antalPlaceholder: "Ange antal",
  //     step: "1",
  //     visaBelopp: true,
  //   },
  // },

  // fritext: {
  //   label: "Fritext",
  //   enhet: "st",
  //   fält: {
  //     antalLabel: "Text",
  //     antalPlaceholder: "Skriv din text här",
  //     step: "1",
  //     visaBelopp: false,
  //     skipKommentar: true,
  //   },
  // },

  // lon: {
  //   label: "Lön",
  //   enhet: "st",
  //   fält: {
  //     antalLabel: "Antal",
  //     antalPlaceholder: "Ange antal",
  //     step: "1",
  //     visaBelopp: true,
  //   },
  // },
};

export type RadKonfigurationType = RadKonfiguration;

// Tom export för att säkerställa att filen behandlas som en modul
export {};
