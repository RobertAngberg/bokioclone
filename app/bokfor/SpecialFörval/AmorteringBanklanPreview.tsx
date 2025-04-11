"use client";

import SubmitButton from "./SubmitButton";

interface Props {
  formRef: React.RefObject<HTMLFormElement>;
  handleSubmit: (formData: FormData) => void;
  extrafält: Record<string, { debet?: number; kredit?: number }>;
}

const formatSEK = (val: number) => val.toLocaleString("sv-SE", { minimumFractionDigits: 2 });
const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;

export default function AmorteringBanklanPreview({ formRef, handleSubmit, extrafält }: Props) {
  const rad = extrafält || {};

  const rows = [
    {
      konto: "1930 Företagskonto / affärskonto",
      debet: 0,
      kredit: rad["1930"]?.kredit ?? 0,
    },
    {
      konto: "2350 Andra långfristiga skulder till kreditinstitut",
      debet: rad["2350"]?.debet ?? 0,
      kredit: 0,
    },
    {
      konto: "8410 Räntekostnader för långfristiga skulder",
      debet: rad["8410"]?.debet ?? 0,
      kredit: 0,
    },
  ];

  const totalDebet = round(rows.reduce((sum, r) => sum + r.debet, 0));
  const totalKredit = round(rows.reduce((sum, r) => sum + r.kredit, 0));

  return (
    <main className="items-center min-h-screen text-center text-white bg-slate-950">
      <div className="w-full p-10 text-white md:mx-auto md:w-2/5 bg-cyan-950 rounded-3xl">
        <h1 className="text-3xl font-bold mb-4">Steg 3: Kontrollera och slutför (Amortering)</h1>

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
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="p-4">{r.konto}</td>
                  <td className="p-4">{r.debet > 0 ? formatSEK(r.debet) : ""}</td>
                  <td className="p-4">{r.kredit > 0 ? formatSEK(r.kredit) : ""}</td>
                </tr>
              ))}
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
