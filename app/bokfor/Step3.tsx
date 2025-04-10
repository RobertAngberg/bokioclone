"use client";

import { useRef, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveTransaction } from "./actions";

type KontoRad = {
  beskrivning: string;
  kontonummer?: string;
  debet?: boolean;
  kredit?: boolean;
};

type EnrichedExtrafält = {
  namn: string;
  label: string;
  konto: string;
  beskrivning: string;
  debet: boolean;
  kredit: boolean;
  värde: string;
};

type Forval = {
  id: number;
  namn: string;
  beskrivning: string;
  typ: string;
  kategori: string;
  konton: KontoRad[];
  sökord?: string[];
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
  extrafält: Record<string, EnrichedExtrafält>;
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
  const moms = parseFloat((belopp * momssats).toFixed(2));
  const beloppUtanMoms = parseFloat((belopp - moms).toFixed(2));

  const formatSEK = (val: number) =>
    val.toLocaleString("sv-SE", { style: "currency", currency: "SEK", minimumFractionDigits: 2 });

  const calculateBelopp = (konto: KontoRad, typ: "debet" | "kredit") => {
    const nr = konto.kontonummer || "";
    if (nr === "2615" && typ === "kredit" && extrafält["ingående_fiktiv_moms"])
      return parseFloat(extrafält["ingående_fiktiv_moms"].värde);
    if (nr === "4545" && typ === "debet" && extrafält["tull_och_spedition"])
      return parseFloat(extrafält["tull_och_spedition"].värde);
    if (nr === "4549" && typ === "kredit" && extrafält["övriga_skatter"])
      return parseFloat(extrafält["övriga_skatter"].värde);
    return 0;
  };

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

      if (konto.debet && debet === 0)
        messages.push(`⚠️ Konto ${konto.kontonummer} (${konto.beskrivning}) saknar debet-belopp`);
      if (konto.kredit && kredit === 0)
        messages.push(`⚠️ Konto ${konto.kontonummer} (${konto.beskrivning}) saknar kredit-belopp`);
    }

    for (const fält of Object.values(extrafält)) {
      const belopp = parseFloat(fält.värde || "0");
      if (fält.debet) totalDebet += belopp;
      if (fält.kredit) totalKredit += belopp;
    }

    if (Math.abs(totalDebet - totalKredit) > 0.01)
      messages.unshift("⚠️ Debet och Kredit matchar inte. Något är fel med Förvalet.");

    setValidationMessages(messages);
    console.log("🧮 totalDebet:", totalDebet);
    console.log("🧮 totalKredit:", totalKredit);
  }, [valtFörval, extrafält]);

  const handleSubmit = async (formData: FormData) => {
    if (fil) formData.set("fil", fil);
    formData.set("valtFörval", JSON.stringify(valtFörval));
    formData.set("extrafält", JSON.stringify(extrafält));
    const result = await saveTransaction(formData);
    if (result.success) setCurrentStep(4);
    else console.error("❌ Error saving transaction:", result.error);
  };

  if (!valtFörval) {
    return (
      <main className="min-h-screen p-10 text-center text-white bg-red-900">
        <p className="mb-4">⚠️ Saknar vald förval. Gå tillbaka till Steg 1.</p>
        <button onClick={() => setCurrentStep(1)} className="px-4 py-2 bg-white text-black rounded">
          Tillbaka
        </button>
      </main>
    );
  }

  console.log("📦 extrafält till Step3:", extrafält);

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
          <input type="hidden" name="transaktionsdatum" value={transaktionsdatum} />
          <input type="hidden" name="kommentar" value={kommentar} />
          <input type="hidden" name="kontonummer" value={kontonummer} />
          <input type="hidden" name="kontobeskrivning" value={kontobeskrivning} />
          <input type="hidden" name="belopp" value={belopp} />
          <input type="hidden" name="moms" value={moms} />
          <input type="hidden" name="beloppUtanMoms" value={beloppUtanMoms} />
          <input type="hidden" name="valtFörval" value={JSON.stringify(valtFörval)} />
          <input type="hidden" name="extrafält" value={JSON.stringify(extrafält)} />

          <table className="w-full mb-8 text-left border border-gray-300">
            <thead>
              <tr>
                <th className="p-4 border-b">Konto</th>
                <th className="p-4 border-b">Debet</th>
                <th className="p-4 border-b">Kredit</th>
              </tr>
            </thead>
            <tbody>
              {valtFörval.konton.map((konto, i) => {
                const debet = konto.debet ? calculateBelopp(konto, "debet") : 0;
                const kredit = konto.kredit ? calculateBelopp(konto, "kredit") : 0;

                console.log(`📒 Konto ${konto.kontonummer}`, "Debet:", debet, "Kredit:", kredit);

                if (debet === 0 && kredit === 0) return null;

                return (
                  <tr key={i}>
                    <td className="p-4">
                      {konto.kontonummer} {konto.beskrivning}
                    </td>
                    <td className="p-4">{debet > 0 ? formatSEK(debet) : ""}</td>
                    <td className="p-4">{kredit > 0 ? formatSEK(kredit) : ""}</td>
                  </tr>
                );
              })}

              {Object.values(extrafält).map((fält, i) => {
                const belopp = parseFloat(fält.värde || "0");
                console.log(`🔍 Extrafält ${fält.konto} ${fält.beskrivning}`, belopp);

                if (belopp === 0) return null;

                return (
                  <tr key={`extra-${i}`}>
                    <td className="p-4">
                      {fält.konto} {fält.beskrivning}
                    </td>
                    <td className="p-4">{fält.debet ? formatSEK(belopp) : ""}</td>
                    <td className="p-4">{fält.kredit ? formatSEK(belopp) : ""}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-cyan-900 text-white">
                <td className="p-4">Totalt</td>
                <td className="p-4">
                  {formatSEK(
                    valtFörval.konton.reduce(
                      (sum, k) => sum + (k.debet ? calculateBelopp(k, "debet") : 0),
                      Object.values(extrafält).reduce(
                        (sum, x) => sum + (x.debet ? parseFloat(x.värde || "0") : 0),
                        0
                      )
                    )
                  )}
                </td>
                <td className="p-4">
                  {formatSEK(
                    valtFörval.konton.reduce(
                      (sum, k) => sum + (k.kredit ? calculateBelopp(k, "kredit") : 0),
                      Object.values(extrafält).reduce(
                        (sum, x) => sum + (x.kredit ? parseFloat(x.värde || "0") : 0),
                        0
                      )
                    )
                  )}
                </td>
              </tr>
            </tfoot>
          </table>

          <SubmitButton />
        </form>
      </div>
    </main>
  );
}
