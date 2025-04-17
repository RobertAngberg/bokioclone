"use client";

import { useEffect, useState } from "react";
import { useFakturaContext } from "./FakturaProvider";
import { getAllInvoices, deleteInvoice, updateFakturanummer } from "./actions";

export default function FakturorLista() {
  const [fakturor, setFakturor] = useState<any[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editedNummer, setEditedNummer] = useState("");
  const { setFormData } = useFakturaContext();

  useEffect(() => {
    (async () => {
      const res = await getAllInvoices();
      if (res.success) setFakturor(res.invoices || []);
    })();
  }, []);

  const laddaFaktura = (f: any) => setFormData({ ...f, artiklar: f.artiklar || [] });

  const handleDelete = async (id: number) => {
    const res = await deleteInvoice(id);
    if (res.success) setFakturor((p) => p.filter((f) => f.id !== id));
  };

  const handleSaveNummer = async (id: number) => {
    const res = await updateFakturanummer(id, editedNummer);
    if (res.success) {
      setFakturor((prev) =>
        prev.map((f) => (f.id === id ? { ...f, fakturanummer: editedNummer } : f))
      );
      setEditId(null);
    }
  };

  return (
    <div className="space-y-2">
      {fakturor.length === 0 ? (
        <p className="text-sm text-gray-300">Inga sparade fakturor hittades.</p>
      ) : (
        fakturor.map((f) => (
          <div key={f.id} className="flex items-center gap-2 group transition">
            {/* Ladda */}
            <button
              onClick={() => laddaFaktura(f)}
              className="flex-1 flex items-center justify-between px-6 py-2 bg-cyan-800 hover:bg-cyan-700 rounded-lg text-left"
            >
              <span>
                {f.fakturanummer} – {f.kundnamn}
              </span>
              <span className="ml-auto text-sm">
                {new Date(f.fakturadatum).toLocaleDateString("sv-SE")}
              </span>
            </button>

            {/* Redigera */}
            {editId === f.id ? (
              <>
                <input
                  value={editedNummer}
                  onChange={(e) => setEditedNummer(e.target.value)}
                  className="w-32 shrink-0 px-3 py-2 text-black rounded-lg"
                />
                <button
                  onClick={() => handleSaveNummer(f.id)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shrink-0"
                >
                  Spara
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditId(f.id);
                  setEditedNummer(f.fakturanummer);
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shrink-0"
              >
                ✏️ Ändra
              </button>
            )}

            {/* Ta bort */}
            <button
              onClick={() => handleDelete(f.id)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shrink-0"
            >
              ❌
            </button>
          </div>
        ))
      )}
    </div>
  );
}
