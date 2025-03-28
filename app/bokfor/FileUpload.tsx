import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";

interface FileUploadProps {
  setFil: (file: File | null) => void;
  setPdfUrl: (url: string) => void;
  setTransaktionsdatum: (datum: string) => void;
  setBelopp: (belopp: number) => void;
  fil: File | null;
}

function FileUpload({ setFil, setPdfUrl, setTransaktionsdatum, setBelopp, fil }: FileUploadProps) {
  const [recognizedText, setRecognizedText] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      // PDF
      if (file.type === "application/pdf") {
        const fileUrl = URL.createObjectURL(file);
        setPdfUrl(fileUrl);

        // Image
      } else if (file.type === "image/jpeg" || file.type === "image/png") {
        setFil(file);
      }
    }
  };

  useEffect(() => {
    const scanImage = async () => {
      if (fil) {
        const result = await Tesseract.recognize(fil, "swe");
        setRecognizedText(result.data.text);
      }
    };

    scanImage();
  }, [fil]);

  useEffect(() => {
    const chatGPT = async () => {
      if (recognizedText) {
        try {
          const response = await fetch("/api/chatgpt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: recognizedText }), // Updated to send 'text' key
          });

          if (!response.ok) {
            // Handle HTTP errors
            const errorData = await response.json();
            console.error("Error from API:", errorData.error);
            return;
          }

          const data = await response.json();

          // Parse the JSON response from the server
          const parsedData = JSON.parse(data.text);

          // Validate and set datum
          const parsedDate = new Date(parsedData.datum);

          if (!isNaN(parsedDate.getTime())) {
            setTransaktionsdatum(parsedData.datum);
          } else {
            setTransaktionsdatum("");
          }

          // Validate and set belopp
          if (!isNaN(parseFloat(parsedData.belopp))) {
            setBelopp(parsedData.belopp);
          } else {
            setBelopp(0);
          }
        } catch (error) {
          console.error("Error fetching from API:", error);
        }
      }
    };

    chatGPT();
  }, [recognizedText]);

  return (
    <>
      <input
        type="file"
        id="fileUpload"
        accept="application/pdf,image/png,image/jpeg"
        onChange={handleFileChange}
        required
        style={{ display: "none" }}
      />
      <label
        htmlFor="fileUpload"
        className="flex items-center justify-center px-4 py-2 mb-6 font-bold text-white rounded cursor-pointer bg-cyan-600 hover:bg-cyan-700"
      >
        Välj fil
      </label>
    </>
  );
}

export { FileUpload };
