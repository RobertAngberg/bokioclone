"use client";

import { useState } from "react";
import Falt from "./Falt";
import SubmitButton from "./SubmitButton";
import Forhandsgranskning from "../Forhandsgranskning";
import LaddaUppFil from "../LaddaUppFil";

interface Props {
  mode: "steg2" | "steg3";
  belopp?: number | null;
  setBelopp?: (val: number | null) => void;
  transaktionsdatum?: string | null;
  setTransaktionsdatum?: (val: string | null) => void;
  kommentar?: string | null;
  setKommentar?: (val: string | null) => void;
  setCurrentStep?: (val: number) => void;
  fil?: File | null;
  setFil?: (val: File | null) => void;
  pdfUrl?: string | null;
  setPdfUrl?: (val: string | null) => void;
  extrafält: Record<string, { label: string; debet: number; kredit: number }>;
  setExtrafält?: (val: Record<string, { label: string; debet: number; kredit: number }>) => void;
  formRef?: React.RefObject<HTMLFormElement>;
  handleSubmit?: (formData: FormData) => void;
}

const round = (val: number): number => Math.round((val + Number.EPSILON) * 100) / 100;
const formatSEK = (val: number) => val.toLocaleString("sv-SE", { minimumFractionDigits: 2 });

export default function MilersattningEnskildFirma(props: Props) {
  const {
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
  } = props;

  const [mil, setMil] = useState("50");
  const [ersPerMil, setErsPerMil] = useState("25");
  const [biltyp, setBiltyp] = useState("Egen bil");

  if (mode === "steg2") {
    const handleLocalSubmit = () => {
      const antalMil = round(parseFloat(mil || "0"));
      const ersattningPerMil = round(parseFloat(ersPerMil || "0"));
      const total = round(antalMil * ersattningPerMil);

      const skattefriPerMil = 25;
      const skattefri = round(Math.min(ersattningPerMil, skattefriPerMil) * antalMil);
      const skattepliktig = round(Math.max(0, ersattningPerMil - skattefriPerMil) * antalMil);

      const extrafaltObj: Record<string, { label: string; debet: number; kredit: number }> = {
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
      setExtrafält?.(extrafaltObj);
      setCurrentStep?.(3);
    };

    return (
      <div className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Milersättning</h1>

        <div className="flex flex-col-reverse justify-between h-auto max-w-5xl px-4 mx-auto md:flex-row">
          <div className="w-full mb-10 md:w-[40%] md:mb-0 bg-slate-900 border border-gray-700 rounded-xl p-6 text-white">
            <LaddaUppFil
              fil={fil ?? null}
              setFil={setFil ?? (() => {})}
              setPdfUrl={setPdfUrl ?? (() => {})}
              setTransaktionsdatum={setTransaktionsdatum ?? (() => {})}
              setBelopp={() => {}}
            />

            <Falt label="Antal mil" type="number" value={mil} onChange={setMil} />
            <Falt
              label="Ersättning per mil"
              type="number"
              value={ersPerMil}
              onChange={setErsPerMil}
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
              Total summa: {formatSEK(round(parseFloat(mil || "0") * parseFloat(ersPerMil || "0")))}{" "}
              kr
            </p>

            <Falt
              label="Kommentar"
              type="textarea"
              value={kommentar ?? ""}
              onChange={setKommentar ?? (() => {})}
            />
            <Falt
              label="Betaldatum"
              type="date"
              value={transaktionsdatum ?? ""}
              onChange={setTransaktionsdatum ?? (() => {})}
            />
            <button
              onClick={handleLocalSubmit}
              className="w-full py-4 mt-6 font-bold rounded bg-cyan-600 hover:bg-cyan-700"
            >
              Bokför
            </button>
          </div>

          <Forhandsgranskning fil={fil ?? null} pdfUrl={pdfUrl ?? null} />
        </div>
      </div>
    );
  }

  if (mode === "steg3") {
    const rad = extrafält || {};
    const rows = Object.entries(rad).map(([konto, info]) => ({
      konto: `${konto} ${info.label}`,
      debet: info.debet,
      kredit: info.kredit,
    }));

    const totalDebet = round(rows.reduce((sum, r) => sum + r.debet, 0));
    const totalKredit = round(rows.reduce((sum, r) => sum + r.kredit, 0));

    return (
      <main className="min-h-screen text-white bg-slate-950 px-4">
        <div className="max-w-5xl mx-auto bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg p-10">
          <h1 className="text-3xl mb-4 text-center">Steg 3: Kontrollera och slutför</h1>
          <p className="text-center font-bold text-xl mb-1">Milersättning</p>
          <p className="text-center text-gray-  0 mb-8">
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
              <SubmitButton />
            </div>
          </form>
        </div>
      </main>
    );
  }

  return null;
}
