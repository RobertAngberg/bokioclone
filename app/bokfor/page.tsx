"use client";

import { useState } from "react";
import { AccountSearch } from "./AccountSearch";
import { Step2 } from "./Step2";
import { Step3 } from "./Step3";
import { Step4 } from "./Step4";

function Bokför() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [searchText, setSearchText] = useState("");
  const [kontonummer, setKontonummer] = useState<string>("");
  const [kontobeskrivning, setKontobeskrivning] = useState<string>();
  const [kontotyp, setKontotyp] = useState<"Intäkt" | "Kostnad">();
  const [fil, setFil] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [belopp, setBelopp] = useState<number | null>(null);
  const [transaktionsdatum, setTransaktionsdatum] = useState<string | null>(null);
  const [kommentar, setKommentar] = useState<string | null>(null);

  return (
    <main className="items-center min-h-screen px-6 pt-10 text-center bg-slate-950">
      {currentStep === 1 && (
        <div className="w-full p-10 text-white md:mx-auto md:w-2/5 bg-cyan-950 rounded-3xl">
          <AccountSearch
            searchText={searchText}
            setSearchText={setSearchText}
            setKontonummer={setKontonummer}
            setKontobeskrivning={setKontobeskrivning}
            setCurrentStep={setCurrentStep}
          />
        </div>
      )}

      {currentStep === 2 && (
        <Step2
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
        />
      )}

      {currentStep === 3 && (
        <Step3
          kontonummer={kontonummer}
          kontobeskrivning={kontobeskrivning || ""}
          kontotyp={kontotyp ?? "Intäkt"}
          fil={fil || undefined}
          belopp={belopp ?? 0}
          transaktionsdatum={transaktionsdatum || ""}
          kommentar={kommentar || ""}
          setCurrentStep={setCurrentStep}
        />
      )}

      {currentStep === 4 && <Step4 />}
    </main>
  );
}

export default Bokför;
