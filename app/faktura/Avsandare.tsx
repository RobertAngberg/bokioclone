//#region Huvud
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import TextFält from "../_components/TextFält"; // 👈 Importera din komponent
import { hämtaFöretagsprofil, sparaFöretagsprofil } from "./actions"; // 👈 Importera actions
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
  });

  const [sparat, setSparat] = useState(false);

  // Ladda företagsprofil när komponenten mountas
  useEffect(() => {
    const ladda = async () => {
      if (session?.user?.id) {
        const data = await hämtaFöretagsprofil(session.user.id);
        if (data) setForm(data);
      }
    };
    ladda();
  }, [session]);

  // Hantera ändringar i formuläret
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
