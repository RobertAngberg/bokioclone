"use client";
import { useState } from "react";
import Knapp from "../../_components/Knapp";
import { useFakturaContext } from "../FakturaProvider";
import { generatePDFAsBase64 } from "../../_utils/pdfGenerator";

interface Props {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function SkickaEpost({ onSuccess, onError }: Props) {
  const [isSending, setIsSending] = useState(false);
  const { formData } = useFakturaContext();

  const skickaTestmail = async () => {
    setIsSending(true);

    try {
      // Generera PDF med den delade funktionen
      const pdfBase64 = await generatePDFAsBase64();

      // Skapa fakturanummer med nollutfyllnad
      const fakturaNr = formData.fakturanummer
        ? formData.fakturanummer.toString().padStart(4, "0")
        : "faktura";

      // Skicka e-post med PDF-bilaga
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faktura: formData,
          pdfAttachment: pdfBase64,
          filename: `Faktura-${fakturaNr}.pdf`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte skicka e-post");
      }

      alert("✅ Faktura skickad! Kolla din inbox.");
      onSuccess?.();
    } catch (error) {
      console.error("❌ E-postfel:", error);
      const errorMessage = error instanceof Error ? error.message : "Okänt fel";
      alert(`❌ Kunde inte skicka faktura: ${errorMessage}`);
      onError?.(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow mt-4">
      <h3 className="text-white text-xl mb-4">Skicka faktura</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-300 mb-2">Skicka fakturan som e-post med bifogad PDF</p>
          <p className="text-slate-400 text-sm">
            {process.env.NODE_ENV === "development" ? (
              <>
                <span className="text-amber-400">⚠️ Utvecklingsläge:</span> E-posten skickas till
                din verifierade adress, inte till kundens e-post.
              </>
            ) : (
              <>
                E-posten skickas till{" "}
                <code className="bg-slate-700 px-1 py-0.5 rounded">
                  {formData.kundemail || "info@bokför.com"}
                </code>
              </>
            )}
          </p>
        </div>
        <Knapp
          onClick={skickaTestmail}
          text={isSending ? "📤 Skickar..." : "📧 Skicka faktura"}
          disabled={isSending || !formData.fakturanummer}
        />
      </div>
    </div>
  );
}
