//#region Huvud
"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import TextFält from "../_components/TextFält";
import { hämtaFöretagsprofil, sparaFöretagsprofil } from "./actions";
//#endregion

export default function Avsandare() {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    företagsnamn: "",
    adress: "",
    postnummer: "",
    stad: "",
    organisationsnummer: "",
    momsregistreringsnummer: "",
    telefonnummer: "",
    bankinfo: "",
    webbplats: "",
    logo: "",
    logoWidth: 200,
  });

  const [sparat, setSparat] = useState(false);
  const [logoSliderValue, setLogoSliderValue] = useState(
    (100 * ((form.logoWidth ?? 200) - 50)) / 150
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ladda företagsprofil när komponenten mountas
  useEffect(() => {
    const ladda = async () => {
      if (session?.user?.id) {
        const data = await hämtaFöretagsprofil(session.user.id);
        if (data) setForm(data);
        // Hämta logotyp från localStorage om den finns
        const logo = localStorage.getItem("bokioclone_logo");
        if (logo) setForm((prev) => ({ ...prev, logo }));
        const logoWidth = localStorage.getItem("bokioclone_logoWidth");
        if (logoWidth) setForm((prev) => ({ ...prev, logoWidth: Number(logoWidth) }));
      }
    };
    ladda();
  }, [session]);

  // Hantera ändringar i formuläret
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Hantera logotyp-uppladdning
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const logoData = ev.target?.result as string;
      setForm((prev) => ({ ...prev, logo: logoData }));
      localStorage.setItem("bokioclone_logo", logoData); // <-- Spara i browsern
    };
    reader.readAsDataURL(file);
  };

  // Hantera logotypstorlek
  const handleLogoSlider = (value: number) => {
    setLogoSliderValue(value);
    const width = 50 + (value / 100) * 150;
    setForm((prev) => ({ ...prev, logoWidth: width }));
    localStorage.setItem("bokioclone_logoWidth", width.toString());
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) return;

    const res = await sparaFöretagsprofil(session.user.id, form);
    if (res.success) {
      setSparat(true);
      setTimeout(() => setSparat(false), 3000);
    } else {
      alert("Kunde inte spara uppgifter.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextFält
          label="Företagsnamn"
          name="företagsnamn"
          value={form.företagsnamn}
          onChange={handleChange}
        />
        <TextFält label="Adress" name="adress" value={form.adress} onChange={handleChange} />
        <TextFält
          label="Postnummer"
          name="postnummer"
          value={form.postnummer}
          onChange={handleChange}
        />
        <TextFält label="Stad" name="stad" value={form.stad} onChange={handleChange} />
        <TextFält
          label="Organisationsnummer"
          name="organisationsnummer"
          value={form.organisationsnummer}
          onChange={handleChange}
        />
        <TextFält
          label="Momsregistreringsnummer"
          name="momsregistreringsnummer"
          value={form.momsregistreringsnummer}
          onChange={handleChange}
        />
        <TextFält
          label="Telefonnummer"
          name="telefonnummer"
          value={form.telefonnummer}
          onChange={handleChange}
        />
        <TextFält label="Bankinfo" name="bankinfo" value={form.bankinfo} onChange={handleChange} />
        <TextFält
          label="Webbplats"
          name="webbplats"
          value={form.webbplats}
          onChange={handleChange}
        />
      </div>

      {/* Logotyp-uppladdning och förhandsgranskning */}
      <div className="mt-8 flex flex-col items-start gap-4">
        <label className="font-semibold">Logotyp</label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="bg-cyan-700 hover:bg-cyan-800 px-4 py-2 rounded"
            onClick={() => fileInputRef.current?.click()}
          >
            Ladda upp logotyp
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
          {form.logo && (
            <img
              src={form.logo}
              alt="Logotyp"
              style={{
                maxWidth: `${form.logoWidth}px`,
                maxHeight: "120px",
                objectFit: "contain",
                background: "#fff",
                borderRadius: 4,
                padding: 2,
              }}
            />
          )}
        </div>
        {/* Slider för logotypbredd */}
        {form.logo && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="range"
              min={0}
              max={100}
              value={logoSliderValue}
              onChange={(e) => handleLogoSlider(Number(e.target.value))}
              className="w-40"
            />
            <span className="text-xs text-gray-300">{Math.round(form.logoWidth)} px</span>
          </div>
        )}
      </div>

      {/* Spara-knapp */}
      <button
        onClick={handleSubmit}
        className="mt-8 bg-cyan-700 hover:bg-cyan-800 px-5 py-2 rounded"
      >
        💾 Spara uppgifter
      </button>

      {/* Sparat-meddelande */}
      {sparat && <p className="text-green-400 mt-4">✅ Uppgifterna sparades!</p>}
    </div>
  );
}
