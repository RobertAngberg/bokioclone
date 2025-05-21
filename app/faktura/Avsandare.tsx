//#region Huvud
"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import TextFält from "../_components/TextFält";
import { hämtaFöretagsprofil, sparaFöretagsprofil } from "./actions";
import Knapp from "../_components/Knapp";
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

  // Ta bort logotyp
  const handleRemoveLogo = () => {
    setForm((prev) => ({ ...prev, logo: "" }));
    localStorage.removeItem("bokioclone_logo");
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Nollställ inputen!
    }
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <div className="mt-8 flex flex-col items-start gap-4 mb-6">
        <label className="font-semibold">Logotyp</label>
        <div className="flex items-center gap-4">
          <Knapp onClick={() => fileInputRef.current?.click()} text="Ladda upp logotyp" />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />

          {form.logo && (
            // eslint-disable-next-line @next/next/no-img-element
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

        {form.logo && <Knapp onClick={handleRemoveLogo} text="❌ Ta bort logotyp" />}
      </div>

      <Knapp onClick={handleSubmit} text="💾 Spara uppgifter" />

      {sparat && <p className="text-green-400 mt-4">✅ Uppgifterna sparades!</p>}
    </div>
  );
}
