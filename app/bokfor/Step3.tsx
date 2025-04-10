"use client";

import { useRef, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveTransaction } from "./actions";

type KontoRad = {
  kontonummer?: string;
  beskrivning: string;
  debet?: boolean;
  kredit?: boolean;
  andelAv?: "moms" | "utanMoms" | "hela";
};

type ExtrafältRad = {
  namn: string;
  värde: string;
  konto: string;
  beskrivning: string;
  debet: boolean;
  kredit: boolean;
  label: string;
};

type Forval = {
  id: number;
  namn: string;
  beskrivning: string;
  typ: string;
  kategori: string;
  konton: KontoRad[];
  sökord?: string[];
  extrafält?: ExtrafältRad[];
  momssats?: number;
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

function formatSEK(amount: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 2,
  }).format(amount);
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex items-center justify-center w-full px-4 py-6 font-bold text-white rounded ${
        pending ? "bg-gray-400 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700"
      }`}
    >
      {pending ? "Bokför..." : "Bokför"}
    </button>
  );
}

export function Step3({
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
  const momssats = valtFörval?.momssats ?? 0.25;
  const moms = belopp * momssats;
  const beloppUtanMoms = belopp - moms;

  useEffect(() => {
    if (!valtFörval) return;

    let totalDebet = 0;
    let totalKredit = 0;
    const messages: string[] = [];

    for (const konto of valtFörval.konton) {
      const debet = konto.debet ? calculateBelopp(konto, "debet") : 0;
      const kredit = konto.kredit ? calculateBelopp(konto, "kredit") : 0;
      totalDebet += debet;
      totalKredit += kredit;
    }

    if (valtFörval.extrafält) {
      for (const extra of valtFörval.extrafält) {
        const belopp = parseFloat(extra.värde ?? "0");
        if (extra.debet) totalDebet += belopp;
        if (extra.kredit) totalKredit += belopp;
      }
    }

    if (Math.abs(totalDebet - totalKredit) > 0.01) {
      messages.unshift("⚠️ Debet och Kredit matchar inte. Något är fel med Förvalet.");
    }

    setValidationMessages(messages);
  }, [valtFörval]);

  console.log("🔍 Extrafält i tabellrendering:", extrafält);

  const calculateBelopp = (konto: KontoRad, typ: "debet" | "kredit") => {
    const nr = konto.kontonummer || "";
    const andel = konto.andelAv;
    if (andel === "moms") return moms;
    if (andel === "utanMoms") return beloppUtanMoms;
    if (andel === "hela") return belopp;
    return 0;
  };

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
    if (result.success) {
      setCurrentStep(4);
    } else {
      console.error("❌ Error saving transaction:", result.error);
    }
  };

  if (!valtFörval) return null;

  const totalDebet =
    valtFörval.konton.reduce((sum, k) => {
      return sum + (k.debet ? calculateBelopp(k, "debet") : 0);
    }, 0) +
    (valtFörval.extrafält?.reduce(
      (sum, e) => sum + (e.debet ? parseFloat(e.värde ?? "0") : 0),
      0
    ) || 0);

  const totalKredit =
    valtFörval.konton.reduce((sum, k) => {
      return sum + (k.kredit ? calculateBelopp(k, "kredit") : 0);
    }, 0) +
    (valtFörval.extrafält?.reduce(
      (sum, e) => sum + (e.kredit ? parseFloat(e.värde ?? "0") : 0),
      0
    ) || 0);

  return (
    <main className="items-center min-h-screen text-center text-white bg-slate-950">
      <div className="w-full p-10 text-white md:mx-auto md:w-2/5 bg-cyan-950 rounded-3xl">
        <h1 className="text-3xl font-bold mb-4">Steg 3: Kontrollera och slutför</h1>

        {validationMessages.length > 0 && (
          <div className="mb-6 p-4 bg-red-200 text-red-800 rounded text-left">
            <strong>⚠️ Kontrollera:</strong>
            <ul className="list-disc ml-6 mt-2">
              {validationMessages.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

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
              {Object.entries(extrafält).map(([key, val]: any) => {
                if (!val?.konto || !val?.värde || parseFloat(val.värde) === 0) return null;
                return (
                  <tr key={key}>
                    <td className="p-4">
                      {val.konto} {val.beskrivning}
                    </td>
                    <td className="p-4">
                      {val.debet ? `${parseFloat(val.värde).toFixed(2)} kr` : "0,00 kr"}
                    </td>
                    <td className="p-4">
                      {val.kredit ? `${parseFloat(val.värde).toFixed(2)} kr` : "0,00 kr"}
                    </td>
                  </tr>
                );
              })}

              {valtFörval.extrafält?.map((extra, i) => {
                const amount = parseFloat(extra.värde ?? "0");
                return (
                  <tr key={`extra-${i}`}>
                    <td className="p-4">
                      {extra.konto} {extra.beskrivning}
                    </td>
                    <td className="p-4">{extra.debet ? formatSEK(amount) : ""}</td>
                    <td className="p-4">{extra.kredit ? formatSEK(amount) : ""}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-cyan-900 text-white">
                <td className="p-4">Totalt</td>
                <td className="p-4">{formatSEK(totalDebet)}</td>
                <td className="p-4">{formatSEK(totalKredit)}</td>
              </tr>
            </tfoot>
          </table>

          <SubmitButton />
        </form>
      </div>
    </main>
  );
}
