"use client";

import { useFakturaContext } from "./FakturaProvider";
import { useState } from "react";
import { saveInvoice, sparaFavoritArtikel } from "./actions";
import type { Artikel } from "./actions";

export default function ProdukterTjanster() {
  const { formData, setFormData } = useFakturaContext();

  const [nyArtikel, setNyArtikel] = useState({
    beskrivning: "",
    antal: "1",
    prisPerEnhet: "0",
    moms: "25",
    valuta: "SEK",
    typ: "vara", // "vara" eller "tjänst"
  });

  const [läggTillSomFavorit, setLäggTillSomFavorit] = useState(false);

  const sparaFaktura = async (artiklar: Artikel[]) => {
    const fd = new FormData();
    try {
      fd.append("artiklar", JSON.stringify(artiklar));
    } catch (err) {
      console.error("❌ JSON.stringify artiklar fail:", err);
      return;
    }

    Object.entries(formData).forEach(([k, v]) => {
      if (k !== "artiklar" && v !== undefined && v !== null) {
        fd.append(k, String(v));
      }
    });

    const res = await saveInvoice(fd);
    if (!res.success) {
      alert("❌ Kunde inte spara fakturan");
    } else {
      console.log("✅ Faktura sparad");
    }
  };

  const handleAddArtikel = async () => {
    const artikel: Artikel = {
      beskrivning: nyArtikel.beskrivning,
      antal: Number(nyArtikel.antal),
      prisPerEnhet: Number(nyArtikel.prisPerEnhet),
      moms: Number(nyArtikel.moms),
      valuta: nyArtikel.valuta,
      typ: nyArtikel.typ as "vara" | "tjänst",
    };

    const updatedArtiklar = [...(formData.artiklar || []), artikel];

    setFormData((prev) => ({
      ...prev,
      artiklar: updatedArtiklar,
    }));

    setNyArtikel({
      beskrivning: "",
      antal: "1",
      prisPerEnhet: "0",
      moms: "25",
      valuta: "SEK",
      typ: "vara",
    });

    setLäggTillSomFavorit(false);

    await sparaFaktura(updatedArtiklar);

    if (läggTillSomFavorit) {
      await sparaFavoritArtikel(artikel);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNyArtikel((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (index: number) => {
    const confirmed = confirm("Vill du verkligen ta bort artikeln?");
    if (!confirmed) return;

    const updated = [...(formData.artiklar || [])];
    updated.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      artiklar: updated,
    }));

    await sparaFaktura(updated);
  };

  return (
    <div className="space-y-6">
      {formData.artiklar?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-white">Tillagda artiklar</h3>
          <ul className="space-y-2">
            {formData.artiklar.map((a, idx) => (
              <li key={idx} className="p-3 bg-slate-800 rounded flex items-center justify-between">
                <div className="text-white">
                  {a.typ === "tjänst" ? "🛠" : "📦"} {a.beskrivning} – {a.antal} x {a.prisPerEnhet}{" "}
                  {a.valuta} ({a.moms}% moms)
                </div>
                <button onClick={() => handleDelete(idx)} className="hover:text-red-600 ml-4">
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 text-sm text-white">Beskrivning</label>
          <input
            name="beskrivning"
            placeholder="Beskrivning"
            value={nyArtikel.beskrivning}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-white">Antal</label>
          <input
            name="antal"
            type="number"
            min={0}
            value={nyArtikel.antal}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-white">Pris per enhet</label>
          <input
            name="prisPerEnhet"
            type="number"
            min={0}
            value={nyArtikel.prisPerEnhet}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-white">Valuta</label>
          <select
            name="valuta"
            value={nyArtikel.valuta}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
          >
            <option value="SEK">SEK</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm text-white">Moms</label>
          <select
            name="moms"
            value={nyArtikel.moms}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
          >
            <option value="25">25%</option>
            <option value="12">12%</option>
            <option value="6">6%</option>
            <option value="0">0%</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm text-white">Typ</label>
          <div className="flex gap-4 mt-1 text-white">
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
                checked={nyArtikel.typ === "tjanst"}
                onChange={handleChange}
              />
              Tjänster
            </label>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-white">
        <input
          type="checkbox"
          checked={läggTillSomFavorit}
          onChange={(e) => setLäggTillSomFavorit(e.target.checked)}
        />
        📌 Lägg till som favorit
      </label>

      <button
        onClick={handleAddArtikel}
        className="mt-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 rounded text-white"
      >
        ✔️ Lägg till och spara
      </button>
    </div>
  );
}
