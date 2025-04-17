"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type FakturaFormData = {
  // Avsändare
  företagsnamn?: string;
  adress?: string;
  postnummer?: string;
  stad?: string;
  organisationsnummer?: string;
  momsregistreringsnummer?: string;
  telefonnummer?: string;
  bankinfo?: string;
  webbplats?: string;
  logo?: string;
  email?: string;

  // Kund
  kundtyp?: string;
  kundnamn?: string;
  kundadress?: string;
  kundpostnummer?: string;
  kundstad?: string;
  kundemail?: string;

  // Artiklar
  artiklar: {
    beskrivning: string;
    antal: string;
    prisPerEnhet: string;
    valuta: string;
    moms: string;
    typ: string;
  }[];

  // Villkor
  fakturadatum: string;
  forfallodatum?: string;
  betalningsvillkor?: string;
  drojsmalsranta?: string;
  leverans?: string;

  // Övrigt
  momsvisning?: string;
  nummer?: string;
  betalningsmetod?: string;
  fakturanummer?: string;
};

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
