// #region
"use client";

import MainLayout from "../../_components/MainLayout";
import AnimeradFlik from "../../_components/AnimeradFlik";
import Totalrad from "../../_components/Totalrad";
import InreTabell from "../../_components/InreTabell";
import Knapp from "../../_components/Knapp";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Transaktion = {
  id: string;
  datum: string | Date;
  belopp: number;
  beskrivning?: string;
};

type Konto = {
  kontonummer: string;
  beskrivning: string;
  saldo: number;
  transaktioner: Transaktion[];
};

type BalansData = {
  year: string;
  tillgangar: Konto[];
  skulderOchEgetKapital: Konto[];
};

type Props = {
  initialData: BalansData;
  företagsnamn?: string;
  organisationsnummer?: string;
};
// #endregion

export default function Balansrapport({ initialData, företagsnamn, organisationsnummer }: Props) {
  // Samma formatSEK som i huvudbok!
  const formatSEK = (val: number) =>
    val
      .toLocaleString("sv-SE", { style: "currency", currency: "SEK" })
      .replace(/[^0-9a-zA-Z,.\- ]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  function skapaBalansSammanställning(data: BalansData) {
    const { year, tillgangar, skulderOchEgetKapital } = data;

    const sumKonton = (konton: Konto[]) =>
      konton.reduce((sum, konto) => sum + (konto.saldo ?? 0), 0);

    const sumTillgangar = sumKonton(tillgangar);
    const sumSkulderEK = sumKonton(skulderOchEgetKapital);
    const differens = sumTillgangar - sumSkulderEK;

    return {
      year,
      tillgangar,
      skulderOchEgetKapital,
      sumTillgangar,
      sumSkulderEK,
      differens,
    };
  }

  const { year, tillgangar, skulderOchEgetKapital, sumTillgangar, sumSkulderEK, differens } =
    skapaBalansSammanställning(initialData);

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Header
    let y = 30;
    doc.setFontSize(32);
    doc.text("Balansrapport", 105, y, { align: "center" });

    // Margin bottom under rubrik
    y += 22;

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

    y += 18;

    // Dynamiska grupper
    const grupper = [
      { titel: "Tillgångar", konton: tillgangar },
      { titel: "Eget kapital och skulder", konton: skulderOchEgetKapital },
    ];

    grupper.forEach(({ titel, konton }) => {
      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.text(titel, 14, y);
      y += 8;

      // Tabellrader
      const rows: any[][] = konton.map((konto) => [
        konto.kontonummer,
        konto.beskrivning,
        formatSEK(konto.saldo),
      ]);

      // Summeringsrad med colSpan
      const summa = konton.reduce((sum, k) => sum + (k.saldo ?? 0), 0);
      rows.push([
        { content: `Summa ${titel.toLowerCase()}`, colSpan: 2, styles: { fontStyle: "bold" } },
        { content: formatSEK(summa), styles: { fontStyle: "bold", halign: "left" } },
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Konto", "Beskrivning", "Saldo"]],
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

    // Differens
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    if (differens === 0) {
      doc.setTextColor(0, 128, 0);
      doc.text("Balanskontroll", 14, y);
    } else {
      doc.setTextColor(200, 0, 0);
      doc.text(`Obalans (${formatSEK(differens)})`, 14, y);
    }
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    doc.save("balansrapport.pdf");
  };

  const handleExportCSV = () => {
    let csv = `Balansrapport ${year}\n\n`;
    csv += "Tillgångar\nKonto;Beskrivning;Saldo\n";
    tillgangar.forEach((konto) => {
      csv += [konto.kontonummer, `"${konto.beskrivning}"`, formatSEK(konto.saldo)].join(";") + "\n";
    });
    csv += `;Summa tillgångar;${formatSEK(sumTillgangar)}\n\n`;

    csv += "Eget kapital och skulder\nKonto;Beskrivning;Saldo\n";
    skulderOchEgetKapital.forEach((konto) => {
      csv += [konto.kontonummer, `"${konto.beskrivning}"`, formatSEK(konto.saldo)].join(";") + "\n";
    });
    csv += `;Summa eget kapital och skulder;${formatSEK(sumSkulderEK)}\n\n`;

    csv += differens === 0 ? "Balanskontroll\n" : `Obalans;${formatSEK(differens)}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "balansrapport.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderaKategori = (titel: string, icon: string, konton: Konto[]) => {
    const summa = konton.reduce((a, b) => a + b.saldo, 0);
    return (
      <AnimeradFlik title={titel} icon={icon}>
        <InreTabell
          rows={konton.map((konto) => ({
            label: `${konto.kontonummer} – ${konto.beskrivning}`,
            value: konto.saldo,
          }))}
          totalLabel={`Summa ${titel.toLowerCase()}`}
          totalValue={summa}
        />
      </AnimeradFlik>
    );
  };

  const omsättningstillgångar = tillgangar.filter((k) => /^19|^16|^17/.test(k.kontonummer));
  const anläggningstillgångar = tillgangar.filter((k) => /^1(0|1)/.test(k.kontonummer));
  const egetKapital = skulderOchEgetKapital.filter((k) => /^2(0|1)/.test(k.kontonummer));
  const kortfristigaSkulder = skulderOchEgetKapital.filter((k) => /^2(4|6)/.test(k.kontonummer));
  const långfristigaSkulder = skulderOchEgetKapital.filter((k) => /^2(3)/.test(k.kontonummer));
  const beräknatResultat = skulderOchEgetKapital.find((k) => k.kontonummer === "9999");

  return (
    <MainLayout>
      <div className="mx-auto px-4 text-white">
        <h1 className="text-3xl text-center mb-8">Balansrapport</h1>
        <div className="flex gap-4 mb-8 justify-center">
          <Knapp text="Ladda ner PDF" onClick={handleExportPDF} />
          <Knapp text="Ladda ner CSV" onClick={handleExportCSV} />
        </div>

        <h2 className="text-xl mb-4 border-b border-gray-500 pb-1">Tillgångar</h2>
        {renderaKategori("Anläggningstillgångar", "🏗️", anläggningstillgångar)}
        {renderaKategori("Omsättningstillgångar", "💼", omsättningstillgångar)}
        <Totalrad label="Summa tillgångar" values={{ [year]: sumTillgangar }} />

        <h2 className="text-xl mt-12 mb-4 border-b border-gray-500 pb-1">
          Eget kapital och skulder
        </h2>
        {renderaKategori("Eget kapital", "💰", [
          ...egetKapital,
          ...(beräknatResultat ? [beräknatResultat] : []),
        ])}
        {renderaKategori("Långfristiga skulder", "🏦", långfristigaSkulder)}
        {renderaKategori("Kortfristiga skulder", "⏳", kortfristigaSkulder)}
        <Totalrad label="Summa eget kapital och skulder" values={{ [year]: sumSkulderEK }} />

        <section className="mt-8">
          {differens === 0 ? (
            <p className="text-green-400 font-bold text-center text-lg">Balanskontroll – {year}</p>
          ) : (
            <p className="text-red-400 font-bold text-center text-lg">
              Obalans ({formatSEK(differens)})
            </p>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
