// #region Huvud
"use client";

import { useState } from "react";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import TextFält from "../../_components/TextFält";
import KnappFullWidth from "../../_components/KnappFullWidth";
import { formatSEK, parseNumber } from "../../_utils/format";

interface Props {
  mode: "steg2" | "steg3";
  belopp?: number | null;
  setBelopp?: (val: number | null) => void;
  transaktionsdatum?: string | null;
  setTransaktionsdatum?: (val: string | null) => void;
  kommentar?: string | null;
  setKommentar?: (val: string | null) => void;
  setCurrentStep?: (val: number) => void;
  fil: File | null;
  setFil: (val: File | null) => void;
  pdfUrl: string | null;
  setPdfUrl: (val: string) => void;
  extrafält: Record<string, { label: string; debet: number; kredit: number }>;
  setExtrafält?: (fält: Record<string, { label: string; debet: number; kredit: number }>) => void;
  formRef?: React.RefObject<HTMLFormElement>;
  handleSubmit?: (formData: FormData) => void;
}
// #endregion

export default function MilersattningEnskildFirma({
  mode,
  belopp,
  setBelopp,
  transaktionsdatum,
  setTransaktionsdatum,
  kommentar,
  setKommentar,
  setCurrentStep,
  fil,
  setFil,
  pdfUrl,
  setPdfUrl,
  extrafält,
  setExtrafält,
  formRef,
  handleSubmit,
}: Props) {
  const [mil, setMil] = useState("50");
  const [ersPerMil, setErsPerMil] = useState("25");
  const [biltyp, setBiltyp] = useState("Egen bil");
  const [lokaltBelopp, setLokaltBelopp] = useState<number>(belopp ?? 0);

  if (mode === "steg2") {
    const handleNext = () => {
      const milVal = parseNumber(mil);
      const ersVal = parseNumber(ersPerMil);
      const total = milVal * ersVal;

      const skattefriPerMil = 25;
      const skattefri = Math.min(ersVal, skattefriPerMil) * milVal;
      const skattepliktig = Math.max(0, ersVal - skattefriPerMil) * milVal;

      const extrafältData: Record<string, { label: string; debet: number; kredit: number }> = {
        "7331": {
          label: "Skattefri bilersättning",
          debet: skattefri,
          kredit: 0,
        },
        ...(skattepliktig > 0 && {
          "7332": {
            label: "Skattepliktiga bilersättningar",
            debet: skattepliktig,
            kredit: 0,
          },
        }),
        "1930": {
          label: "Företagskonto / affärskonto",
          debet: 0,
          kredit: total,
        },
      };

      setBelopp?.(total);
      setExtrafält?.(extrafältData);
      setCurrentStep?.(3);
    };

    return (
      <div className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Milersättning</h1>
        <div className="flex flex-col-reverse justify-between max-w-5xl mx-auto px-4 md:flex-row">
          <div className="w-full md:w-[40%] bg-slate-900 border border-gray-700 rounded-xl p-6">
            <LaddaUppFil
              fil={fil}
              setFil={setFil}
              setPdfUrl={setPdfUrl}
              setTransaktionsdatum={setTransaktionsdatum ?? (() => {})}
              setBelopp={setLokaltBelopp}
            />

            <TextFält
              name="mil"
              label="Antal mil"
              type="number"
              value={mil}
              onChange={(e) => setMil(e.target.value)}
            />

            <TextFält
              name="ersPerMil"
              label="Ersättning per mil"
              type="number"
              value={ersPerMil}
              onChange={(e) => setErsPerMil(e.target.value)}
            />

            <div className="mb-4">
              <label className="block mb-1 text-sm text-gray-400">Biltyp</label>
              <select
                value={biltyp}
                onChange={(e) => setBiltyp(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 text-white border border-gray-600 rounded"
              >
                <option>Egen bil</option>
                <option>Tjänstebil bensin el. diesel</option>
                <option>Tjänstebil Elbil</option>
              </select>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              Total summa: {formatSEK(parseNumber(mil) * parseNumber(ersPerMil))} kr
            </p>

            <TextFält
              name="kommentar"
              label="Kommentar"
              type="textarea"
              value={kommentar ?? ""}
              onChange={(e) => setKommentar?.(e.target.value)}
            />

            <TextFält
              name="datum"
              label="Betaldatum"
              type="date"
              value={transaktionsdatum ?? ""}
              onChange={(e) => setTransaktionsdatum?.(e.target.value)}
            />

            <KnappFullWidth text="Bokför" onClick={handleNext} />
          </div>

          <Forhandsgranskning fil={fil ?? null} pdfUrl={pdfUrl ?? null} />
        </div>
      </div>
    );
  }

  if (mode === "steg3") {
    const rows = Object.entries(extrafält).map(([konto, info]) => ({
      konto: `${konto} ${info.label}`,
      debet: info.debet,
      kredit: info.kredit,
    }));

    const totalDebet = rows.reduce((sum, row) => sum + row.debet, 0);
    const totalKredit = rows.reduce((sum, row) => sum + row.kredit, 0);

    return (
      <main className="min-h-screen text-white bg-slate-950 px-4">
        <div className="max-w-5xl mx-auto bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg p-10">
          <h1 className="text-3xl mb-4 text-center">Steg 3: Kontrollera och slutför</h1>
          <p className="text-center font-bold text-xl mb-1">Milersättning</p>
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
                {rows.map((r, i) => (
                  <tr key={i}>
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
              <KnappFullWidth text="Slutför bokföring" />
            </div>
          </form>
        </div>
      </main>
    );
  }
}
