"use client";

import { useState, useEffect, useRef } from "react";
import { saveTransaction, getKontoklass } from "./actions";
import Importmoms from "./SpecialFörval/Importmoms";
import AmorteringBanklan from "./SpecialFörval/AmorteringBanklan";
import DefaultSteg3 from "./SpecialFörval/DefaultSteg3";
import SubmitButton from "./SpecialFörval/SubmitButton";

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
  const formRef = useRef<HTMLFormElement>(null!);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [kontoklass, setKontoklass] = useState<"Intäkt" | "Kostnad" | null>(null);

  const momsSats = valtFörval?.momssats ?? 0;
  const moms = parseFloat((belopp * momsSats).toFixed(2));
  const beloppUtanMoms = parseFloat((belopp - moms).toFixed(2));
  const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;
  const formatSEK = (val: number) => val.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

  useEffect(() => {
    if (!valtFörval) return;

    if (valtFörval.specialtyp === "Importmoms") {
      let totalDebet = 0;
      let totalKredit = 0;

      for (const data of Object.values(extrafält)) {
        totalDebet += parseFloat(data.debet || "0");
        totalKredit += parseFloat(data.kredit || "0");
      }

      totalDebet = round(totalDebet);
      totalKredit = round(totalKredit);

      const messages: string[] = [];
      if (Math.abs(totalDebet - totalKredit) > 0.01) {
        messages.push("⚠️ Debet och Kredit matchar inte. Något är fel i dina fält.");
      }

      setValidationMessages(messages);
    } else {
      getKontoklass(kontonummer).then((typ) => {
        const lower = typ?.toLowerCase();
        if (lower === "intäkter") setKontoklass("Intäkt");
        else if (lower === "kostnader") setKontoklass("Kostnad");
      });
    }
  }, [valtFörval, extrafält, kontonummer]);

  const handleSubmit = async (formData: FormData) => {
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

  // SPECIALFÖRVAL: Importmoms
  if (valtFörval.specialtyp === "Importmoms") {
    return (
      <Importmoms
        mode="steg3"
        formRef={formRef}
        handleSubmit={handleSubmit}
        extrafält={extrafält}
        belopp={belopp}
        validationMessages={validationMessages}
      />
    );
  }

  // SPECIALFÖRVAL: Amortering
  if (valtFörval.specialtyp === "AmorteringBanklån") {
    return (
      <AmorteringBanklan
        mode="steg3"
        formRef={formRef}
        handleSubmit={handleSubmit}
        extrafält={extrafält}
      />
    );
  }

  // SPECIALFÖRVAL: Default (t.ex. Tjänst utanför EU)
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

  // VANLIGT FÖRVAL
  if (!kontoklass) {
    return (
      <main className="items-center min-h-screen text-center text-white bg-slate-950">
        <p className="p-10">🔄 Hämtar kontoinformation...</p>
      </main>
    );
  }

  return (
    <main className="items-center min-h-screen text-center text-white bg-slate-950">
      <div className="w-full p-10 text-white md:mx-auto md:w-2/5 bg-cyan-950 rounded-3xl">
        <h1 className="text-3xl font-bold mb-4">Steg 3: Kontrollera och slutför</h1>
        <p className="w-full font-bold">{kontobeskrivning}</p>
        <p className="w-full mb-6">
          {transaktionsdatum ? new Date(transaktionsdatum).toLocaleDateString("sv-SE") : ""}
        </p>

        <form ref={formRef} action={handleSubmit}>
          <table className="w-full mb-8 text-left border border-gray-300">
            <thead>
              <tr>
                <th className="p-4 border-b">Konto</th>
                <th className="p-4 border-b">Debet</th>
                <th className="p-4 border-b">Kredit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4">1930 Företagskonto / affärskonto</td>
                <td className="p-4">{kontoklass === "Intäkt" ? formatSEK(belopp) : ""}</td>
                <td className="p-4">{kontoklass === "Kostnad" ? formatSEK(belopp) : ""}</td>
              </tr>
              {moms > 0 && (
                <tr>
                  <td className="p-4">
                    {kontoklass === "Kostnad" ? "2640 Ingående moms" : "2610 Utgående moms"}
                  </td>
                  <td className="p-4">{kontoklass === "Kostnad" ? formatSEK(moms) : ""}</td>
                  <td className="p-4">{kontoklass === "Intäkt" ? formatSEK(moms) : ""}</td>
                </tr>
              )}
              <tr>
                <td className="p-4">
                  {kontonummer} {kontobeskrivning}
                </td>
                <td className="p-4">{kontoklass === "Kostnad" ? formatSEK(beloppUtanMoms) : ""}</td>
                <td className="p-4">{kontoklass === "Intäkt" ? formatSEK(beloppUtanMoms) : ""}</td>
              </tr>
            </tbody>
          </table>
          <SubmitButton />
        </form>
      </div>
    </main>
  );
}
