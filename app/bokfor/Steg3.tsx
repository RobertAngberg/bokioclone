"use client";

import { useEffect, useRef, useState } from "react";
import { saveTransaction, getKontoklass } from "./actions";
import SubmitButton from "./SpecialFörval/SubmitButton";
import Importmoms from "./SpecialFörval/Importmoms";
import AmorteringBanklan from "./SpecialFörval/AmorteringBanklan";
import DefaultSteg3 from "./SpecialFörval/DefaultSteg3";

type Forval = {
  id: number;
  namn: string;
  beskrivning: string;
  typ: string;
  kategori: string;
  konton: any[];
  momssats?: number;
  specialtyp?: string | null;
};

interface Step3Props {
  kontonummer: string;
  kontobeskrivning: string;
  fil?: File | null;
  belopp: number;
  transaktionsdatum: string;
  kommentar: string;
  valtFörval: Forval | null;
  setCurrentStep: (step: number) => void;
  extrafält: Record<string, any>;
}

export default function Step3({
  kontonummer,
  kontobeskrivning,
  fil,
  belopp,
  transaktionsdatum,
  kommentar,
  valtFörval,
  setCurrentStep,
  extrafält,
}: Step3Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [kontoklass, setKontoklass] = useState<"Intäkt" | "Kostnad" | null>(null);

  const momsSats = valtFörval?.momssats ?? 0;
  const moms = +(belopp * momsSats).toFixed(2);
  const beloppUtanMoms = +(belopp - moms).toFixed(2);

  const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;
  const formatSEK = (val: number) => val.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

  useEffect(() => {
    if (!valtFörval) return;

    if (valtFörval.specialtyp === "Importmoms") {
      let totalDebet = 0;
      let totalKredit = 0;

      for (const rad of Object.values(extrafält)) {
        totalDebet += +rad.debet || 0;
        totalKredit += +rad.kredit || 0;
      }

      totalDebet = round(totalDebet);
      totalKredit = round(totalKredit);

      if (Math.abs(totalDebet - totalKredit) > 0.01) {
        setValidationMessages(["⚠️ Debet och Kredit matchar inte. Något är fel i dina fält."]);
      } else {
        setValidationMessages([]);
      }
    } else {
      getKontoklass(kontonummer).then((res) => {
        const typ = res?.toLowerCase();
        if (typ === "intäkter") setKontoklass("Intäkt");
        else if (typ === "kostnader") setKontoklass("Kostnad");
      });
    }
  }, [valtFörval, extrafält, kontonummer]);

  const handleSubmit = async (formData: FormData) => {
    if (!valtFörval) return;

    if (fil) formData.set("fil", fil);
    formData.set("valtFörval", JSON.stringify(valtFörval));
    formData.set("extrafält", JSON.stringify(extrafält));
    formData.set("transaktionsdatum", transaktionsdatum);
    formData.set("kommentar", kommentar);
    formData.set("kontonummer", kontonummer);
    formData.set("kontobeskrivning", kontobeskrivning);
    formData.set("belopp", belopp.toString());
    formData.set("moms", moms.toString());
    formData.set("beloppUtanMoms", beloppUtanMoms.toString());

    const result = await saveTransaction(formData);
    if (result.success) setCurrentStep(4);
  };

  if (!valtFörval) {
    return (
      <main className="min-h-screen p-10 text-center text-white bg-red-900">
        <p className="mb-4">⚠️ Saknar valt förval. Gå tillbaka till Steg 1.</p>
        <button onClick={() => setCurrentStep(1)} className="px-4 py-2 bg-white text-black rounded">
          Tillbaka
        </button>
      </main>
    );
  }

  if (valtFörval.specialtyp === "Importmoms") {
    return (
      <Importmoms
        mode="steg3"
        extrafält={extrafält}
        formRef={formRef}
        handleSubmit={handleSubmit}
        belopp={belopp}
        validationMessages={validationMessages}
      />
    );
  }

  if (valtFörval.specialtyp === "AmorteringBanklån") {
    return (
      <AmorteringBanklan
        mode="steg3"
        extrafält={extrafält}
        formRef={formRef}
        handleSubmit={handleSubmit}
      />
    );
  }

  if (valtFörval.specialtyp) {
    return (
      <DefaultSteg3
        formRef={formRef}
        handleSubmit={handleSubmit}
        extrafält={extrafält}
        specialtyp={valtFörval.specialtyp}
        belopp={belopp}
      />
    );
  }

  if (!kontoklass) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white bg-slate-950">
        🔄 Hämtar kontoinformation...
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white bg-slate-950 px-4">
      <div className="max-w-5xl mx-auto bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg p-10">
        <h1 className="text-3xl mb-4 text-center">Steg 3: Kontrollera och slutför</h1>
        <p className="text-center font-bold text-xl mb-1">{kontobeskrivning}</p>
        <p className="text-center text-gray-300 mb-8">
          {new Date(transaktionsdatum).toLocaleDateString("sv-SE")}
        </p>

        <form ref={formRef} action={handleSubmit}>
          <table className="w-full text-left border border-gray-700 text-sm md:text-base bg-slate-900 rounded-xl overflow-hidden">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-4 border-b border-gray-700">Konto</th>
                <th className="p-4 border-b border-gray-700 text-center">Debet</th>
                <th className="p-4 border-b border-gray-700 text-center">Kredit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 border-b border-gray-700">1930 Företagskonto / affärskonto</td>
                <td className="p-4 text-center border-b border-gray-700">
                  {kontoklass === "Intäkt" ? formatSEK(belopp) : ""}
                </td>
                <td className="p-4 text-center border-b border-gray-700">
                  {kontoklass === "Kostnad" ? formatSEK(belopp) : ""}
                </td>
              </tr>
              {momsSats > 0 && (
                <tr>
                  <td className="p-4 border-b border-gray-700">
                    {kontoklass === "Kostnad" ? "2640 Ingående moms" : "2610 Utgående moms"}
                  </td>
                  <td className="p-4 text-center border-b border-gray-700">
                    {kontoklass === "Kostnad" ? formatSEK(moms) : ""}
                  </td>
                  <td className="p-4 text-center border-b border-gray-700">
                    {kontoklass === "Intäkt" ? formatSEK(moms) : ""}
                  </td>
                </tr>
              )}
              <tr>
                <td className="p-4">
                  {kontonummer} {kontobeskrivning}
                </td>
                <td className="p-4 text-center">
                  {kontoklass === "Kostnad" ? formatSEK(beloppUtanMoms) : ""}
                </td>
                <td className="p-4 text-center">
                  {kontoklass === "Intäkt" ? formatSEK(beloppUtanMoms) : ""}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-8">
            <SubmitButton />
          </div>
        </form>
      </div>
    </main>
  );
}
