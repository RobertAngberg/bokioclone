"use client";

import { useFakturaContext } from "./FakturaProvider";
import { useState } from "react";

export default function ProdukterTjanster() {
  const { formData, setFormData } = useFakturaContext();

  const [nyArtikel, setNyArtikel] = useState({
    beskrivning: "",
    antal: "1",
    prisPerEnhet: "0",
    moms: "25",
    valuta: "SEK",
    typ: "vara",
  });

  const handleAddArtikel = () => {
    const artikel = {
      beskrivning: nyArtikel.beskrivning,
      antal: Number(nyArtikel.antal),
      prisPerEnhet: Number(nyArtikel.prisPerEnhet),
      moms: Number(nyArtikel.moms),
      valuta: nyArtikel.valuta,
      typ: nyArtikel.typ as "vara" | "tjänst",
    };

    setFormData((prev) => ({
      ...prev,
      artiklar: [...(prev.artiklar || []), artikel],
    }));

    setNyArtikel({
      beskrivning: "",
      antal: "1",
      prisPerEnhet: "0",
      moms: "25",
      valuta: "SEK",
      typ: "vara",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNyArtikel((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = (index: number) => {
    const updated = [...(formData.artiklar || [])];
    updated.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      artiklar: updated,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 text-sm">Beskrivning</label>
          <input
            name="beskrivning"
            placeholder="Beskrivning"
            value={nyArtikel.beskrivning}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-900 border border-slate-700"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Antal</label>
          <input
            name="antal"
            type="number"
            min={0}
            value={nyArtikel.antal}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-900 border border-slate-700"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Pris per enhet</label>
          <input
            name="prisPerEnhet"
            type="number"
            min={0}
            value={nyArtikel.prisPerEnhet}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-900 border border-slate-700"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">Valuta</label>
          <select
            name="valuta"
            value={nyArtikel.valuta}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-900 border border-slate-700"
          >
            <option value="SEK">SEK</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm">Moms</label>
          <select
            name="moms"
            value={nyArtikel.moms}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-900 border border-slate-700"
          >
            <option value="25">25%</option>
            <option value="12">12%</option>
            <option value="6">6%</option>
            <option value="0">0%</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm">Typ</label>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="typ"
                value="vara"
                checked={nyArtikel.typ === "vara"}
                onChange={handleChange}
              />
              Varor
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="typ"
                value="tjänst"
                checked={nyArtikel.typ === "tjänst"}
                onChange={handleChange}
              />
              Tjänster
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={handleAddArtikel}
        className="mt-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 rounded"
      >
        ➕ Lägg till artikel
      </button>

      {formData.artiklar?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Tillagda artiklar</h3>
          <ul className="space-y-2">
            {formData.artiklar.map((a, idx) => (
              <li key={idx} className="p-3 bg-slate-800 rounded flex items-center justify-between">
                <div>
                  {a.typ === "tjänst" ? "🛠" : "📦"} {a.beskrivning} – {a.antal} x {a.prisPerEnhet}{" "}
                  {a.valuta} ({a.moms}% moms)
                </div>
                <button
                  onClick={() => handleDelete(idx)}
                  className="text-red-400 hover:text-red-600 ml-4"
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
