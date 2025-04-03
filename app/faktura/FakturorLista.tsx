"use client";

import { useEffect, useState } from "react";
import { useFakturaContext } from "./FakturaProvider";
import { getAllInvoices } from "./actions";

export default function FakturorLista() {
  const [isOpen, setIsOpen] = useState(false);
  const [fakturor, setFakturor] = useState<any[]>([]);
  const { setFormData } = useFakturaContext();

  useEffect(() => {
    const fetchFakturor = async () => {
      const result = await getAllInvoices();
      if (result.success) {
        setFakturor(result.invoices || []);
      } else {
        console.error("Misslyckades att hämta fakturor");
      }
    };

    fetchFakturor();
  }, []);

  const laddaFaktura = (faktura: any) => {
    setFormData({
      ...faktura,
      artiklar: faktura.artiklar || [],
    });
  };

  return (
    <div className="mb-4 rounded bg-cyan-950 p-1">
      <div
        className="flex justify-between items-center bg-cyan-950 px-4 py-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-bold text-white">Tidigare fakturor</h2>
        <span className="text-white">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="bg-cyan-900 p-6 text-white space-y-4">
          {fakturor.length === 0 ? (
            <p className="text-sm text-gray-300">Inga sparade fakturor hittades.</p>
          ) : (
            fakturor.map((faktura) => (
              <button
                key={faktura.id}
                onClick={() => laddaFaktura(faktura)}
                className="block w-full text-left px-4 py-2 bg-cyan-800 rounded hover:bg-cyan-700"
              >
                {faktura.fakturanummer} – {faktura.kundnamn}
                <span>{new Date(faktura.fakturadatum).toLocaleDateString("sv-SE")}</span>{" "}
                {/* Här konverterar vi Date till sträng */}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
