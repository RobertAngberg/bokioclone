import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { Information } from "./Information";
import { Comment } from "./Comment";

// Define the Step2Props interface
interface Step2Props {
  setCurrentStep: (step: number) => void;
  fil: File | null;
  setFil: (file: File | null) => void;
  pdfUrl: string | null;
  setPdfUrl: (url: string | null) => void;
  belopp: number | null;
  setBelopp: (amount: number | null) => void;
  transaktionsdatum: string | null;
  setTransaktionsdatum: (date: string | null) => void;
  kommentar: string | null;
  setKommentar: (comment: string | null) => void;
}

function Step2({
  setCurrentStep,
  fil,
  setFil,
  pdfUrl,
  setPdfUrl,
  belopp,
  setBelopp,
  transaktionsdatum,
  setTransaktionsdatum,
  kommentar,
  setKommentar,
}: Step2Props) {
  const [zoomLevel, setZoomLevel] = useState(1); // State for zoom level

  const handleSubmit1 = () => {
    setCurrentStep(3);
  };

  // Zoom in function
  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.2, 3)); // Max zoom at 3x
  };

  // Zoom out function
  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.2, 1)); // Min zoom at 1x
  };

  return (
    <>
      <h1 className="mb-10 text-4xl font-bold text-center text-white">Steg 2: Fyll i uppgifter</h1>
      <div className="flex flex-col-reverse justify-between h-auto max-w-4xl px-4 mx-auto md:flex-row md:px-0">
        <div className="w-full mb-10 text-white md:w-2/5 md:mb-0">
          <FileUpload
            fil={fil}
            setFil={setFil}
            setPdfUrl={setPdfUrl}
            setBelopp={setBelopp}
            setTransaktionsdatum={setTransaktionsdatum}
          />

          <Information
            belopp={belopp ?? 0}
            setBelopp={setBelopp}
            transaktionsdatum={transaktionsdatum}
            setTransaktionsdatum={setTransaktionsdatum}
          />

          <Comment kommentar={kommentar ?? ""} setKommentar={setKommentar} />

          <button
            type="submit"
            className="flex items-center justify-center w-full px-4 py-6 font-bold text-white rounded bg-cyan-600 hover:bg-cyan-700"
            onClick={handleSubmit1}
          >
            Bokför
          </button>
        </div>

        {/* Right section (PDF or image display) with reduced width and responsive height */}
        <div className="relative flex flex-col items-center justify-center w-full h-auto md:w-3/5">
          {/* Placeholder Text */}
          {!pdfUrl && !fil && <p className="text-gray-500">Ditt underlag kommer att visas här</p>}

          {/* Display PDF */}
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full h-auto max-w-full"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top left", // Ensures it zooms downwards and rightwards
              }}
              title="PDF Viewer"
            ></iframe>
          )}

          {/* Display uploaded image - hugging the left side */}
          {fil && (
            <img
              src={URL.createObjectURL(fil)}
              alt="Uploaded"
              className="object-contain object-left w-auto h-auto max-w-full"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top left", // Ensures it zooms downwards and rightwards
              }}
            />
          )}

          {/* Zoom buttons (visible only after upload) */}
          {(fil || pdfUrl) && (
            <>
              <button
                onClick={handleZoomIn}
                className="absolute z-10 flex items-center justify-center w-12 h-12 mb-2 text-white rounded-full top-2 right-2 bg-cyan-600 hover:bg-cyan-700"
              >
                🔍+
              </button>
              <button
                onClick={handleZoomOut}
                className="absolute z-10 flex items-center justify-center w-12 h-12 text-white rounded-full top-16 right-2 bg-cyan-600 hover:bg-cyan-700"
              >
                🔍-
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export { Step2 };
