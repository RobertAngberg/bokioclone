"use client";

import React, { useEffect, useState } from "react";
import { fetchDataFromYear, fetchFavoritforval } from "./start/actions";
import { Card } from "./start/Card";
import { HomeChart } from "./start/HomeChart";
import Steg2 from "./bokfor/Steg2";
import Steg3 from "./bokfor/Steg3";
import Steg4 from "./bokfor/Steg4";

type YearSummary = {
  totalInkomst: number;
  totalUtgift: number;
  totalResultat: number;
  yearData: YearDataPoint[];
};

type YearDataPoint = {
  month: string;
  inkomst: number;
  utgift: number;
};

type KontoRad = {
  beskrivning: string;
  kontonummer?: string;
  debet?: boolean;
  kredit?: boolean;
};

type Förval = {
  id: number;
  namn: string;
  beskrivning: string;
  typ: string;
  kategori: string;
  konton: KontoRad[];
  sökord: string[];
  specialtyp?: string | null;
};

export default function Home() {
  const [year, setYear] = useState("2025");
  const [data, setData] = useState<YearSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriter, setFavoriter] = useState<Förval[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const [fil, setFil] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [belopp, setBelopp] = useState<number | null>(null);
  const [transaktionsdatum, setTransaktionsdatum] = useState<string | null>(null);
  const [kommentar, setKommentar] = useState<string | null>(null);
  const [valtFörval, setValtFörval] = useState<Förval | null>(null);
  const [kontonummer, setKontonummer] = useState<string>("");
  const [kontobeskrivning, setKontobeskrivning] = useState<string>("");
  const [extrafält, setExtrafält] = useState<
    Record<string, { label: string; debet: number; kredit: number }>
  >({});

  useEffect(() => {
    setIsLoading(true);
    fetchDataFromYear(year)
      .then((data) => setData(data))
      .finally(() => setIsLoading(false));
  }, [year]);

  useEffect(() => {
    const hämtaFavoriter = async () => {
      const favs = await fetchFavoritforval();
      setFavoriter(favs.slice(0, 10));
    };
    hämtaFavoriter();
  }, []);

  const väljFörval = (f: Förval) => {
    setValtFörval(f);

    const huvudkonto = f.konton.find(
      (k) => k.kontonummer !== "1930" && (k.kredit || k.debet) && !!k.kontonummer
    );

    if (huvudkonto) {
      setKontonummer(huvudkonto.kontonummer ?? "");
      setKontobeskrivning(huvudkonto.beskrivning ?? "");
    } else {
      console.warn("⚠️ Hittade inget huvudkonto i förval:", f);
    }

    setCurrentStep(2);
  };

  return (
    <main className="items-center text-center bg-slate-950 text-white min-h-screen">
      {currentStep === 1 && (
        <>
          <div className="flex flex-col justify-center p-10 md:flex-row md:justify-center md:space-x-2 mb-5">
            <Card title="Inkomster" data={data?.totalInkomst || 0} />
            <Card title="Utgifter" data={data?.totalUtgift || 0} />
            <Card title="Resultat" data={data?.totalResultat || 0} />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="border-t-4 border-cyan-600 border-solid rounded-full w-16 h-16 animate-spin"></div>
            </div>
          ) : (
            <HomeChart year={year} onYearChange={setYear} chartData={data?.yearData || []} />
          )}

          {favoriter.length > 0 && (
            <div className="max-w-5xl mx-auto px-4 mt-6 mb-8 text-left">
              <h2 className="text-xl font-semibold text-cyan-300 mb-4">
                ⭐ Dina vanligaste förval
              </h2>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {favoriter.map((f) => (
                  <div
                    key={f.id}
                    className="bg-slate-900 border border-gray-700 rounded-lg p-4 shadow hover:bg-slate-800 cursor-pointer"
                    onClick={() => väljFörval(f)}
                  >
                    <div className="text-white font-bold mb-1">{f.namn}</div>
                    <div className="text-sm text-gray-400 mb-1">
                      {f.typ} • {f.kategori}
                    </div>
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap italic">
                      {f.beskrivning}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {currentStep === 2 && valtFörval && (
        <div className="max-w-5xl mx-auto px-4 py-6">
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
        </div>
      )}

      {currentStep === 3 && valtFörval && transaktionsdatum && belopp !== null && (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Steg3
            kontonummer={kontonummer}
            kontobeskrivning={kontobeskrivning}
            fil={fil}
            belopp={belopp}
            transaktionsdatum={transaktionsdatum}
            kommentar={kommentar ?? ""}
            valtFörval={valtFörval}
            setCurrentStep={setCurrentStep}
            extrafält={extrafält}
          />
        </div>
      )}

      {currentStep === 4 && (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Steg4 />
        </div>
      )}
    </main>
  );
}
