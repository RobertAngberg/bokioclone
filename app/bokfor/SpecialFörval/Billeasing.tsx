// #region Huvud
"use client";

import TextFält from "../../_components/TextFält";
import KnappFullWidth from "../../_components/KnappFullWidth";
import LaddaUppFil from "../LaddaUppFil";
import Forhandsgranskning from "../Förhandsgranskning";
import DatePicker from "react-datepicker";
import Steg3 from "../Steg3";
import { useState } from "react";

interface Props {
  mode: "steg2" | "steg3";
  belopp?: number | null;
  setBelopp: (val: number | null) => void;
  transaktionsdatum?: string | null;
  setTransaktionsdatum: (val: string) => void;
  kommentar?: string | null;
  setKommentar?: (val: string | null) => void;
  setCurrentStep?: (val: number) => void;
  fil: File | null;
  setFil: (val: File | null) => void;
  pdfUrl: string | null;
  setPdfUrl: (val: string) => void;
  extrafält: Record<string, { label: string; debet: number; kredit: number }>;
  setExtrafält?: (val: Record<string, { label: string; debet: number; kredit: number }>) => void;
}
// #endregion

export default function Billeasing({
  mode,
  belopp = null,
  setBelopp,
  transaktionsdatum = "",
  setTransaktionsdatum,
  kommentar = "",
  setKommentar,
  setCurrentStep,
  fil,
  setFil,
  pdfUrl,
  setPdfUrl,
  extrafält,
  setExtrafält,
}: Props) {
  const [forsakring, setForsakring] = useState<number>(0);
  const [admin, setAdmin] = useState<number>(0);
  const [forhojd, setForhojd] = useState<number>(0);

  const giltigt = (belopp ?? 0) > 0 && !!transaktionsdatum;

  function gåTillSteg3() {
    const leasing = belopp ?? 0;
    const momsLeasing = leasing * 0.25;
    const momsAdmin = admin * 0.25;
    const momsForhojd = forhojd * 0.25;
    const nettoForhojd = forhojd - momsForhojd;

    const total = leasing + admin + forsakring + forhojd + momsLeasing + momsAdmin;

    setExtrafält?.({
      "1930": { label: "Företagskonto / affärskonto", debet: 0, kredit: total },
      "2640": {
        label: "Ingående moms",
        debet: momsLeasing + momsAdmin + momsForhojd,
        kredit: 0,
      },
      "5612": {
        label: "Försäkring och skatt för personbilar",
        debet: forsakring,
        kredit: 0,
      },
      "5615": {
        label: "Leasing av personbilar",
        debet: leasing,
        kredit: 0,
      },
      "6990": {
        label: "Övriga externa kostnader",
        debet: admin,
        kredit: 0,
      },
      "1720": {
        label: "Förutbetalda leasingavgifter",
        debet: nettoForhojd,
        kredit: 0,
      },
    });

    setBelopp(total);
    setCurrentStep?.(3);
  }

  if (mode === "steg2") {
    return (
      <div className="bg-cyan-950 text-white">
        <h1 className="mb-6 text-3xl text-center">Steg 2: Billeasing</h1>
        <div className="flex flex-col-reverse justify-between max-w-5xl mx-auto px-4 md:flex-row">
          <div className="w-full md:w-[40%] bg-slate-900 border border-gray-700 rounded-xl p-6">
            <LaddaUppFil
              fil={fil}
              setFil={setFil}
              setPdfUrl={setPdfUrl}
              setTransaktionsdatum={setTransaktionsdatum}
              setBelopp={setBelopp}
            />

            <TextFält
              label="Leasingavgift (exkl. moms)"
              name="leasing"
              value={belopp ?? ""}
              onChange={(e) => setBelopp(Number(e.target.value))}
              required
            />

            <TextFält
              label="Försäkring + skatt"
              name="forsakring"
              value={forsakring}
              onChange={(e) => setForsakring(Number(e.target.value))}
              required
            />

            <TextFält
              label="Adminavgifter (exkl. moms)"
              name="admin"
              value={admin}
              onChange={(e) => setAdmin(Number(e.target.value))}
              required
            />

            <TextFält
              label="Förhöjd avgift (inkl. moms)"
              name="forhojd"
              value={forhojd}
              onChange={(e) => setForhojd(Number(e.target.value))}
              required={false}
            />

            <label className="block text-sm font-medium text-white mb-2">Betaldatum</label>
            <DatePicker
              className="w-full p-2 mb-4 rounded bg-slate-900 text-white border border-gray-700"
              selected={transaktionsdatum ? new Date(transaktionsdatum) : null}
              onChange={(d) => setTransaktionsdatum(d ? d.toISOString().split("T")[0] : "")}
              dateFormat="yyyy-MM-dd"
              locale="sv"
              required
            />

            <TextFält
              label="Kommentar"
              name="kommentar"
              value={kommentar ?? ""}
              onChange={(e) => setKommentar?.(e.target.value)}
              required={false}
            />

            <KnappFullWidth text="Gå vidare" onClick={gåTillSteg3} disabled={!giltigt} />
          </div>

          <Forhandsgranskning fil={fil ?? null} pdfUrl={pdfUrl ?? null} />
        </div>
      </div>
    );
  }

  if (mode === "steg3") {
    return (
      <Steg3
        kontonummer="5615"
        kontobeskrivning="Billeasing"
        belopp={belopp ?? 0}
        transaktionsdatum={transaktionsdatum ?? ""}
        kommentar={kommentar ?? ""}
        valtFörval={{
          id: 0,
          namn: "Billeasing",
          beskrivning: "",
          typ: "",
          kategori: "",
          konton: [],
          momssats: 0.25,
          specialtyp: "billeasing",
        }}
        setCurrentStep={setCurrentStep}
        extrafält={extrafält}
      />
    );
  }
}
