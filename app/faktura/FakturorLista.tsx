"use client";

import { useEffect, useState } from "react";
import { useFakturaContext } from "./FakturaProvider";
import { getAllInvoices, deleteInvoice, updateFakturanummer } from "./actions";

export default function FakturorLista() {
  const [isOpen, setIsOpen] = useState(false);
  const [fakturor, setFakturor] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editedNummer, setEditedNummer] = useState("");
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

  const handleDelete = async (fakturaId: number) => {
    const result = await deleteInvoice(fakturaId);
    if (result.success) {
      setFakturor((prev) => prev.filter((f) => f.id !== fakturaId));
    } else {
      console.error("❌ Misslyckades att radera faktura.");
    }
  };

  const handleSaveNummer = async (fakturaId: number) => {
    const result = await updateFakturanummer(fakturaId, editedNummer);
    if (result.success) {
      setFakturor((prev) =>
        prev.map((f) => (f.id === fakturaId ? { ...f, fakturanummer: editedNummer } : f))
      );
      setEditId(null);
    } else {
      console.error("❌ Misslyckades att uppdatera fakturanummer.");
    }
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
        <div className="bg-cyan-900 p-6 text-white space-y-2">
          {fakturor.length === 0 ? (
            <p className="text-sm text-gray-300">Inga sparade fakturor hittades.</p>
          ) : (
            fakturor.map((faktura) => (
              <div key={faktura.id} className="flex items-center gap-2">
                <button
                  onClick={() => laddaFaktura(faktura)}
                  className="flex-1 flex justify-between items-center text-left px-6 py-2 bg-cyan-800 rounded hover:bg-cyan-700"
                >
                  <span>
                    {faktura.fakturanummer} – {faktura.kundnamn}
                  </span>
                  <span className="ml-auto text-sm">
                    {new Date(faktura.fakturadatum).toLocaleDateString("sv-SE")}
                  </span>
                </button>

                {editId === faktura.id ? (
                  <>
                    <input
                      type="text"
                      value={editedNummer}
                      onChange={(e) => setEditedNummer(e.target.value)}
                      className="px-3 py-2 rounded text-black w-32 shrink-0"
                    />
                    <button
                      onClick={() => handleSaveNummer(faktura.id)}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded shrink-0"
                    >
                      Spara
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setEditId(faktura.id);
                      setEditedNummer(faktura.fakturanummer);
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded shrink-0"
                  >
                    ✏️ Ändra
                  </button>
                )}

                <button
                  onClick={() => handleDelete(faktura.id)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded shrink-0"
                >
                  ❌ Ta bort
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
