// app/faktura/FakturaProvider.tsx
"use client";

import { createContext, useContext, useState } from "react";

export type FakturaFormData = {
  företagsnamn: string;
  adress: string;
  postnummer: string;
  stad: string;
  email: string;
  kundtyp: string;
  kundnamn: string;
  kundadress: string;
  kundpostnummer: string;
  kundstad: string;
  kundemail: string;
  fakturadatum: string;
  forfallodatum: string;
  fakturanummer: string;
  betalningsmetod: string;
  betalningsinfo: string;
  visaMoms: "Inklusive" | "Exklusive";
  artiklar: {
    beskrivning: string;
    antal: string;
    prisPerEnhet: string;
    moms: string;
    valuta: string;
    typ: string;
  }[];
  betalningsvillkor: string;
  drojsmalsranta: string;
  leverans: string;
};

const defaultFormData: FakturaFormData = {
  företagsnamn: "",
  adress: "",
  postnummer: "",
  stad: "",
  email: "",
  kundtyp: "Företag",
  kundnamn: "",
  kundadress: "",
  kundpostnummer: "",
  kundstad: "",
  kundemail: "",
  fakturadatum: new Date().toISOString().slice(0, 10),
  forfallodatum: "",
  fakturanummer: "1",
  betalningsmetod: "Bankgiro",
  betalningsinfo: "",
  visaMoms: "Inklusive",
  artiklar: [],
  betalningsvillkor: "30",
  drojsmalsranta: "12%",
  leverans: "Fritt vårt lager",
};

const FakturaContext = createContext<{
  formData: FakturaFormData;
  setFormData: React.Dispatch<React.SetStateAction<FakturaFormData>>;
} | null>(null);

export function FakturaProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<FakturaFormData>(defaultFormData);

  return (
    <FakturaContext.Provider value={{ formData, setFormData }}>{children}</FakturaContext.Provider>
  );
}

export function useFakturaContext() {
  const context = useContext(FakturaContext);
  if (!context) throw new Error("useFakturaContext måste användas inom FakturaProvider");
  return context;
}
