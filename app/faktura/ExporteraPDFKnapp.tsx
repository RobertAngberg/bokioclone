//#region Huvud
"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Knapp from "../_components/Knapp";
//#endregion

export default function ExporteraPDFKnapp() {
  const handleExport = async () => {
    const element = document.getElementById("print-area");

    if (!element) {
      console.error("❌ print-area not found in DOM");
      return;
    }

    // Skapa en wrapper för klonen
    const cloneWrapper = document.createElement("div");
    cloneWrapper.style.position = "fixed";
    cloneWrapper.style.top = "0";
    cloneWrapper.style.left = "0";
    cloneWrapper.style.width = "auto";
    cloneWrapper.style.height = "auto";
    cloneWrapper.style.opacity = "0";
    cloneWrapper.style.pointerEvents = "none";
    cloneWrapper.style.zIndex = "-1";
    cloneWrapper.style.background = "#fff";

    // Klona print-ytan
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.display = "block"; // säkerställ att den är block och layoutas
    cloneWrapper.appendChild(clone);

    document.body.appendChild(cloneWrapper);

    try {
      // Vänta lite så layouten hinner skapas
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: "#ffffff",
      });

      if (canvas.width === 0 || canvas.height === 0) {
        console.error("❌ Canvas has invalid dimensions:", canvas.width, canvas.height);
        return;
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF("p", "mm", "a4");
      const width = 210; // A4 width in mm
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, width, height);
      pdf.save("faktura.pdf");
    } catch (error) {
      console.error("❌ Error exporting PDF:", error);
    } finally {
      // Ta bort wrapper och klon från DOM
      if (cloneWrapper.parentNode) {
        document.body.removeChild(cloneWrapper);
      }
    }
  };

  return <Knapp onClick={handleExport} text="💾 Exportera PDF" />;
}
