"use client";

import { saveTransaction } from "./actions";
import { useRef, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import React from "react";

type KontoRad = {
  beskrivning: string;
  kontonummer?: string;
  debet?: boolean;
  kredit?: boolean;
  andelAv?: "moms" | "utanMoms" | "hela";
};

type Forval = {
  id: number;
  namn: string;
  beskrivning: string;
  typ: string;
  kategori: string;
  konton: KontoRad[];
  sökord: string[];
  extrafält?: any[];
};

interface Step3Props {
  kontonummer: string;
  kontobeskrivning: string;
  fil?: File | null;
  belopp: number;
  transaktionsdatum: string;
  kommentar: string;
  valdaFörval: Forval | null;
  setCurrentStep: (step: number) => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex items-center justify-center gap-2 w-full px-4 py-6 font-bold text-white rounded ${
        pending ? "bg-gray-400 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700"
      }`}
    >
      {pending && (
        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      )}
      {pending ? "Bokför..." : "Bokför"}
    </button>
  );
}

// ✅ Flyttad UT hit för att fungera i både render + validering
function getBelopp(
  konto: KontoRad,
  typ: "debet" | "kredit",
  belopp: number,
  moms: number,
  beloppUtanMoms: number
): string {
  const andel = konto.andelAv;

  if (andel === "moms") return moms.toFixed(2);
  if (andel === "utanMoms") return beloppUtanMoms.toFixed(2);
  if (andel === "hela") return belopp.toFixed(2);

  if (!konto.kontonummer) return "";

  const prefix = konto.kontonummer.slice(0, 1);

  if (typ === "debet") {
    if (prefix === "1") return belopp.toFixed(2);
    if (prefix === "2") return moms.toFixed(2);
    return beloppUtanMoms.toFixed(2);
  }

  if (typ === "kredit") {
    if (prefix === "3") return beloppUtanMoms.toFixed(2);
    if (prefix === "2") return moms.toFixed(2);
    if (prefix === "1") return belopp.toFixed(2);
  }

  return "";
}

function validateForvalData(
  förval: Forval,
  belopp: number,
  moms: number,
  beloppUtanMoms: number
): string[] {
  const messages: string[] = [];

  förval.konton.forEach((konto) => {
    const debet = konto.debet ? getBelopp(konto, "debet", belopp, moms, beloppUtanMoms) : "";
    const kredit = konto.kredit ? getBelopp(konto, "kredit", belopp, moms, beloppUtanMoms) : "";

    if (konto.debet && !debet) {
      messages.push(`⚠️ Konto ${konto.kontonummer} (${konto.beskrivning}) saknar debet-belopp`);
    }
    if (konto.kredit && !kredit) {
      messages.push(`⚠️ Konto ${konto.kontonummer} (${konto.beskrivning}) saknar kredit-belopp`);
    }
  });

  return messages;
}

function Step3({
  kontonummer,
  kontobeskrivning,
  fil,
  belopp,
  transaktionsdatum,
  kommentar,
  valdaFörval,
  setCurrentStep,
}: Step3Props) {
  const formRef = useRef<HTMLFormElement>(null);

  const moms = parseFloat((belopp * 0.2).toFixed(2));
  const beloppUtanMoms = parseFloat((belopp * 0.8).toFixed(2));

  const [validationMessages, setValidationMessages] = useState<string[]>([]);

  useEffect(() => {
    if (valdaFörval) {
      const msgs = validateForvalData(valdaFörval, belopp, moms, beloppUtanMoms);
      setValidationMessages(msgs);
    }
  }, [valdaFörval, belopp, moms, beloppUtanMoms]);

  if (!valdaFörval) {
    return (
      <main className="min-h-screen p-10 text-center text-white bg-red-900">
        <p className="mb-4">⚠️ Saknar vald förval. Gå tillbaka till Steg 1.</p>
        <button onClick={() => setCurrentStep(1)} className="px-4 py-2 bg-white text-black rounded">
          Tillbaka
        </button>
      </main>
    );
  }

  const handleSubmit = async (formData: FormData) => {
    if (fil) formData.set("fil", fil);
    formData.set("valdaFörval", JSON.stringify(valdaFörval));
    const result = await saveTransaction(formData);
    if (result.success) {
      console.log("✅ Transaction saved successfully with ID:", result.id);
      setCurrentStep(4);
    } else {
      console.error("Error saving transaction:", result.error);
    }
  };

  return (
    <main className="items-center min-h-screen text-center text-white bg-slate-950">
      <div className="w-full p-10 text-white md:mx-auto md:w-2/5 bg-cyan-950 rounded-3xl">
        <h1 className="text-3xl font-bold mb-4">Steg 3: Kontrollera och slutför</h1>
        <p className="w-full font-bold">{kontobeskrivning}</p>
        <p className="w-full mb-6">
          {transaktionsdatum ? new Date(transaktionsdatum).toLocaleDateString("sv-SE") : ""}
        </p>

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
          <input type="hidden" name="kontonummer" value={kontonummer.trim()} />
          <input type="hidden" name="kontobeskrivning" value={kontobeskrivning} />
          <input type="hidden" name="belopp" value={String(belopp)} />
          <input type="hidden" name="moms" value={String(moms)} />
          <input type="hidden" name="beloppUtanMoms" value={String(beloppUtanMoms)} />
          <input type="hidden" name="valdaFörval" value={JSON.stringify(valdaFörval)} />

          <table className="w-full mb-8 text-left border border-gray-300">
            <thead>
              <tr>
                <th className="p-4 border-b">Konto</th>
                <th className="p-4 border-b">Debet</th>
                <th className="p-4 border-b">Kredit</th>
              </tr>
            </thead>
            <tbody>
              {valdaFörval.konton.map((konto, i) => {
                const debet = konto.debet
                  ? getBelopp(konto, "debet", belopp, moms, beloppUtanMoms)
                  : "";
                const kredit = konto.kredit
                  ? getBelopp(konto, "kredit", belopp, moms, beloppUtanMoms)
                  : "";

                return (
                  <tr key={i}>
                    <td className="p-4">
                      {konto.kontonummer} {konto.beskrivning}
                    </td>
                    <td className="p-4">{debet}</td>
                    <td className="p-4">{kredit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <SubmitButton />
        </form>
      </div>
    </main>
  );
}

export { Step3 };
