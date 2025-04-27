"use client";

import { useEffect, useState } from "react";
import { useFakturaContext } from "./FakturaProvider";
import { saveInvoice, sparaFavoritArtikel, hämtaSparadeArtiklar } from "./actions";
import Knapp from "../_components/Knapp";

export default function ProdukterTjanster() {
  const { formData, setFormData } = useFakturaContext();
  const [beskrivning, setBeskrivning] = useState("");
  const [antal, setAntal] = useState(1);
  const [prisPerEnhet, setPrisPerEnhet] = useState(0);
  const [moms, setMoms] = useState(25);
  const [valuta, setValuta] = useState("SEK");
  const [typ, setTyp] = useState<"vara" | "tjänst">("vara");
  const [loading, setLoading] = useState(false);
  const [saveAsFavorite, setSaveAsFavorite] = useState(false);
  const [favoritArtiklar, setFavoritArtiklar] = useState<any[]>([]);
  const [showFavoritArtiklar, setShowFavoritArtiklar] = useState(false);
  const [blinkIndex, setBlinkIndex] = useState<number | null>(null);

  useEffect(() => {
    const laddaFavoriter = async () => {
      const artiklar = await hämtaSparadeArtiklar();
      setFavoritArtiklar(artiklar);
    };
    laddaFavoriter();
  }, []);

  const handleAdd = async () => {
    if (!beskrivning.trim()) {
      alert("❌ Beskrivning krävs");
      return;
    }

    const newArtikel = { beskrivning, antal, prisPerEnhet, moms, valuta, typ };

    setFormData((prev) => ({
      ...prev,
      artiklar: [...(prev.artiklar ?? []), newArtikel],
    }));

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("artiklar", JSON.stringify([...(formData.artiklar ?? []), newArtikel]));
      Object.entries(formData).forEach(([k, v]) => {
        if (k !== "artiklar" && v != null) fd.append(k, String(v));
      });
      const res = await saveInvoice(fd);
      if (!res.success) {
        alert("❌ Kunde inte spara faktura efter tillägg");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Fel vid sparande");
    } finally {
      setLoading(false);
    }

    if (saveAsFavorite) {
      const res = await sparaFavoritArtikel(newArtikel);
      if (!res.success) {
        alert("❌ Kunde inte spara favoritartikel");
      }
    }

    setBeskrivning("");
    setAntal(1);
    setPrisPerEnhet(0);
    setMoms(25);
    setValuta("SEK");
    setTyp("vara");
    setSaveAsFavorite(false);

    // 🔥 Blinka på nya raden
    setTimeout(() => {
      setBlinkIndex(formData.artiklar?.length ?? 0);
      setTimeout(() => setBlinkIndex(null), 500);
    }, 50);
  };

  const handleRemove = (index: number) => {
    const nyaArtiklar = (formData.artiklar ?? []).filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      artiklar: nyaArtiklar,
    }));
  };

  const handleSelectFavorit = (artikel: any) => {
    setFormData((prev) => ({
      ...prev,
      artiklar: [...(prev.artiklar ?? []), artikel],
    }));

    // 🔥 Blinka på nya raden
    setTimeout(() => {
      setBlinkIndex(formData.artiklar?.length ?? 0);
      setTimeout(() => setBlinkIndex(null), 500);
    }, 50);
  };

  return (
    <div className="space-y-6">
      {/* 📂 Favoritartiklar och tillagda artiklar */}
      {favoritArtiklar.length > 0 && (
        <div className="space-y-4">
          <Knapp
            onClick={() => setShowFavoritArtiklar(!showFavoritArtiklar)}
            text={showFavoritArtiklar ? "🔼 Dölj sparade artiklar" : "📂 Ladda in sparade artiklar"}
          />

          {showFavoritArtiklar && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {favoritArtiklar.map((a) => (
                <div
                  key={a.id}
                  onClick={() => handleSelectFavorit(a)}
                  className="bg-slate-800 hover:bg-slate-700 cursor-pointer p-3 rounded border border-slate-600 flex flex-col justify-between"
                >
                  <div className="text-white font-semibold">📌 {a.beskrivning}</div>
                  <div className="text-gray-400 text-sm mt-1">
                    {a.antal} × {a.prisPerEnhet} {a.valuta} ({a.moms}% moms) — {a.typ}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ➕ Visa tillagda artiklar direkt under favoriter */}
      <div className="pt-6">
        {formData.artiklar?.length ? (
          <ul className="space-y-3">
            {formData.artiklar.map((a, idx) => (
              <li
                key={idx}
                className={`flex justify-between items-center p-3 bg-slate-900 border border-slate-700 rounded ${
                  blinkIndex === idx ? "background-pulse" : ""
                }`}
              >
                <div>
                  <div className="text-white font-semibold">{a.beskrivning}</div>
                  <div className="text-gray-400 text-sm">
                    {a.antal} × {a.prisPerEnhet} {a.valuta} ({a.moms}% moms) — {a.typ}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(idx)}
                  className="text-red-400 hover:text-red-600"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400 italic">Inga produkter eller tjänster tillagda ännu.</div>
        )}
      </div>

      {/* 📝 Lägg till ny artikel manuellt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
        <div>
          <label className="block mb-1 text-white">Beskrivning</label>
          <input
            value={beskrivning}
            onChange={(e) => setBeskrivning(e.target.value)}
            className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-white">Antal</label>
          <input
            type="number"
            value={antal}
            onChange={(e) => setAntal(parseFloat(e.target.value))}
            className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-white">Pris per enhet</label>
          <input
            type="number"
            value={prisPerEnhet}
            onChange={(e) => setPrisPerEnhet(parseFloat(e.target.value))}
            className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-white">Moms (%)</label>
          <input
            type="number"
            value={moms}
            onChange={(e) => setMoms(parseFloat(e.target.value))}
            className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-white">Valuta</label>
          <select
            value={valuta}
            onChange={(e) => setValuta(e.target.value)}
            className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
          >
            <option value="SEK">SEK</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-white">Typ</label>
          <select
            value={typ}
            onChange={(e) => setTyp(e.target.value as "vara" | "tjänst")}
            className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-white"
          >
            <option value="vara">Vara</option>
            <option value="tjänst">Tjänst</option>
          </select>
        </div>
      </div>

      {/* 📌 Checkbox Lägg till som favorit */}
      <div className="flex items-center gap-2 pt-4">
        <input
          type="checkbox"
          id="saveAsFavorite"
          checked={saveAsFavorite}
          onChange={() => setSaveAsFavorite(!saveAsFavorite)}
          className="w-5 h-5"
        />
        <label htmlFor="saveAsFavorite" className="text-white text-sm cursor-pointer">
          📌 Lägg till som favoritartikel
        </label>
      </div>

      {/* ➕ Lägg till och spara */}
      <div className="pt-4">
        <Knapp onClick={handleAdd} text={loading ? "✚ Sparar…" : "✚ Lägg till och spara"} />
      </div>
    </div>
  );
}
