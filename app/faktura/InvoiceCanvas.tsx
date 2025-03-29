import React, { useEffect } from "react";

interface InvoiceCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  textFields: { [key: string]: string };
  logoImage: HTMLImageElement | null;
  saveAsJPG: () => void;
}

function InvoiceCanvas({ canvasRef, textFields, logoImage, saveAsJPG }: InvoiceCanvasProps) {
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        // Clear the canvas
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Set the entire canvas background to white
        ctx.fillStyle = "#FFF"; // White color
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        if (logoImage) {
          // Här sätts maxhöjd och maxbredd för loggan
          let scale = Math.min(200 / logoImage.width, 125 / logoImage.height);
          let width = logoImage.width * scale;
          let height = logoImage.height * scale;
          let x = canvasRef.current.width - width;

          // x - 30 är 30px padding från högerkanten.. + 5 padding från toppen
          ctx.drawImage(logoImage, x - 40, 30 + 5, width, height);
        }

        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "#222"; // Reset fillStyle, för textfärg
        ctx.fillText("Faktura", 40, 100);

        // Uppgifter, egna företaget
        ctx.font = "bold 16px Arial";
        ctx.fillText(textFields.Företagsnamn, 40, 200);
        ctx.font = "16px Arial";
        ctx.fillText(textFields.Adress, 40, 220);
        ctx.fillText(textFields["Postnummer och stad"], 40, 240);
        ctx.fillText(textFields.Telefonnummer, 40, 260);
        ctx.font = "bold 16px Arial";
        ctx.fillText(textFields.Bankgiro, 40, 300);

        // Uppgifter, kunden
        ctx.font = "bold 16px Arial";
        ctx.fillText(textFields["Företagsnamn, kund"], 400, 200);
        ctx.font = "16px Arial";
        ctx.fillText(textFields["Namn, kund"], 400, 220);
        ctx.fillText(textFields["Adress, kund"], 400, 240);
        ctx.fillText(textFields["Postnummer och stad, kund"], 400, 260);

        // Betalningsuppgifter, headers
        ctx.font = "bold 16px Arial";
        ctx.fillText("Fakturanummer", 40, 380);
        ctx.fillText("Kundnummer", 180, 380);
        ctx.fillText("Fakturadatum", 320, 380);
        ctx.fillText("Förfallodatum", 480, 380);

        // Betalningsuppgifter, info
        ctx.font = "16px Arial";
        ctx.fillText(textFields["Fakturanummer"], 40, 410);
        ctx.fillText(textFields["Kundnummer"], 180, 410);
        ctx.fillText(textFields["Fakturadatum"], 320, 410);
        ctx.fillText(textFields["Förfallodatum"], 480, 410);

        // Transaktionen
        const tableStartX = 40;
        const tableStartY = 500;
        const columnWidth = 126;
        const rowHeight = 25;
        const headerHeight = rowHeight * 2 - 10;

        const headers = ["Beskr.", "Antal", "Á pris", "Moms", "Belopp"];

        // Header bakgrund
        ctx.fillStyle = "#CCC";
        headers.forEach((_, index) => {
          ctx.fillRect(
            tableStartX + columnWidth * index,
            tableStartY - headerHeight,
            columnWidth,
            headerHeight
          );
        });

        // Header text
        ctx.font = "bold 16px Arial";
        ctx.fillStyle = "#222"; // Reset fillStyle, för textfärg
        ctx.textBaseline = "middle";
        headers.forEach((header, index) => {
          const textX = tableStartX + columnWidth * index + 20;
          const textY = tableStartY - headerHeight / 2; // Centrera vertical
          ctx.fillText(header, textX, textY);
        });

        // Transaktionsdata
        ctx.font = "16px Arial";
        ctx.fillText(textFields["Beskrivning"], 40, 520);
        ctx.fillText(textFields["Antal"], 190, 520);
        ctx.fillText(textFields["Apris"], 310, 520);
        ctx.fillText(textFields["Moms"], 440, 520);
        ctx.fillText(textFields["Belopp"], 565, 520);

        // Totaler
        ctx.font = "16px Arial";
        ctx.fillText("Belopp före moms:", 40, 600);
        ctx.fillText("Moms totalt:", 40, 630);
        ctx.fillText("Summa att betala:", 40, 670);

        ctx.fillText(textFields["Belopp före moms"], 220, 600);
        ctx.fillText(textFields["Moms totalt"], 220, 630);
        ctx.font = "bold 20px Arial";
        ctx.fillText(textFields["Summa att betala"], 220, 670);

        // Fot kolumn 1
        ctx.font = "11px Arial";
        ctx.fillText(textFields["Fot, företagsnamn"], 40, 860);
        ctx.fillText(textFields["Fot, adress"], 40, 880);
        ctx.fillText(textFields["Fot, postnummer och stad"], 40, 900);
        ctx.fillText(textFields["Fot, orgnummer"], 40, 920);
        ctx.fillText(textFields["Fot, momsnummer"], 40, 940);

        // Fot kolumn 2
        ctx.fillText(textFields["Fot, kontaktperson"], 530, 860);
        ctx.fillText(textFields["Fot, telefonnummer"], 530, 880);
        ctx.fillText(textFields["Fot, email"], 530, 900);
        ctx.fillText(textFields["Fot, hemsida"], 530, 920);
        ctx.fillText(textFields["Fot, social media"], 530, 940);
      }
    }
  }, [textFields, logoImage, canvasRef]);

  return (
    <>
      <canvas ref={canvasRef} width="715" height="1011" className="bg-white" />
    </>
  );
}

export { InvoiceCanvas };
