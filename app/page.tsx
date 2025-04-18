"use client";

import React, { useEffect, useState } from "react";
import { fetchDataFromYear, fetchFavoritforval } from "./start/actions";
import Card from "./start/Card";
import HomeChart from "./start/HomeChart";
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
      setFavoriter(favs.slice(0, 6));
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
    <main className="min-h-screen bg-slate-950 overflow-x-hidden px-4 py-10 text-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="w-full p-8 bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg">
          {/* <h1 className="mb-8 text-3xl text-center">Översikt</h1> */}
          {currentStep === 1 && (
            <>
              <div className="flex flex-wrap justify-center gap-4 mb-8 text-center">
                <Card title="Intäkter" data={data?.totalInkomst || 0} />
                <Card title="Kostnader" data={data?.totalUtgift || 0} />
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
                <div className="mt-10">
                  <h2 className="text-xl font-semibold mb-8 text-center">
                    ⭐ Dina vanligaste förval
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    {favoriter.map((f) => (
                      <div
                        key={f.id}
                        className="relative rounded-xl p-4 transition-all duration-200 shadow-md cursor-pointer border border-gray-700 bg-slate-900 hover:bg-slate-800"
                        onClick={() => väljFörval(f)}
                      >
                        <div className="text-xl font-semibold text-white mb-2">✓ {f.namn}</div>

                        <pre className="whitespace-pre-wrap text-sm italic text-gray-300 mb-2 font-sans">
                          {f.beskrivning}
                        </pre>

                        <p className="text-sm text-gray-400 mb-4">
                          <strong>Typ:</strong> {f.typ} &nbsp; | &nbsp;
                          <strong>Kategori:</strong> {f.kategori}
                        </p>

                        <table className="w-full border border-gray-700 text-sm text-gray-300">
                          <thead className="bg-slate-800 text-white">
                            <tr>
                              <th className="border border-gray-700 px-2 py-1 text-left">Konto</th>
                              <th className="border border-gray-700 px-2 py-1 text-center">
                                Debet
                              </th>
                              <th className="border border-gray-700 px-2 py-1 text-center">
                                Kredit
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {f.konton.map((konto, i) => (
                              <tr key={i}>
                                <td className="border border-gray-700 px-2 py-1">
                                  {konto.kontonummer} {konto.beskrivning}
                                </td>
                                <td className="border border-gray-700 px-2 py-1 text-center">
                                  {konto.debet === true ? "✓" : (konto.debet ?? "")}
                                </td>
                                <td className="border border-gray-700 px-2 py-1 text-center">
                                  {konto.kredit === true ? "✓" : (konto.kredit ?? "")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {currentStep === 2 && valtFörval && (
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

          {currentStep === 3 && valtFörval && transaktionsdatum && belopp !== null && (
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
          )}

          {currentStep === 4 && <Steg4 />}
        </div>
      </div>
    </main>
  );
}
