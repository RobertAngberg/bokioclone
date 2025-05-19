// #region
"use client";

import React, { useEffect, useState } from "react";
import MainLayout from "../../_components/MainLayout";
import AnimeradFlik from "../../_components/AnimeradFlik";
import InreTabell from "../../_components/InreTabell";
import Knapp from "../../_components/Knapp";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type TransactionItem = {
  kontonummer: string;
  beskrivning: string;
  transaktionsdatum: string;
  fil: string;
  debet: number;
  kredit: number;
};

type GroupedTransactions = {
  [konto: string]: TransactionItem[];
};

type Props = {
  initialData: TransactionItem[];
  företagsnamn?: string;
  organisationsnummer?: string;
};
// #endregion

export default function Huvudbok({ initialData, företagsnamn, organisationsnummer }: Props) {
  const [groupedData, setGroupedData] = useState<GroupedTransactions>({});

  useEffect(() => {
    const grouped = initialData.reduce<GroupedTransactions>((acc, item) => {
      const key = item.kontonummer;
      (acc[key] ??= []).push({
        ...item,
        transaktionsdatum: item.transaktionsdatum.slice(0, 10),
      });
      return acc;
    }, {});
    setGroupedData(grouped);
  }, [initialData]);

  // Rensar ALLA icke-ASCII-tecken från SEK-format
  const formatSEK = (val: number) =>
    val
      .toLocaleString("sv-SE", { style: "currency", currency: "SEK" })
      .replace(/[^0-9a-zA-Z,.\- ]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  // PDF-export med jsPDF-AutoTable
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Header med extra marginal och företagsnamn i bold
    let y = 30;
    doc.setFontSize(32);
    doc.text("Huvudbok", 105, y, { align: "center" });

    y += 20; // extra marginal under "Huvudbok"

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(String(företagsnamn ?? ""), 14, y);

    doc.setFont("helvetica", "normal");
    y += 6;
    doc.text(String(organisationsnummer ?? ""), 14, y);

    y += 6;
    const utskriftsdatum = new Date().toISOString().slice(0, 10);
    doc.text(`Utskriven: ${utskriftsdatum}`, 14, y);

    y += 18; // extra marginal under header

    const sorted = Object.entries(groupedData).sort(([a], [b]) => a.localeCompare(b, "sv-SE"));

    let lastSection: string | null = null;

    sorted.forEach(([kontoNummer, items]) => {
      const kontoNamn = items[0]?.beskrivning || "";
      const konto = `${kontoNummer} – ${kontoNamn}`;

      let section =
        kontoNummer === "1930"
          ? "Företagskonto"
          : /^26(1|2|3|4)/.test(kontoNummer)
            ? "Momskonton"
            : `Kontoklass ${kontoNummer.charAt(0)}XXX`;

      const showHeading = section !== lastSection;
      lastSection = section;

      let saldo = 0;

      if (showHeading) {
        doc.setFontSize(15);
        doc.text(section, 14, y);
        y += 8;
      }

      doc.setFontSize(12);
      doc.text(konto, 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.text("Ingående balans 0,00 kr", 14, y);
      y += 6;

      // Tabell-data
      const rows = items.map((item) => {
        saldo += (item.debet ?? 0) - (item.kredit ?? 0);
        return [
          item.transaktionsdatum,
          item.beskrivning,
          item.debet ? formatSEK(item.debet) : "",
          item.kredit ? formatSEK(item.kredit) : "",
          formatSEK(saldo),
        ];
      });

      autoTable(doc, {
        startY: y,
        head: [["Datum", "Beskrivning", "Debet", "Kredit", "Saldo"]],
        body: rows,
        theme: "plain",
        styles: { fontSize: 10, textColor: "#111", halign: "left" },
        headStyles: { fontStyle: "bold", textColor: "#111" },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          if (data.cursor) {
            y = data.cursor.y + 8;
          }
        },
      });

      doc.setFontSize(10);
      doc.text(`Utgående balans ${formatSEK(saldo)}`, 200, y - 2, { align: "right" });
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 22;
      }
    });

    doc.save("huvudbok.pdf");
  };

  // CSV-export
  const handleExportCSV = () => {
    let csv = "Konto;Beskrivning;Datum;Debet;Kredit;Saldo\n";
    Object.entries(groupedData).forEach(([kontoNummer, items]) => {
      let saldo = 0;
      items.forEach((item) => {
        saldo += (item.debet ?? 0) - (item.kredit ?? 0);
        csv +=
          [
            kontoNummer,
            `"${item.beskrivning}"`,
            item.transaktionsdatum,
            item.debet ? formatSEK(item.debet) : "",
            item.kredit ? formatSEK(item.kredit) : "",
            formatSEK(saldo),
          ].join(";") + "\n";
      });
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "huvudbok.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <MainLayout>
      <h1 className="mb-8 text-3xl text-center text-white">Huvudbok</h1>
      <div className="flex mb-6 gap-4">
        <Knapp text="Ladda ner PDF" onClick={handleExportPDF} />
        <Knapp text="Ladda ner CSV" onClick={handleExportCSV} />
      </div>
      {/* Din vanliga UI */}
      <div>
        <div className="space-y-6">
          {(() => {
            const sorted = Object.entries(groupedData).sort(([a], [b]) =>
              a.localeCompare(b, "sv-SE")
            );

            let lastSection: string | null = null;

            return sorted.map(([kontoNummer, items]) => {
              const kontoNamn = items[0]?.beskrivning || "";
              const konto = `${kontoNummer} – ${kontoNamn}`;

              let section =
                kontoNummer === "1930"
                  ? "Företagskonto"
                  : /^26(1|2|3|4)/.test(kontoNummer)
                    ? "Momskonton"
                    : `Kontoklass ${kontoNummer.charAt(0)}XXX`;

              const showHeading = section !== lastSection;
              lastSection = section;

              return (
                <div key={konto}>
                  {showHeading && (
                    <h2 className="text-xl text-white font-semibold mb-2">{section}</h2>
                  )}
                  <AnimeradFlik title={konto} icon="📂" forceOpen={true}>
                    {(() => {
                      let saldo = 0;
                      const rows = items.map((item) => {
                        saldo += (item.debet ?? 0) - (item.kredit ?? 0);
                        return {
                          kontonummer: item.kontonummer,
                          beskrivning: item.beskrivning,
                          datum: item.transaktionsdatum,
                          fil: item.fil,
                          debet: item.debet,
                          kredit: item.kredit,
                          saldo,
                        };
                      });
                      return (
                        <div className="space-y-2">
                          <div className="text-sm text-white font-semibold mb-2">
                            Ingående balans 0,00 kr
                          </div>
                          <InreTabell rows={rows} />
                          <div className="text-sm text-white font-semibold mt-4 text-right">
                            Utgående balans {formatSEK(saldo)}
                          </div>
                        </div>
                      );
                    })()}
                  </AnimeradFlik>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </MainLayout>
  );
}
