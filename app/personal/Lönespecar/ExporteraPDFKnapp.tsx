"use client";

interface ExporteraPDFKnappProps {
  onClick: () => void;
}

export default function ExporteraPDFKnapp({ onClick }: ExporteraPDFKnappProps) {
  return (
    <div className="mt-6 text-center">
      <button
        onClick={onClick}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
      >
        📄 Förhandsgranska & Exportera PDF
      </button>
    </div>
  );
}
