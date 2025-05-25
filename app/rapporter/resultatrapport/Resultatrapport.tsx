//#region Imports och types
"use client";

import { useState } from "react";
import AnimeradFlik from "../../_components/AnimeradFlik";
import MainLayout from "../../_components/MainLayout";
import Totalrad from "../../_components/Totalrad";
import InreTabell from "../../_components/InreTabell";
import Knapp from "../../_components/Knapp";
import VerifikatModal from "./VerifikatModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Konto = {
  kontonummer: string;
  beskrivning: string;
  transaktion_id?: number;
  [year: string]: number | string | undefined;
};

type KontoRad = {
  namn: string;
  konton: Konto[];
  summering: { [year: string]: number };
};

type ResultatData = {
  intakter: KontoRad[];
  rorelsensKostnader: KontoRad[];
  finansiellaIntakter?: KontoRad[];
  finansiellaKostnader: KontoRad[];
  ar: string[];
};

type Props = {
  initialData: ResultatData;
  företagsnamn?: string;
  organisationsnummer?: string;
};
//#endregion

export default function Resultatrapport({ initialData }: Props) {
  //#region State & Variables
  const data = initialData;
  const year = data.ar[0];
  const [verifikatId, setVerifikatId] = useState<number | null>(null);
  //#endregion

  //#region Helper Functions
  const summering = (rader: KontoRad[] = []) => {
    const result: Record<string, number> = {};
    for (const rad of rader) {
      for (const year of data.ar) {
        const value = typeof rad.summering[year] === "number" ? rad.summering[year] : 0;
        result[year] = (result[year] || 0) + value;
      }
    }
    return result;
  };

  const formatSEK = (val: number | undefined | null) =>
    (typeof val === "number" && !isNaN(val) ? val : 0)
      .toLocaleString("sv-SE", { style: "currency", currency: "SEK" })
      .replace(/[^0-9,.\-\s]/g, "") // Tog bort 'a-zA-Z' och lade till '\s' för mellanslag
      .replace(/\s+/g, " ")
      .trim();
  //#endregion

  //#region Data Calculations
  const intaktsSumRaw = summering(data.intakter);
  const intaktsSum: Record<string, number> = {};
  for (const year of data.ar) {
    intaktsSum[year] = -intaktsSumRaw[year] || 0;
  }

  const rorelsensSum = summering(data.rorelsensKostnader);
  const finansiellaIntakterSum = summering(data.finansiellaIntakter);
  const finansiellaKostnaderSum = summering(data.finansiellaKostnader);

  const rorelsensResultat: Record<string, number> = {};
  data.ar.forEach((year) => {
    rorelsensResultat[year] = (intaktsSum[year] ?? 0) - (rorelsensSum[year] ?? 0);
  });

  const resultatEfterFinansiella: Record<string, number> = {};
  data.ar.forEach((year) => {
    resultatEfterFinansiella[year] =
      (rorelsensResultat[year] ?? 0) +
      (finansiellaIntakterSum[year] ?? 0) -
      (finansiellaKostnaderSum[year] ?? 0);
  });

  const resultat: Record<string, number> = {};
  data.ar.forEach((year) => {
    resultat[year] = resultatEfterFinansiella[year];
  });
  //#endregion

  //#region Render Functions
  const renderGrupper = (rader: KontoRad[] = [], isIntakt = false, icon?: string) =>
    rader.map((grupp) => (
      <AnimeradFlik key={grupp.namn} title={grupp.namn} icon={icon || (isIntakt ? "💰" : "💸")}>
        <InreTabell
          rows={grupp.konton.map((konto) => ({
            Konto: `${konto.kontonummer} – ${konto.beskrivning}`,
            "": (
              <div className="text-center">
                <button
                  className="underline text-blue-400 hover:text-blue-300 transition-colors"
                  onClick={() => setVerifikatId(konto.transaktion_id as number)}
                  disabled={!konto.transaktion_id}
                >
                  Visa verifikat
                </button>
              </div>
            ),
            Belopp: isIntakt ? -(konto[year] as number) : (konto[year] as number),
          }))}
          totalLabel={`Summa ${grupp.namn.toLowerCase()}`}
          totalValue={isIntakt ? -grupp.summering[year] : grupp.summering[year]}
        />
      </AnimeradFlik>
    ));
  //#endregion

  //#region Exportfunktioner
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Centrerad titel med margin
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = "Resultatrapport";
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, titleX, 20);
    doc.setFontSize(12);

    let y = 35; // Mer margin under titel

    const addSection = (
      title: string,
      rows: { label: string; value: number }[],
      sumLabel: string,
      sumValue: number
    ) => {
      // Margin ovanför sektion
      y += 8;

      // Bold underrubrik
      doc.setFont("helvetica", "bold");
      doc.text(title, 14, y);
      doc.setFont("helvetica", "normal");
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [["Konto", "Belopp"]],
        body: rows.map((row) => [row.label, formatSEK(row.value)]),
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 3,
          lineWidth: 0.1,
        },
        headStyles: {
          fontStyle: "bold",
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
        },
        margin: { left: 14, right: 14 },
      });

      y = (doc as any).lastAutoTable?.finalY + 15 || y; // Ökad margin efter tabeller

      // Bold summa
      doc.setFont("helvetica", "bold");
      doc.text(`${sumLabel}: ${formatSEK(sumValue)}`, 14, y);
      doc.setFont("helvetica", "normal");
      y += 15; // Mer margin under summor
    };

    // Intäkter - använd samma värden som visas i UI
    data.intakter.forEach((grupp) => {
      addSection(
        grupp.namn,
        grupp.konton.map((konto) => ({
          label: `${konto.kontonummer} – ${konto.beskrivning}`,
          value: -(konto[year] as number), // isIntakt = true
        })),
        `Summa ${grupp.namn.toLowerCase()}`,
        -grupp.summering[year] // isIntakt = true
      );
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Summa rörelsens intäkter: ${formatSEK(intaktsSum[year])}`, 14, y);
    doc.setFont("helvetica", "normal");
    y += 20;

    // Rörelsens kostnader - använd samma värden som visas i UI
    data.rorelsensKostnader.forEach((grupp) => {
      addSection(
        grupp.namn,
        grupp.konton.map((konto) => ({
          label: `${konto.kontonummer} – ${konto.beskrivning}`,
          value: konto[year] as number, // isIntakt = false
        })),
        `Summa ${grupp.namn.toLowerCase()}`,
        grupp.summering[year] // isIntakt = false
      );
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Summa rörelsens kostnader: ${formatSEK(-rorelsensSum[year])}`, 14, y);
    doc.setFont("helvetica", "normal");
    y += 20;

    // Rörelsens resultat
    doc.setFont("helvetica", "bold");
    doc.text(`Summa rörelsens resultat: ${formatSEK(rorelsensResultat[year])}`, 14, y);
    doc.setFont("helvetica", "normal");
    y += 20;

    // Finansiella intäkter
    if (data.finansiellaIntakter && data.finansiellaIntakter.length > 0) {
      data.finansiellaIntakter.forEach((grupp) => {
        addSection(
          grupp.namn,
          grupp.konton.map((konto) => ({
            label: `${konto.kontonummer} – ${konto.beskrivning}`,
            value: konto[year] as number,
          })),
          `Summa ${grupp.namn.toLowerCase()}`,
          grupp.summering[year]
        );
      });

      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text(`Summa finansiella intäkter: ${formatSEK(finansiellaIntakterSum[year])}`, 14, y);
      doc.setFont("helvetica", "normal");
      y += 20;
    }

    // Finansiella kostnader
    if (data.finansiellaKostnader && data.finansiellaKostnader.length > 0) {
      data.finansiellaKostnader.forEach((grupp) => {
        addSection(
          grupp.namn,
          grupp.konton.map((konto) => ({
            label: `${konto.kontonummer} – ${konto.beskrivning}`,
            value: konto[year] as number,
          })),
          `Summa ${grupp.namn.toLowerCase()}`,
          grupp.summering[year]
        );
      });

      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text(`Summa finansiella kostnader: ${formatSEK(finansiellaKostnaderSum[year])}`, 14, y);
      doc.setFont("helvetica", "normal");
      y += 20;
    }

    // Resultat efter finansiella poster
    doc.setFont("helvetica", "bold");
    doc.text(
      `Resultat efter finansiella poster: ${formatSEK(resultatEfterFinansiella[year])}`,
      14,
      y
    );
    y += 15;

    // Beräknat resultat
    doc.text(`Beräknat resultat: ${formatSEK(resultat[year])}`, 14, y);
    doc.setFont("helvetica", "normal");

    doc.save("resultatrapport.pdf");
  };

  const handleExportCSV = () => {
    let csv = "Rubrik;Konto;Belopp\n";
    // Intäkter
    data.intakter.forEach((grupp) => {
      grupp.konton.forEach((konto) => {
        csv += `Rörelsens intäkter;${konto.kontonummer} – ${konto.beskrivning};${-(konto[year] as number)}\n`;
      });
      csv += `Rörelsens intäkter;Summa ${grupp.namn.toLowerCase()};${-grupp.summering[year]}\n`;
    });
    csv += `Rörelsens intäkter;Summa rörelsens intäkter;${intaktsSum[year]}\n`;

    // Kostnader
    data.rorelsensKostnader.forEach((grupp) => {
      grupp.konton.forEach((konto) => {
        csv += `Rörelsens kostnader;${konto.kontonummer} – ${konto.beskrivning};${konto[year]}\n`;
      });
      csv += `Rörelsens kostnader;Summa ${grupp.namn.toLowerCase()};${grupp.summering[year]}\n`;
    });
    csv += `Rörelsens kostnader;Summa rörelsens kostnader;${rorelsensSum[year]}\n`;

    // Rörelsens resultat
    csv += `Rörelsens resultat;Summa rörelsens resultat;${rorelsensResultat[year]}\n`;

    // Finansiella intäkter
    if (data.finansiellaIntakter && data.finansiellaIntakter.length > 0) {
      data.finansiellaIntakter.forEach((grupp) => {
        grupp.konton.forEach((konto) => {
          csv += `Finansiella intäkter;${konto.kontonummer} – ${konto.beskrivning};${konto[year]}\n`;
        });
        csv += `Finansiella intäkter;Summa ${grupp.namn.toLowerCase()};${grupp.summering[year]}\n`;
      });
      csv += `Finansiella intäkter;Summa finansiella intäkter;${finansiellaIntakterSum[year]}\n`;
    }

    // Finansiella kostnader
    if (data.finansiellaKostnader && data.finansiellaKostnader.length > 0) {
      data.finansiellaKostnader.forEach((grupp) => {
        grupp.konton.forEach((konto) => {
          csv += `Finansiella kostnader;${konto.kontonummer} – ${konto.beskrivning};${konto[year]}\n`;
        });
        csv += `Finansiella kostnader;Summa ${grupp.namn.toLowerCase()};${grupp.summering[year]}\n`;
      });
      csv += `Finansiella kostnader;Summa finansiella kostnader;${finansiellaKostnaderSum[year]}\n`;
    }

    // Resultat efter finansiella poster
    csv += `Resultat efter finansiella poster;Resultat efter finansiella poster;${resultatEfterFinansiella[year]}\n`;

    // Beräknat resultat
    csv += `Beräknat resultat;Beräknat resultat;${resultat[year]}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resultatrapport.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  //#endregion

  return (
    <MainLayout>
      <div className="mx-auto px-4 text-white">
        <h1 className="text-3xl text-center mb-8">Resultatrapport</h1>
        <div className="flex gap-4 mb-8 justify-center">
          <Knapp text="Ladda ner PDF" onClick={handleExportPDF} />
          <Knapp text="Ladda ner CSV" onClick={handleExportCSV} />
        </div>

        {/* Rörelsens intäkter */}
        <h2 className="text-xl font-semibold mt-10 mb-4">Rörelsens intäkter</h2>
        {renderGrupper(data.intakter, true, "💰")}
        <Totalrad label="Summa rörelsens intäkter" values={{ [year]: intaktsSum[year] ?? 0 }} />

        {/* Rörelsens kostnader */}
        <h2 className="text-xl font-semibold mt-10 mb-4">Rörelsens kostnader</h2>
        {renderGrupper(data.rorelsensKostnader, false, "💸")}
        <Totalrad label="Summa rörelsens kostnader" values={{ [year]: -rorelsensSum[year] }} />

        {/* Rörelsens resultat */}
        <h2 className="text-xl font-semibold mt-10 mb-4">Rörelsens resultat</h2>
        <Totalrad
          label="Summa rörelsens resultat"
          values={{ [year]: rorelsensResultat[year] ?? 0 }}
        />

        {/* Finansiella intäkter */}
        {data.finansiellaIntakter && data.finansiellaIntakter.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-10 mb-4">Finansiella intäkter</h2>
            {renderGrupper(data.finansiellaIntakter, false, "💰")}
            <Totalrad
              label="Summa finansiella intäkter"
              values={{ [year]: finansiellaIntakterSum[year] ?? 0 }}
            />
          </>
        )}

        {/* Finansiella kostnader */}
        {data.finansiellaKostnader && data.finansiellaKostnader.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-10 mb-4">Finansiella kostnader</h2>
            {renderGrupper(data.finansiellaKostnader, false, "💸")}
            <Totalrad
              label="Summa finansiella kostnader"
              values={{ [year]: finansiellaKostnaderSum[year] ?? 0 }}
            />
          </>
        )}

        {/* Resultat efter finansiella poster */}
        <h2 className="text-xl font-semibold mt-10 mb-4">Resultat efter finansiella poster</h2>
        <Totalrad
          label="Resultat efter finansiella poster"
          values={{ [year]: resultatEfterFinansiella[year] ?? 0 }}
        />

        {/* Beräknat resultat */}
        <h2 className="text-xl font-semibold mt-10 mb-4">Beräknat resultat</h2>
        <Totalrad label="Beräknat resultat" values={{ [year]: resultat[year] ?? 0 }} />
      </div>

      {/* Modal för verifikat */}
      {verifikatId && (
        <VerifikatModal transaktionsId={verifikatId} onClose={() => setVerifikatId(null)} />
      )}
    </MainLayout>
  );
}
