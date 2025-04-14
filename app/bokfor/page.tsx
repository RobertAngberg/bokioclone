"use client";

import { useState } from "react";
import SokForval from "./SokForval";
import Steg2 from "./Steg2";
import Steg3 from "./Steg3";
import Steg4 from "./Steg4";
import React from "react";

type KontoRad = {
  beskrivning: string;
  kontonummer?: string;
  debet?: boolean;
  kredit?: boolean;
};

type Extrafält = {
  namn: string;
  label: string;
  konto: string;
  debet: boolean;
  kredit: boolean;
};

type Forval = {
  id: number;
  namn: string;
  beskrivning: string;
  typ: string;
  kategori: string;
  konton: KontoRad[];
  sökord: string[];
  extrafält?: Extrafält[];
};

function Bokför() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [searchText, setSearchText] = useState("");
  const [kontonummer, setKontonummer] = useState<string>("");
  const [kontobeskrivning, setKontobeskrivning] = useState<string>();
  const [fil, setFil] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [belopp, setBelopp] = useState<number | null>(null);
  const [transaktionsdatum, setTransaktionsdatum] = useState<string | null>(null);
  const [kommentar, setKommentar] = useState<string | null>(null);
  const [valtFörval, setValtFörval] = useState<Forval | null>(null);
  const [extrafält, setExtrafält] = useState<
    Record<string, { label: string; debet: number; kredit: number }>
  >({});

  return (
    <main className="min-h-screen bg-slate-950 overflow-x-hidden px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {currentStep === 1 && (
          <div className="w-full p-8 text-gray-100 bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg">
            <SokForval
              setCurrentStep={setCurrentStep}
              setvaltFörval={setValtFörval}
              setKontonummer={setKontonummer}
              setKontobeskrivning={setKontobeskrivning}
            />
            <div className="text-sm text-center pt-14">
              Ofta använda förval kommer att visas här i framtiden som genvägar.
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <Steg2
            setCurrentStep={setCurrentStep}
            fil={fil}
            setFil={setFil}
            pdfUrl={pdfUrl}
            setPdfUrl={setPdfUrl}
            belopp={belopp}
            setBelopp={setBelopp}
            transaktionsdatum={transaktionsdatum}
            setTransaktionsdatum={setTransaktionsdatum}
            kommentar={kommentar}
            setKommentar={setKommentar}
            valtFörval={valtFörval}
            extrafält={extrafält}
            setExtrafält={setExtrafält}
          />
        )}

        {currentStep === 3 && (
          <Steg3
            kontonummer={kontonummer}
            kontobeskrivning={kontobeskrivning ?? ""}
            fil={fil ?? undefined}
            belopp={belopp ?? 0}
            transaktionsdatum={transaktionsdatum ?? ""}
            kommentar={kommentar ?? ""}
            valtFörval={valtFörval}
            setCurrentStep={setCurrentStep}
            extrafält={extrafält}
          />
        )}

        {currentStep === 4 && <Steg4 />}
      </div>
    </main>
  );
}

export default Bokför;
