//#region Huvud
"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Knapp from "../../_components/Knapp";
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
    clone.style.display = "block";
    console.log("Klonad print-area HTML:", clone.innerHTML); // <-- Här ser du om företagsuppgifterna finns med

    // Hitta företagsdelen i klonen och sätt style direkt
    const företagDiv = clone.querySelector(".faktura-företag") as HTMLElement;
    if (företagDiv) {
      // Byt ut <br> mot <div> för varje rad om det finns <br>
      if (företagDiv.innerHTML.includes("<br")) {
        const lines = företagDiv.innerHTML
          .split(/<br\s*\/?>/i)
          .map((line) => line.trim())
          .filter(Boolean);
        företagDiv.innerHTML = lines.map((line) => `<div>${line}</div>`).join("");
      }
      företagDiv.style.lineHeight = "1";
      företagDiv.style.marginBottom = "0";
      Array.from(företagDiv.children).forEach((child) => {
        if (child instanceof HTMLElement) {
          child.style.margin = "0";
          child.style.padding = "0";
        }
      });
    }

    // Lägg även till en <style> som backup
    const style = document.createElement("style");
    style.innerHTML = `
      .faktura-företag {
        line-height: 10 !important;
        margin-bottom: 0 !important;
      }
      .faktura-företag p,
      .faktura-företag div,
      .faktura-företag span {
        margin: 0 !important;
        padding: 0 !important;
      }
    `;
    clone.prepend(style);

    cloneWrapper.appendChild(clone);
    document.body.appendChild(cloneWrapper);

    try {
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
      if (cloneWrapper.parentNode) {
        document.body.removeChild(cloneWrapper);
      }
    }
  };

  return <Knapp onClick={handleExport} text="📤 Exportera PDF" />;
}
