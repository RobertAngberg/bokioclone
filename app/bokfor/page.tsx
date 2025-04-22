"use client";

import { useState, useEffect } from "react";
import SokForval from "./SokForval";
import Steg2 from "./Steg2";
import Steg3 from "./Steg3";
import Steg4 from "./Steg4";

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

export default function Bokför() {
  const [currentStep, setCurrentStep] = useState<number>(1);
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
    <main className="min-h-screen bg-slate-950 overflow-x-hidden px-4 py-10 text-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="w-full p-8 bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg">
          {currentStep === 1 && (
            <SokForval
              setCurrentStep={setCurrentStep}
              setvaltFörval={setValtFörval}
              setKontonummer={setKontonummer}
              setKontobeskrivning={setKontobeskrivning}
            />
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
      </div>
    </main>
  );
}
