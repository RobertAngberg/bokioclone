// #region Huvud
"use client";

import { useEffect, useRef, useState } from "react";
import { saveTransaction, getKontoklass } from "./actions";
import KnappFullWidth from "../_components/KnappFullWidth";

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
// #endregion

export default function Steg3({
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

  console.log("Step3 extrafält:", extrafält);
  console.log("valtFörval.specialtyp:", valtFörval?.specialtyp);

  useEffect(() => {
    if (!valtFörval || valtFörval.specialtyp) return;

    getKontoklass(kontonummer).then((res) => {
      const typ = res?.toLowerCase();
      if (typ === "intäkter") setKontoklass("Intäkt");
      else if (typ === "kostnader") setKontoklass("Kostnad");
      else if (typ === "tillgångar") setKontoklass("Tillgång");
      else if (typ === "skulder") setKontoklass("Skuld");
      else console.warn("🤷‍♂️ Okänd kontoklass:", res);
    });
  }, [valtFörval, kontonummer]);

  const momsSats = valtFörval?.momssats ?? 0;
  const moms = +(belopp * (momsSats / (1 + momsSats))).toFixed(2);
  const beloppUtanMoms = +(belopp - moms).toFixed(2);

  const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;
  const formatSEK = (val: number) => val.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

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
      <div className="min-h-screen p-10 text-center text-white bg-red-900">
        <p className="mb-4">⚠️ Saknar valt förval. Gå tillbaka till Steg 1.</p>
        <button onClick={() => setCurrentStep(1)} className="px-4 py-2 bg-white text-black rounded">
          Tillbaka
        </button>
      </div>
    );
  }

  const fallbackRows =
    valtFörval.specialtyp && Object.keys(extrafält).length > 0
      ? Object.entries(extrafält).map(([konto, val], i) => ({
          key: i,
          konto: konto + " " + (val.label ?? ""),
          debet: round(val.debet),
          kredit: round(val.kredit),
        }))
      : valtFörval.konton.map((rad, i) => {
          const kontoNr = rad.kontonummer?.toString().trim();
          const namn = `${kontoNr} ${rad.beskrivning ?? ""}`;
          let beloppAttVisa = 0;

          if (kontoNr?.startsWith("26")) {
            beloppAttVisa = moms;
          } else if (kontoNr === "1930") {
            beloppAttVisa = belopp;
          } else {
            beloppAttVisa = beloppUtanMoms;
          }

          return {
            key: i,
            konto: namn,
            debet: rad.debet ? round(beloppAttVisa) : 0,
            kredit: rad.kredit ? round(beloppAttVisa) : 0,
          };
        });

  const totalDebet = fallbackRows.reduce((sum, r) => sum + r.debet, 0);
  const totalKredit = fallbackRows.reduce((sum, r) => sum + r.kredit, 0);

  return (
    <>
      <h1 className="text-3xl mb-4 text-center">Steg 3: Kontrollera och slutför</h1>
      <p className="text-center font-bold text-xl mb-1">{valtFörval.namn}</p>
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
            {fallbackRows.map((r) => (
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
          <KnappFullWidth text="Bokför" />
        </div>
      </form>
    </>
  );
}
