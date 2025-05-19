// #region Huvud
"use client";

import AnimeradFlik from "../../_components/AnimeradFlik";
import MainLayout from "../../_components/MainLayout";
import Totalrad from "../../_components/Totalrad";
import InreTabell from "../../_components/InreTabell";
import Knapp from "../../_components/Knapp";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Konto = {
  kontonummer: string;
  beskrivning: string;
  [year: string]: number | string;
};

type KontoRad = {
  namn: string;
  konton: Konto[];
  summering: { [year: string]: number };
};

type ResultatData = {
  intakter: KontoRad[];
  rorelsensKostnader: KontoRad[];
  finansiellaKostnader: KontoRad[];
  ar: string[];
};

type Props = {
  initialData: ResultatData;
  företagsnamn?: string;
  organisationsnummer?: string;
};
// #endregion

export default function Resultatrapport({ initialData, företagsnamn, organisationsnummer }: Props) {
  const data = initialData;
  const year = data.ar[0];

  // Summera intäkter och kostnader utan att vända tecken
  const summering = (rader: KontoRad[]) => {
    const result: Record<string, number> = {};
    for (const rad of rader) {
      for (const year of data.ar) {
        const value = typeof rad.summering[year] === "number" ? rad.summering[year] : 0;
        result[year] = (result[year] || 0) + value;
      }
    }
    return result;
  };

  // Intäkter är negativa i bokföringen, så vänd tecknet till positivt
  const intaktsSumRaw = summering(data.intakter);
  const intaktsSum: Record<string, number> = {};
  for (const year of data.ar) {
    intaktsSum[year] = -intaktsSumRaw[year] || 0;
  }

  // Kostnader och finansiella kostnader är redan positiva
  const rorelsensSum = summering(data.rorelsensKostnader);
  const finansiellaSum = summering(data.finansiellaKostnader);

  const resultat: Record<string, number> = {};
  data.ar.forEach((year) => {
    const intakt = intaktsSum[year] ?? 0;
    const kostnad = rorelsensSum[year] ?? 0;
    const finansiell = finansiellaSum[year] ?? 0;
    resultat[year] = intakt - kostnad - finansiell;
  });

  const formatSEK = (val: number | undefined | null) =>
    (typeof val === "number" && !isNaN(val) ? val : 0)
      .toLocaleString("sv-SE", { style: "currency", currency: "SEK" })
      .replace(/[^0-9a-zA-Z,.\- ]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Header
    let y = 30;
    doc.setFontSize(32);
    doc.text("Resultatrapport", 105, y, { align: "center" });

    // Margin bottom under rubrik
    y += 25;

    // Företagsnamn (bold)
    if (företagsnamn) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(företagsnamn, 14, y);
      y += 7;
    }

    // Organisationsnummer (normal)
    if (organisationsnummer) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(organisationsnummer, 14, y);
      y += 8;
    }

    // Utskriven datum
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Utskriven: ${new Date().toISOString().slice(0, 10)}`, 14, y);

    y += 20;

    // Dynamiska grupper
    const grupper = [
      { titel: "Rörelsens intäkter", rader: data.intakter, isIntakt: true },
      { titel: "Rörelsens kostnader", rader: data.rorelsensKostnader, isIntakt: false },
      { titel: "Finansiella kostnader", rader: data.finansiellaKostnader, isIntakt: false },
    ];

    grupper.forEach(({ titel, rader, isIntakt }) => {
      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.text(titel, 14, y);
      y += 8;

      // Tabellrader
      const rows: any[][] = [];
      rader.forEach((grupp) => {
        grupp.konton.forEach((konto) => {
          rows.push([
            konto.kontonummer,
            konto.beskrivning,
            formatSEK(isIntakt ? -(konto[year] as number) : (konto[year] as number)),
          ]);
        });
        // Summeringsrad för grupp
        rows.push([
          {
            content: `Summa ${grupp.namn.toLowerCase()}`,
            colSpan: 2,
            styles: { fontStyle: "bold" },
          },
          {
            content: formatSEK(isIntakt ? -grupp.summering[year] : grupp.summering[year]),
            styles: { fontStyle: "bold", halign: "left" },
          },
        ]);
      });

      autoTable(doc, {
        startY: y,
        head: [["Konto", "Beskrivning", "Belopp"]],
        body: rows,
        theme: "plain",
        styles: { fontSize: 12, textColor: "#111", halign: "left" },
        headStyles: { fontStyle: "bold", textColor: "#111" },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 32 },
          1: { cellWidth: 110 },
          2: { cellWidth: 34 },
        },
        didDrawPage: (data) => {
          if (data.cursor) y = data.cursor.y + 8;
        },
      });

      y += 4;
    });

    // Resultatrad
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("Resultat", 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [["", "Belopp"]],
      body: [
        [
          { content: "Beräknat resultat", styles: { fontStyle: "bold" } },
          { content: formatSEK(resultat[year]), styles: { fontStyle: "bold", halign: "left" } },
        ],
      ],
      theme: "plain",
      styles: { fontSize: 12, textColor: "#111", halign: "left" },
      headStyles: { fontStyle: "bold", textColor: "#111" },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 142 },
        1: { cellWidth: 34 },
      },
      didDrawPage: (data) => {
        if (data.cursor) y = data.cursor.y + 8;
      },
    });

    doc.save("resultatrapport.pdf");
  };

  const handleExportCSV = () => {
    let csv = `Resultatrapport ${year}\n\n`;

    const grupper = [
      { titel: "Rörelsens intäkter", rader: data.intakter, isIntakt: true },
      { titel: "Rörelsens kostnader", rader: data.rorelsensKostnader, isIntakt: false },
      { titel: "Finansiella kostnader", rader: data.finansiellaKostnader, isIntakt: false },
    ];

    grupper.forEach(({ titel, rader, isIntakt }) => {
      csv += `${titel}\nKonto;Beskrivning;Belopp\n`;
      rader.forEach((grupp) => {
        grupp.konton.forEach((konto) => {
          csv +=
            [
              konto.kontonummer,
              `"${konto.beskrivning}"`,
              formatSEK(isIntakt ? -(konto[year] as number) : (konto[year] as number)),
            ].join(";") + "\n";
        });
        csv += `;Summa ${grupp.namn.toLowerCase()};${formatSEK(isIntakt ? -grupp.summering[year] : grupp.summering[year])}\n`;
      });
      csv += "\n";
    });

    csv += `Resultat\n;Beräknat resultat;${formatSEK(resultat[year])}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "resultatrapport.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderGrupper = (rader: KontoRad[], isIntakt = false, icon?: string) =>
    rader.map((grupp) => (
      <AnimeradFlik key={grupp.namn} title={grupp.namn} icon={icon || (isIntakt ? "💰" : "💸")}>
        <InreTabell
          rows={grupp.konton.map((konto) => ({
            label: `${konto.kontonummer} – ${konto.beskrivning}`,
            value: isIntakt ? -(konto[year] as number) : (konto[year] as number),
          }))}
          totalLabel={`Summa ${grupp.namn.toLowerCase()}`}
          totalValue={isIntakt ? -grupp.summering[year] : grupp.summering[year]}
        />
      </AnimeradFlik>
    ));

  return (
    <MainLayout>
      <div className="mx-auto px-4 text-white">
        <h1 className="text-3xl text-center mb-8">Resultatrapport</h1>
        <div className="flex gap-4 mb-8 justify-center">
          <Knapp text="Ladda ner PDF" onClick={handleExportPDF} />
          <Knapp text="Ladda ner CSV" onClick={handleExportCSV} />
        </div>

        {renderGrupper(data.intakter, true, "💰")}
        <Totalrad label="Summa rörelsens intäkter" values={{ [year]: intaktsSum[year] ?? 0 }} />

        <h2 className="text-xl font-semibold mt-10 mb-4">Rörelsens kostnader</h2>
        {renderGrupper(data.rorelsensKostnader, false, "💸")}
        <Totalrad label="Summa rörelsens kostnader" values={{ [year]: rorelsensSum[year] ?? 0 }} />

        <h2 className="text-xl font-semibold mt-10 mb-4">Finansiella kostnader</h2>
        {renderGrupper(data.finansiellaKostnader, false, "💸")}
        <Totalrad
          label="Summa finansiella kostnader"
          values={{ [year]: finansiellaSum[year] ?? 0 }}
        />

        <h2 className="text-xl font-semibold mt-10 mb-4">Resultat</h2>
        <Totalrad label="Beräknat resultat" values={{ [year]: resultat[year] }} />
      </div>
    </MainLayout>
  );
}
