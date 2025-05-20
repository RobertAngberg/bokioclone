"use client";

import { useEffect, useState } from "react";
import { useFakturaContext } from "./FakturaProvider";
import {
  saveInvoice,
  sparaFavoritArtikel,
  hämtaSparadeArtiklar,
  deleteFavoritArtikel,
} from "./actions";
import Knapp from "../_components/Knapp";
import TextFält from "../_components/TextFält";
import RotRutForm from "./RotRutForm";

type Artikel = {
  beskrivning: string;
  antal: number;
  prisPerEnhet: number;
  moms: number;
  valuta: string;
  typ: "vara" | "tjänst";
  rotRutTyp?: "ROT" | "RUT";
  rotRutKategori?: string;
  avdragProcent?: number;
  arbetskostnadExMoms?: number;
};
type FavoritArtikel = Omit<Artikel, "arbetskostnadExMoms"> & {
  arbetskostnadExMoms?: number | string;
  id?: number;
};

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
  const [favoritArtiklar, setFavoritArtiklar] = useState<FavoritArtikel[]>([]);
  const [showFavoritArtiklar, setShowFavoritArtiklar] = useState(false);
  const [blinkIndex, setBlinkIndex] = useState<number | null>(null);

  useEffect(() => {
    const laddaFavoriter = async () => {
      const artiklar = await hämtaSparadeArtiklar();
      setFavoritArtiklar(artiklar as FavoritArtikel[]);
    };
    laddaFavoriter();
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("FITTLOGG: formData", JSON.stringify(formData, null, 2));
    // eslint-disable-next-line no-console
    console.log("FITTLOGG: favoritArtiklar", favoritArtiklar);
  }, [formData, favoritArtiklar]);

  const handleAdd = async () => {
    if (!beskrivning.trim()) {
      alert("❌ Beskrivning krävs");
      return;
    }

    const newArtikel: Artikel = {
      beskrivning,
      antal,
      prisPerEnhet,
      moms,
      valuta,
      typ,
      ...(formData.rotRutAktiverat
        ? {
            rotRutTyp: formData.rotRutTyp as "ROT" | "RUT",
            rotRutKategori: formData.rotRutKategori,
            avdragProcent: formData.avdragProcent,
            arbetskostnadExMoms:
              typeof formData.arbetskostnadExMoms === "string"
                ? Number(formData.arbetskostnadExMoms)
                : formData.arbetskostnadExMoms,
          }
        : {}),
    };

    // eslint-disable-next-line no-console
    console.log("FITTLOGG: handleAdd -> newArtikel", newArtikel);

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
      // eslint-disable-next-line no-console
      console.log(
        "FITTLOGG: handleAdd -> saveInvoice skickas med",
        Object.fromEntries(fd.entries())
      );
      const res = await saveInvoice(fd);
      if (!res.success) {
        alert("❌ Kunde inte spara faktura efter tillägg");
      }
    } catch (err) {
      console.error("FITTLOGG: Fel vid sparande", err);
      alert("❌ Fel vid sparande");
    } finally {
      setLoading(false);
    }

    if (saveAsFavorite) {
      const favArtikel: FavoritArtikel = { ...newArtikel };
      // Konvertera arbetskostnadExMoms till number om det finns
      if (favArtikel.arbetskostnadExMoms !== undefined) {
        favArtikel.arbetskostnadExMoms = Number(favArtikel.arbetskostnadExMoms);
        if (isNaN(favArtikel.arbetskostnadExMoms)) favArtikel.arbetskostnadExMoms = undefined;
      }
      // eslint-disable-next-line no-console
      console.log("FITTLOGG: handleAdd -> Spara favoritartikel", favArtikel);
      const res = await sparaFavoritArtikel({
        ...favArtikel,
        arbetskostnadExMoms: favArtikel.arbetskostnadExMoms as number | undefined,
      });
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

    setTimeout(() => {
      setBlinkIndex(formData.artiklar?.length ?? 0);
      setTimeout(() => setBlinkIndex(null), 500);
    }, 50);
  };

  const handleRemove = (index: number) => {
    const nyaArtiklar = (formData.artiklar ?? []).filter((_, i) => i !== index);
    // eslint-disable-next-line no-console
    console.log("FITTLOGG: handleRemove -> index", index, nyaArtiklar);
    setFormData((prev) => ({
      ...prev,
      artiklar: nyaArtiklar,
    }));
  };

  const handleSelectFavorit = (artikel: FavoritArtikel) => {
    const { id, rotRutTyp, rotRutKategori, avdragProcent, arbetskostnadExMoms, ...artikelUtanId } =
      artikel;

    const artikelMedRutRot = {
      ...artikelUtanId,
      ...(rotRutTyp
        ? {
            rotRutTyp,
            rotRutKategori,
            avdragProcent,
            arbetskostnadExMoms:
              typeof arbetskostnadExMoms === "string"
                ? Number(arbetskostnadExMoms)
                : arbetskostnadExMoms,
          }
        : {}),
    };

    // eslint-disable-next-line no-console
    console.log("FITTLOGG: handleSelectFavorit -> artikelMedRutRot", artikelMedRutRot);

    setFormData((prev) => ({
      ...prev,
      artiklar: [...(prev.artiklar ?? []), artikelMedRutRot],
      rotRutAktiverat: rotRutTyp === "ROT" || rotRutTyp === "RUT" ? true : false,
      rotRutTyp: rotRutTyp as "ROT" | "RUT" | undefined,
      rotRutKategori,
      avdragProcent,
      arbetskostnadExMoms:
        arbetskostnadExMoms !== undefined && arbetskostnadExMoms !== null
          ? Number(arbetskostnadExMoms)
          : undefined,
    }));

    setTimeout(() => {
      setBlinkIndex(formData.artiklar?.length ?? 0);
      setTimeout(() => setBlinkIndex(null), 500);
    }, 50);
  };

  const handleDeleteFavorit = async (id?: number) => {
    if (!id) return;
    if (!window.confirm("Ta bort denna favoritartikel?")) return;
    const res = await deleteFavoritArtikel(id);
    if (res.success) {
      setFavoritArtiklar((prev) => prev.filter((a) => a.id !== id));
    } else {
      alert("❌ Kunde inte ta bort favoritartikel");
    }
  };

  return (
    <div className="space-y-6">
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
                  className="bg-slate-800 hover:bg-slate-700 cursor-pointer p-3 rounded border border-slate-600 flex flex-col justify-between relative"
                >
                  <button
                    onClick={() => handleDeleteFavorit(a.id)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                    title="Ta bort favoritartikel"
                  >
                    🗑️
                  </button>
                  <div onClick={() => handleSelectFavorit(a)} className="flex-1">
                    <div className="text-white font-semibold">📌 {a.beskrivning}</div>
                    <div className="text-gray-400 text-sm mt-1">
                      {a.antal} × {a.prisPerEnhet} {a.valuta} ({a.moms}% moms) — {a.typ}
                      {a.rotRutTyp ? ` — ${a.rotRutTyp}` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <ul className="space-y-3">
          {(formData.artiklar as Artikel[]).map((a, idx) => (
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
                  {a.rotRutTyp ? ` — ${a.rotRutTyp}` : ""}
                </div>
              </div>
              <button onClick={() => handleRemove(idx)} className="text-red-400 hover:text-red-600">
                🗑️
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TextFält
          label="Beskrivning"
          name="beskrivning"
          value={beskrivning}
          onChange={(e) => setBeskrivning(e.target.value)}
        />
        <TextFält
          label="Antal"
          name="antal"
          value={antal.toString()}
          onChange={(e) => setAntal(parseFloat(e.target.value))}
        />
        <TextFält
          label="Pris per enhet"
          name="prisPerEnhet"
          value={prisPerEnhet.toString()}
          onChange={(e) => setPrisPerEnhet(parseFloat(e.target.value))}
        />
        <TextFält
          label="Moms (%)"
          name="moms"
          value={moms.toString()}
          onChange={(e) => setMoms(parseFloat(e.target.value))}
        />
        <div>
          <label htmlFor="valuta" className="block text-sm font-medium text-white mb-2">
            Valuta
          </label>
          <select
            id="valuta"
            value={valuta}
            onChange={(e) => setValuta(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
          >
            <option value="SEK">SEK</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div>
          <label htmlFor="typ" className="block text-sm font-medium text-white mb-2">
            Typ
          </label>
          <select
            id="typ"
            value={typ}
            onChange={(e) => setTyp(e.target.value as "vara" | "tjänst")}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
          >
            <option value="vara">Vara</option>
            <option value="tjänst">Tjänst</option>
          </select>
        </div>
      </div>

      <RotRutForm />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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
        <Knapp onClick={handleAdd} text={loading ? "✚ Sparar…" : "✚ Lägg till och spara"} />
      </div>
    </div>
  );
}
