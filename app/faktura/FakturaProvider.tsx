"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface FakturaFormData {
  företagsnamn?: string;
  adress?: string;
  postnummer?: string;
  stad?: string;
  kundnamn?: string;
  kundadress?: string;
  kundpostnummer?: string;
  kundstad?: string;
  fakturanummer?: string;
  fakturadatum?: string;
  forfallodatum?: string;
  betalningsmetod?: string;
  betalningsvillkor?: number;
  artiklar?: Array<{
    beskrivning?: string;
    antal?: string;
    prisPerEnhet?: string;
    moms?: string;
    valuta?: string;
    typ?: string;
  }>;
  logo?: string;
  email?: string;
  logoWidth?: number;
  momsvisning?: string;
  nummer?: string;
}

type ContextType = {
  formData: FakturaFormData;
  setFormData: React.Dispatch<React.SetStateAction<FakturaFormData>>;
};

const FakturaContext = createContext<ContextType | undefined>(undefined);

export const FakturaProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<FakturaFormData>({
    artiklar: [
      {
        beskrivning: "",
        antal: "",
        prisPerEnhet: "",
        valuta: "SEK",
        moms: "25",
        typ: "Varor",
      },
    ],
    fakturadatum: new Date().toISOString().slice(0, 10),
    betalningsmetod: "Bankgiro",
    momsvisning: "Inklusive",
    fakturanummer: "1",
    nummer: "",
  });

  return (
    <FakturaContext.Provider value={{ formData, setFormData }}>{children}</FakturaContext.Provider>
  );
};

export const useFakturaContext = () => {
  const context = useContext(FakturaContext);
  if (!context) {
    throw new Error("useFakturaContext måste användas inom FakturaProvider");
  }
  return context;
};
