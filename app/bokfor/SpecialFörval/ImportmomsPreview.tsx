"use client";

import { useEffect, useState } from "react";
import SubmitButton from "./SubmitButton"; // ⬅️ Lokal import

interface Props {
  formRef: React.RefObject<HTMLFormElement>;
  handleSubmit: (formData: FormData) => void;
  extrafält: Record<string, any>;
  belopp: number;
  validationMessages: string[];
}

export default function ImportmomsPreview({ formRef, handleSubmit, extrafält, belopp }: Props) {
  const [validationMessages, setValidationMessages] = useState<string[]>([]);

  const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;
  const formatSEK = (val: number) => val.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

  let totalDebet = 0;
  let totalKredit = 0;

  const rows = Object.entries(extrafält).map(([kontoNr, data]) => {
    const d = parseFloat(data.debet || "0");
    const c = parseFloat(data.kredit || "0");
    totalDebet += d;
    totalKredit += c;

    return (
      <tr key={kontoNr}>
        <td className="p-4">
          {kontoNr} {data.label}
        </td>
        <td className="p-4">{d > 0 ? formatSEK(round(d)) : ""}</td>
        <td className="p-4">{c > 0 ? formatSEK(round(c)) : ""}</td>
      </tr>
    );
  });

  totalDebet = round(totalDebet);
  totalKredit = round(totalKredit);

  useEffect(() => {
    const messages: string[] = [];
    if (Math.abs(totalDebet - totalKredit) > 0.01) {
      messages.push("⚠️ Debet och Kredit matchar inte. Något är fel i dina fält.");
    }
    setValidationMessages(messages);
  }, [totalDebet, totalKredit]);

  return (
    <main className="items-center min-h-screen text-center text-white bg-slate-950">
      <div className="w-full p-10 text-white md:mx-auto md:w-2/5 bg-cyan-950 rounded-3xl">
        <h1 className="text-3xl font-bold mb-4">Steg 3: Kontrollera och slutför (Importmoms)</h1>

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
            <tbody>{rows}</tbody>
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
