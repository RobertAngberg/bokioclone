"use client";

import { useEffect, useRef, useState } from "react";
import { saveTransaction, getKontoklass } from "./actions";
import SubmitButton from "./SpecialFörval/SubmitButton";

type KontoRad = {
  kontonummer?: string;
  beskrivning?: string;
  debet?: boolean;
  kredit?: boolean;
};

type ExtrafältRad = {
  label?: string;
  debet: number;
  kredit: number;
};

type Förval = {
  id: number;
  namn: string;
  beskrivning: string;
  typ: string;
  kategori: string;
  konton: KontoRad[];
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
  valtFörval: Förval | null;
  setCurrentStep: (step: number) => void;
  extrafält: Record<string, ExtrafältRad>;
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
  const [kontoklass, setKontoklass] = useState<"Intäkt" | "Kostnad" | "Tillgång" | "Skuld" | null>(
    null
  );

  console.log("📦 valtFörval i steg3:", valtFörval);
  console.log("🚚 Steg3 extrafält:", extrafält);
  console.log(
    "📦 konton i valtFörval:",
    valtFörval?.konton.map((k) => k.kontonummer)
  );
  useEffect(() => {
    if (valtFörval?.specialtyp && Object.keys(extrafält).length === 0) {
      console.warn("⚠️ Extrafält saknas i Steg3 trots specialförval!", valtFörval);
    }
  }, [valtFörval, extrafält]);

  const momsSats = valtFörval?.momssats ?? 0;
  const moms = +(belopp * momsSats).toFixed(2);
  const beloppUtanMoms = +(belopp - moms).toFixed(2);
  const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;
  const formatSEK = (val: number) => val.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

  useEffect(() => {
    if (!valtFörval || valtFörval.specialtyp) {
      console.log("⏭️ Skippar kontoklass-hämtning för specialtyp:", valtFörval?.specialtyp);
      return;
    }

    getKontoklass(kontonummer).then((res) => {
      const typ = res?.toLowerCase();
      if (typ === "intäkter") setKontoklass("Intäkt");
      else if (typ === "kostnader") setKontoklass("Kostnad");
      else if (typ === "tillgångar") setKontoklass("Tillgång");
      else if (typ === "skulder") setKontoklass("Skuld");
      else console.warn("🤷‍♂️ Okänd kontoklass:", res);
    });
  }, [valtFörval, kontonummer]);

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

  const rows = Object.entries(extrafält)
    .filter(([_, rad]) => (rad.debet ?? 0) !== 0 || (rad.kredit ?? 0) !== 0)
    .map(([konto, rad], i) => ({
      key: i,
      konto: `${konto} ${rad.label ?? ""}`,
      debet: round(rad.debet),
      kredit: round(rad.kredit),
    }));

  const totalDebet = rows.reduce((sum, r) => sum + r.debet, 0);
  const totalKredit = rows.reduce((sum, r) => sum + r.kredit, 0);

  if (rows.length > 0) {
    return (
      <main className="min-h-screen text-white bg-slate-950 px-4">
        <div className="max-w-5xl mx-auto bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg p-10">
          <h1 className="text-3xl mb-4 text-center">Steg 3: Kontrollera och slutför</h1>
          <p className="text-center font-bold text-xl mb-1">{valtFörval.namn}</p>
          <p className="text-center text-gray-300 mb-8">
            {transaktionsdatum ? new Date(transaktionsdatum).toLocaleDateString("sv-SE") : ""}
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
                {rows.map((r) => (
                  <tr key={r.key}>
                    <td className="p-4 border-b border-gray-700">{r.konto}</td>
                    <td className="p-4 text-center border-b border-gray-700">
                      {r.debet > 0 ? formatSEK(r.debet) : ""}
                    </td>
                    <td className="p-4 text-center border-b border-gray-700">
                      {r.kredit > 0 ? formatSEK(r.kredit) : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-cyan-900 text-white">
                  <td className="p-4 text-left">Totalt</td>
                  <td className="p-4 text-center">{formatSEK(totalDebet)}</td>
                  <td className="p-4 text-center">{formatSEK(totalKredit)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-8">
              <SubmitButton />
            </div>
          </form>
        </div>
      </main>
    );
  }

  if (!kontoklass) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white bg-slate-950">
        🔄 Hämtar kontoinformation...
      </main>
    );
  }

  // fallback för icke-specialförval
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
