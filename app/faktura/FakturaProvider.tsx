//#region Huvud
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { hämtaNästaFakturanummer } from "./actions";

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
  personnummer?: string;
  fastighetsbeteckning?: string;
  rotBoendeTyp?: "fastighet" | "brf";
  brfOrganisationsnummer?: string;
  brfLagenhetsnummer?: string;

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
  adress: string;
  postnummer: string;
  stad: string;
  organisationsnummer: string;
  momsregistreringsnummer: string;
  telefonnummer: string;
  bankinfo: string;
  epost: string;
  webbplats: string;
  logo: string;
  logoWidth?: number;

  rotRutAktiverat?: boolean;
  rotRutTyp?: "ROT" | "RUT";
  rotRutKategori?: string;
  avdragProcent?: number;
  avdragBelopp?: number;
  arbetskostnadExMoms?: number | string;
  materialkostnadExMoms?: number | string;

  artiklar: Array<{
    beskrivning: string;
    antal: number;
    prisPerEnhet: number;
    moms: number;
    valuta: string;
    typ: "tjänst" | "vara";
  }>;
};

export type ArtikelInput = {
  beskrivning: string;
  antal: string;
  prisPerEnhet: string;
  moms: string;
  valuta: string;
  typ: "vara" | "tjänst";
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
//#endregion

export function FakturaProvider({ children }: { children: React.ReactNode }) {
  //#region State
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
    epost: "",
    adress: "",
    postnummer: "",
    stad: "",
    organisationsnummer: "",
    momsregistreringsnummer: "",
    telefonnummer: "",
    bankinfo: "",
    webbplats: "",
    logo: "",
    logoWidth: 200,
    artiklar: [],
  });

  const [kundStatus, setKundStatus] = useState<KundStatus>("none");
  //#endregion

  //#region Nästa fakturanummer
  // Hämta nästa fakturanummer när det är en ny faktura (dvs ingen id och inget fakturanummer)
  useEffect(() => {
    if (!formData.id && !formData.fakturanummer) {
      hämtaNästaFakturanummer().then((nummer) => {
        setFormData((prev) => ({
          ...prev,
          fakturanummer: nummer.toString(),
        }));
      });
    }
  }, [formData.id, formData.fakturanummer]);
  //#endregion

  function resetKund() {
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
  }

  return (
    // Provider = "Sändaren" som distribuerar data till alla child components
    <FakturaContext.Provider
      value={{
        // Huvuddata: All faktura-information (kund, artiklar, företag, etc.)
        formData,
        // Funktion: Uppdatera faktura-data från vilken komponent som helst
        setFormData,

        // UI State: Håller koll på om kund är loaded/editing/none
        kundStatus,
        // Funktion: Ändra kund-status (används i KundUppgifter komponenten)
        setKundStatus,

        // Utility: Nollställ alla kunduppgifter (används när man vill byta kund)
        resetKund,
      }}
    >
      {/* Alla child components som renderas inuti FakturaProvider */}
      {/* Dessa kan använda useFakturaContext() för att komma åt data ovan */}
      {children}
    </FakturaContext.Provider>
  );
}

// Hook = "Mottagaren" - används i components för att få tillgång till data
export function useFakturaContext() {
  // Hämta context-värdet (det som skickades i value={{}} ovan)
  const ctx = useContext(FakturaContext);

  // Säkerhetskontroll: Om någon använder hooken utanför Provider = fel
  if (!ctx) throw new Error("useFakturaContext måste användas inom FakturaProvider");

  // Returnera all data: formData, setFormData, kundStatus, setKundStatus, resetKund
  return ctx;
}
