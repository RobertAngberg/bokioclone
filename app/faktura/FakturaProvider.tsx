"use client";

import React, { createContext, useContext, useState } from "react";

export type FakturaFormData = {
  id: string;
  fakturanummer: string;
  fakturadatum: string;
  forfallodatum: string;
  betalningsmetod: string;
  betalningsvillkor: string;
  drojsmalsranta: string;
  kundId: string;
  nummer: string;

  // Kunduppgifter
  kundnamn: string;
  kundnummer: string;
  kundorganisationsnummer: string;
  kundmomsnummer: string;
  kundadress: string;
  kundpostnummer: string;
  kundstad: string;
  kundemail: string;

  // Avsändare
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
  logoWidth?: number; // 🔧 Nytt fält för logotypstorlek

  artiklar: Array<{
    beskrivning: string;
    antal: number;
    prisPerEnhet: number;
    moms: number;
    valuta: string;
    typ: "tjänst" | "vara";
  }>;
};

type KundStatus = "none" | "loaded" | "editing";

interface FakturaContextType {
  formData: FakturaFormData;
  setFormData: React.Dispatch<React.SetStateAction<FakturaFormData>>;
  kundStatus: KundStatus;
  setKundStatus: React.Dispatch<React.SetStateAction<KundStatus>>;
  resetKund: () => void;
}

const FakturaContext = createContext<FakturaContextType | undefined>(undefined);

export function FakturaProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<FakturaFormData>({
    id: "",
    fakturanummer: "",
    fakturadatum: "",
    forfallodatum: "",
    betalningsmetod: "",
    betalningsvillkor: "",
    drojsmalsranta: "",
    kundId: "",
    nummer: "",
    kundnamn: "",
    kundnummer: "",
    kundorganisationsnummer: "",
    kundmomsnummer: "",
    kundadress: "",
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
    logoWidth: 200, // ✅ Defaultstorlek för logotypen
    artiklar: [],
  });

  const [kundStatus, setKundStatus] = useState<KundStatus>("none");

  const resetKund = () => {
    setFormData((prev) => ({
      ...prev,
      kundId: "",
      kundnamn: "",
      kundnummer: "",
      kundorganisationsnummer: "",
      kundmomsnummer: "",
      kundadress: "",
      kundpostnummer: "",
      kundstad: "",
      kundemail: "",
    }));
    setKundStatus("editing");
  };

  return (
    <FakturaContext.Provider
      value={{ formData, setFormData, kundStatus, setKundStatus, resetKund }}
    >
      {children}
    </FakturaContext.Provider>
  );
}

export function useFakturaContext() {
  const ctx = useContext(FakturaContext);
  if (!ctx) throw new Error("useFakturaContext måste användas inom FakturaProvider");
  return ctx;
}
