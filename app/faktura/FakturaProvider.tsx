"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type FakturaFormData = {
  id?: number;
  fakturanummer: string;
  fakturadatum: string;
  forfallodatum: string;
  betalningsmetod: string;
  betalningsvillkor: string;
  drojsmalsranta: string;
  leverans: string;
  kommentar: string;
  kundId?: string;
  momsvisning?: string;
  nummer?: string;

  kundtyp?: string;
  kundnamn?: string;
  kundnummer?: string;
  kundorganisationsnummer?: string;
  kundvatnummer?: string;
  kundadress?: string;
  kundadress2?: string;
  kundpostnummer?: string;
  kundstad?: string;

  artiklar: {
    beskrivning: string;
    antal: number;
    prisPerEnhet: number;
    moms: number;
    valuta: string;
    typ: "vara" | "tjänst";
  }[];
};

type ContextType = {
  formData: FakturaFormData;
  setFormData: React.Dispatch<React.SetStateAction<FakturaFormData>>;
};

const FakturaContext = createContext<ContextType | undefined>(undefined);

export const FakturaProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<FakturaFormData>({
    fakturanummer: "1",
    fakturadatum: new Date().toISOString().slice(0, 10),
    forfallodatum: new Date().toISOString().slice(0, 10),
    betalningsmetod: "Bankgiro",
    betalningsvillkor: "",
    drojsmalsranta: "",
    leverans: "",
    kommentar: "",
    momsvisning: "Inklusive",
    nummer: "",

    artiklar: [
      {
        beskrivning: "",
        antal: 1,
        prisPerEnhet: 0,
        moms: 25,
        valuta: "SEK",
        typ: "vara",
      },
    ],
  });

  return (
    <FakturaContext.Provider value={{ formData, setFormData }}>{children}</FakturaContext.Provider>
  );
};

export const useFakturaContext = () => {
  const context = useContext(FakturaContext);
  if (!context) throw new Error("useFakturaContext måste användas inom FakturaProvider");
  return context;
};
