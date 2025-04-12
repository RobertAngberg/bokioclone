// Används som Steg3 för specialförval som har extrafält i Steg2 men ingen egen komponent.
// Visar "vanlig" preview-tabell i Steg3 med 1930, moms och huvudkonto.

"use client";

import SubmitButton from "./SubmitButton";

interface Props {
  specialtyp: string;
  belopp: number;
  extrafält?: Record<string, any>; // optional now
  formRef: React.RefObject<HTMLFormElement>;
  handleSubmit: (formData: FormData) => void;
}

const round = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;
const formatSEK = (val: number) => val.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

export default function DefaultSteg3({
  specialtyp,
  belopp,
  extrafält = {}, // fallback om undefined
  formRef,
  handleSubmit,
}: Props) {
  const rows = Object.entries(extrafält)
    .filter(([_, rad]) => {
      const d = parseFloat(rad.debet ?? 0);
      const c = parseFloat(rad.kredit ?? 0);
      return d !== 0 || c !== 0;
    })
    .map(([konto, rad], i) => (
      <tr key={i}>
        <td className="p-4">
          {konto} {rad.label}
        </td>
        <td className="p-4">
          {parseFloat(rad.debet ?? 0) > 0 ? formatSEK(parseFloat(rad.debet)) : ""}
        </td>
        <td className="p-4">
          {parseFloat(rad.kredit ?? 0) > 0 ? formatSEK(parseFloat(rad.kredit)) : ""}
        </td>
      </tr>
    ));

  return (
    <main className="items-center min-h-screen text-center text-white bg-slate-950">
      <div className="w-full p-10 text-white md:mx-auto md:w-2/5 bg-cyan-950 rounded-3xl">
        <h1 className="text-3xl font-bold mb-4">Steg 3: Kontrollera och slutför ({specialtyp})</h1>

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
          </table>
          <SubmitButton />
        </form>
      </div>
    </main>
  );
}
