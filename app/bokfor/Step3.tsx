"use client";

import { saveTransaction, getKontotyp } from "./actions";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import React from "react";

interface Step3Props {
  kontonummer: string;
  kontobeskrivning: string;
  fil?: File;
  belopp: number;
  transaktionsdatum: string;
  kommentar: string;
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

function Step3({
  kontonummer,
  kontobeskrivning,
  fil,
  belopp,
  transaktionsdatum,
  kommentar,
  setCurrentStep,
}: Step3Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [kontotyp, setKontotyp] = useState<"Intäkt" | "Utgift" | null>(null);

  const moms = parseFloat(((belopp ?? 0) * 0.2).toFixed(2));
  const beloppUtanMoms = parseFloat(((belopp ?? 0) * 0.8).toFixed(2));

  useEffect(() => {
    getKontotyp(kontonummer).then((typ) => {
      if (typ === "Intäkt" || typ === "Utgift") {
        setKontotyp(typ);
      } else {
        console.warn("⚠️ Okänd kontotyp:", typ);
      }
    });
  }, [kontonummer]);

  const handleSubmit = async (formData: FormData) => {
    if (fil) formData.set("fil", fil);
    const result = await saveTransaction(formData);
    if (result.success) {
      console.log("✅ Transaction debug info:", result.debug);
      setCurrentStep(4);
    } else {
      console.error("Error saving transaction:", result.error);
    }
  };

  if (!kontotyp) {
    return (
      <main className="items-center min-h-screen text-center text-white bg-slate-950">
        <p className="p-10">🔄 Hämtar kontoinformation...</p>
      </main>
    );
  }

  return (
    <main className="items-center min-h-screen text-center text-white bg-slate-950">
      <div className="w-full p-10 text-white md:mx-auto md:w-2/5 bg-cyan-950 rounded-3xl">
        <h1 className="text-3xl font-bold bokföring mb-4">Steg 3: Kontrollera och slutför</h1>
        <p className="w-full font-bold">{kontobeskrivning}</p>
        <p className="w-full mb-6">
          {transaktionsdatum ? new Date(transaktionsdatum).toLocaleDateString("sv-SE") : ""}
        </p>

        <form ref={formRef} action={handleSubmit}>
          <input type="hidden" name="transaktionsdatum" value={transaktionsdatum} />
          <input type="hidden" name="kommentar" value={kommentar} />
          <input type="hidden" name="kontonummer" value={kontonummer.trim()} />
          <input type="hidden" name="kontobeskrivning" value={kontobeskrivning} />
          <input type="hidden" name="belopp" value={String(belopp)} />
          <input type="hidden" name="moms" value={String(moms)} />
          <input type="hidden" name="beloppUtanMoms" value={String(beloppUtanMoms)} />

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
                <td className="p-4">Företagskonto</td>
                <td className="p-4">{kontotyp === "Intäkt" ? belopp : 0}</td>
                <td className="p-4">{kontotyp === "Utgift" ? belopp : 0}</td>
              </tr>
              <tr>
                <td className="p-4">{kontotyp === "Utgift" ? "Ingående moms" : "Utgående moms"}</td>
                <td className="p-4">{kontotyp === "Utgift" ? moms : 0}</td>
                <td className="p-4">{kontotyp === "Intäkt" ? moms : 0}</td>
              </tr>
              <tr>
                <td className="p-4">{kontobeskrivning}</td>
                <td className="p-4">{kontotyp === "Utgift" ? beloppUtanMoms : 0}</td>
                <td className="p-4">{kontotyp === "Intäkt" ? beloppUtanMoms : 0}</td>
              </tr>
            </tbody>
          </table>

          <SubmitButton />
        </form>
      </div>
    </main>
  );
}

export { Step3 };
