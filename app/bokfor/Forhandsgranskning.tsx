"use client";

import Image from "next/image";
import { useState } from "react";

interface ForhandsgranskningProps {
  fil: File | null;
  pdfUrl: string | null;
}

export default function Forhandsgranskning({ fil, pdfUrl }: ForhandsgranskningProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 1));

  const hasFile = fil || pdfUrl;

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-auto border-2 border-dashed border-gray-700 bg-slate-900 rounded-xl p-4 md:w-4/5 md:ml-4 mb-4 md:mb-0 transition">
      {!hasFile && <p className="text-gray-500 text-center">Ditt underlag kommer att visas här</p>}

      {fil?.type.startsWith("image/") && (
        <Image
          src={URL.createObjectURL(fil)}
          alt="Uploaded"
          width={800}
          height={600}
          className="object-contain object-left max-w-full rounded"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}
        />
      )}

      {pdfUrl && !fil?.type.startsWith("image/") && (
        <iframe
          src={pdfUrl}
          className="w-full h-auto max-w-full rounded"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}
          title="PDF Viewer"
        />
      )}

      {hasFile && (
        <div className="hidden md:block">
          <button
            onClick={handleZoomIn}
            className="absolute z-10 flex items-center justify-center w-10 h-10 text-white rounded-full top-2 right-2 bg-[#155e75] hover:bg-[#164e63] transition"
            title="Zooma in"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="absolute z-10 flex items-center justify-center w-10 h-10 text-white rounded-full top-14 right-2 bg-[#155e75] hover:bg-[#164e63] transition"
            title="Zooma ut"
          >
            −
          </button>
        </div>
      )}
    </div>
  );
}
