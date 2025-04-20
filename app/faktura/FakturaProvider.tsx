"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type Artikel = {
  beskrivning: string;
  antal: number;
  prisPerEnhet: number;
  moms: number;
  valuta: string;
  typ: "vara" | "tjänst";
};

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
  momsvisning: string;
  kundmomsnummer?: string;
  nummer: string;
  artiklar: Artikel[];

  // Kund
  kundId: string;
  kundtyp: string;
  kundnamn: string;
  kundnummer: string;
  kundorganisationsnummer: string;
  kundvatnummer: string;
  kundadress: string;
  kundadress2: string;
  kundpostnummer: string;
  kundstad: string;
  kundemail: string;

  // Avsändare / Företag
  företagsnamn: string;
  email: string;
  adress: string;
  postnummer: string;
  stad: string;
  organisationsnummer: string;
  momsregistreringsnummer: string;
  telefonnummer: string;
  bankinfo: string;
  webbplats: string;
  logo: string;
};

const defaultFormData: FakturaFormData = {
  id: undefined,
  fakturanummer: "",
  fakturadatum: "",
  forfallodatum: "",
  betalningsmetod: "",
  betalningsvillkor: "",
  drojsmalsranta: "",
  leverans: "",
  kommentar: "",
  momsvisning: "",
  nummer: "",
  artiklar: [],

  kundId: "",
  kundtyp: "",
  kundnamn: "",
  kundnummer: "",
  kundorganisationsnummer: "",
  kundvatnummer: "",
  kundadress: "",
  kundadress2: "",
  kundpostnummer: "",
  kundstad: "",
  kundemail: "",

  företagsnamn: "",
  email: "",
  adress: "",
  postnummer: "",
  stad: "",
  organisationsnummer: "",
  momsregistreringsnummer: "",
  telefonnummer: "",
  bankinfo: "",
  webbplats: "",
  logo: "",
};

const FakturaContext = createContext<{
  formData: FakturaFormData;
  setFormData: React.Dispatch<React.SetStateAction<FakturaFormData>>;
}>({
  formData: defaultFormData,
  setFormData: () => {},
});

export function FakturaProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FakturaFormData>(defaultFormData);

  return (
    <FakturaContext.Provider value={{ formData, setFormData }}>{children}</FakturaContext.Provider>
  );
}

export function useFakturaContext() {
  return useContext(FakturaContext);
}
