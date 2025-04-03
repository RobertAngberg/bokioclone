import React, { useEffect } from "react";

interface FakturaCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  textFields: { [key: string]: string };
  logoImage: HTMLImageElement | null;
  saveAsJPG: () => void;
}

function FakturaCanvas({ canvasRef, textFields, logoImage, saveAsJPG }: FakturaCanvasProps) {
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        if (logoImage) {
          let scale = Math.min(200 / logoImage.width, 125 / logoImage.height);
          let width = logoImage.width * scale;
          let height = logoImage.height * scale;
          let x = canvasRef.current.width - width;
          ctx.drawImage(logoImage, x - 40, 35, width, height);
        }

        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "#222";
        ctx.fillText("Faktura", 40, 100);

        ctx.font = "bold 16px Arial";
        ctx.fillText(textFields.foretagsnamn, 40, 200);
        ctx.font = "16px Arial";
        ctx.fillText(textFields.adress, 40, 220);
        ctx.fillText(textFields.postnummerStad, 40, 240);
        ctx.fillText(textFields.telefonnummer, 40, 260);
        ctx.font = "bold 16px Arial";
        ctx.fillText(textFields.betalmetod, 40, 300);

        ctx.font = "bold 16px Arial";
        ctx.fillText(textFields.kundForetag, 400, 200);
        ctx.font = "16px Arial";
        ctx.fillText(textFields.kundNamn, 400, 220);
        ctx.fillText(textFields.kundAdress, 400, 240);
        ctx.fillText(textFields.kundPostnummerStad, 400, 260);

        ctx.font = "bold 16px Arial";
        ctx.fillText("Fakturanummer", 40, 380);
        ctx.fillText("Kundnummer", 180, 380);
        ctx.fillText("Fakturadatum", 320, 380);
        ctx.fillText("Förfallodatum", 480, 380);

        ctx.font = "16px Arial";
        ctx.fillText(textFields.fakturanummer, 40, 410);
        ctx.fillText(textFields.kundnummer, 180, 410);
        ctx.fillText(textFields.fakturadatum, 320, 410);
        ctx.fillText(textFields.forfallodatum, 480, 410);

        const tableStartX = 40;
        const tableStartY = 500;
        const columnWidth = 126;
        const rowHeight = 25;
        const headerHeight = rowHeight * 2 - 10;

        const headers = ["Beskr.", "Antal", "Á pris", "Moms", "Belopp"];
        ctx.fillStyle = "#CCC";
        headers.forEach((_, index) => {
          ctx.fillRect(
            tableStartX + columnWidth * index,
            tableStartY - headerHeight,
            columnWidth,
            headerHeight
          );
        });

        ctx.font = "bold 16px Arial";
        ctx.fillStyle = "#222";
        ctx.textBaseline = "middle";
        headers.forEach((header, index) => {
          const textX = tableStartX + columnWidth * index + 20;
          const textY = tableStartY - headerHeight / 2;
          ctx.fillText(header, textX, textY);
        });

        const rows = JSON.parse(textFields.rader || "[]");
        ctx.font = "16px Arial";
        rows.forEach((row: any, i: number) => {
          ctx.fillText(row.beskrivning, 40, tableStartY + rowHeight * i);
          ctx.fillText(row.antal, 190, tableStartY + rowHeight * i);
          ctx.fillText(row.apris, 310, tableStartY + rowHeight * i);
          ctx.fillText(row.moms, 440, tableStartY + rowHeight * i);
          ctx.fillText(row.belopp, 565, tableStartY + rowHeight * i);
        });

        ctx.font = "16px Arial";
        ctx.fillText("Belopp före moms:", 40, 600);
        ctx.fillText("Moms totalt:", 40, 630);
        ctx.fillText("Summa att betala:", 40, 670);

        ctx.fillText(textFields.beloppForeMoms, 220, 600);
        ctx.fillText(textFields.momsTotalt, 220, 630);
        ctx.font = "bold 20px Arial";
        ctx.fillText(textFields.summaAttBetala, 220, 670);

        ctx.font = "11px Arial";
        ctx.fillText(textFields.fotForetag, 40, 860);
        ctx.fillText(textFields.fotAdress, 40, 880);
        ctx.fillText(textFields.fotPostort, 40, 900);
        ctx.fillText(textFields.fotOrgnummer, 40, 920);
        ctx.fillText(textFields.fotMomsnummer, 40, 940);

        ctx.fillText(textFields.fotKontakt, 530, 860);
        ctx.fillText(textFields.fotTelefon, 530, 880);
        ctx.fillText(textFields.fotEmail, 530, 900);
        ctx.fillText(textFields.fotHemsida, 530, 920);
        ctx.fillText(textFields.fotSocial, 530, 940);
      }
    }
  }, [textFields, logoImage, canvasRef]);

  return <canvas ref={canvasRef} width="715" height="1011" className="bg-white" />;
}

export { FakturaCanvas };
