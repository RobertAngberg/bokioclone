"use client";

import LaddaUppFil from "./LaddaUppFil";
import Information from "./Information";
import Kommentar from "./Kommentar";
import Forhandsgranskning from "./Forhandsgranskning";
import Importmoms from "./SpecialFörval/Importmoms";
import AmorteringBanklan from "./SpecialFörval/AmorteringBanklan";
import CustomSteg3 from "./SpecialFörval/CustomSteg3";

// #region Types
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

type Step2Props = {
  setCurrentStep: (step: number) => void;
  fil: File | null;
  setFil: (file: File | null) => void;
  pdfUrl: string | null;
  setPdfUrl: (url: string | null) => void;
  belopp: number | null;
  setBelopp: (amount: number | null) => void;
  transaktionsdatum: string | null;
  setTransaktionsdatum: (date: string | null) => void;
  kommentar: string | null;
  setKommentar: (comment: string | null) => void;
  valtFörval: Förval | null;
  extrafält: Record<string, { label: string; debet: number; kredit: number }>;
  setExtrafält: (fält: Record<string, { label: string; debet: number; kredit: number }>) => void;
};

type Steg2SpecialProps = {
  mode: "steg2";
  belopp: number | null;
  setBelopp: (amount: number | null) => void;
  transaktionsdatum: string | null;
  setTransaktionsdatum: (date: string | null) => void;
  kommentar: string | null;
  setKommentar: (comment: string | null) => void;
  setCurrentStep: (step: number) => void;
  fil: File | null;
  setFil: (file: File | null) => void;
  pdfUrl: string | null;
  setPdfUrl: (url: string | null) => void;
  extrafält: Record<string, { label: string; debet: number; kredit: number }>;
  setExtrafält: (fält: Record<string, { label: string; debet: number; kredit: number }>) => void;
};
// #endregion

export default function Steg2({
  setCurrentStep,
  fil,
  setFil,
  pdfUrl,
  setPdfUrl,
  belopp,
  setBelopp,
  transaktionsdatum,
  setTransaktionsdatum,
  kommentar,
  setKommentar,
  valtFörval,
  extrafält,
  setExtrafält,
}: Step2Props) {
  const handleSubmit = () => {
    setCurrentStep(3);
  };

  const renderSpecialförval = () => {
    if (!valtFörval?.specialtyp) return null;

    const specialProps: Steg2SpecialProps = {
      mode: "steg2",
      belopp,
      setBelopp,
      transaktionsdatum,
      setTransaktionsdatum,
      kommentar,
      setKommentar,
      setCurrentStep,
      fil,
      setFil,
      pdfUrl,
      setPdfUrl,
      extrafält,
      setExtrafält,
    };

    switch (valtFörval.specialtyp) {
      case "Importmoms":
        return <Importmoms {...specialProps} />;
      case "AmorteringBanklån":
        return <AmorteringBanklan {...specialProps} />;
      default:
        return <CustomSteg3 {...specialProps} specialtyp={valtFörval.specialtyp} />;
    }
  };

  return (
    <div className="p-6 bg-cyan-950 text-white border border-cyan-800 rounded-2xl shadow-lg">
      <h1 className="mb-6 text-3xl text-center text-white">Steg 2: Fyll i uppgifter</h1>

      {valtFörval?.specialtyp ? (
        renderSpecialförval()
      ) : (
        <div className="flex flex-col-reverse justify-between h-auto max-w-5xl px-4 mx-auto md:flex-row">
          <div className="w-full mb-10 md:w-[40%] md:mb-0 bg-slate-900 border border-gray-700 rounded-xl p-6 text-white">
            <LaddaUppFil
              fil={fil}
              setFil={setFil}
              setPdfUrl={setPdfUrl}
              setBelopp={setBelopp}
              setTransaktionsdatum={setTransaktionsdatum}
            />

            <Information
              belopp={belopp ?? 0}
              setBelopp={setBelopp}
              transaktionsdatum={transaktionsdatum}
              setTransaktionsdatum={setTransaktionsdatum}
            />

            <Kommentar kommentar={kommentar ?? ""} setKommentar={setKommentar} />

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full flex items-center justify-center px-4 py-4 font-bold text-white rounded cursor-pointer bg-cyan-600 hover:bg-cyan-700"
            >
              Bokför
            </button>
          </div>

          <Forhandsgranskning fil={fil} pdfUrl={pdfUrl} />
        </div>
      )}
    </div>
  );
}
