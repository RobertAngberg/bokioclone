"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ExportPdfButton() {
  const handleExport = async () => {
    const element = document.getElementById("print-area");

    if (!element) {
      console.error("❌ print-area not found in DOM");
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Skarpare bild
        useCORS: false,
        logging: false,
        backgroundColor: "#ffffff",
      });

      if (canvas.width === 0 || canvas.height === 0) {
        console.error("❌ Canvas has invalid dimensions:", canvas.width, canvas.height);
        return;
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const pdf = new jsPDF("p", "mm", "a4");
      const width = 210;
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, width, height);
      pdf.save("faktura.pdf");
    } catch (error) {
      console.error("❌ Error exporting PDF:", error);
    }
  };

  return (
    <button
      onClick={handleExport}
      className="h-10 px-4 bg-cyan-700 text-white rounded hover:bg-cyan-800 print:hidden"
    >
      💾 Exportera PDF
    </button>
  );
}
