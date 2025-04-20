"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { sparaForetagsprofil, hamtaFöretagsprofil } from "./actions";

export default function Foretagsprofil() {
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

  useEffect(() => {
    const ladda = async () => {
      const data = await hamtaFöretagsprofil();
      if (data) setForm(data);
    };
    ladda();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    const res = await sparaForetagsprofil(formData);
    if (res.success) {
      setSparat(true);
      setTimeout(() => setSparat(false), 3000);
    } else {
      alert("Kunde inte spara uppgifter.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-slate-900 text-white rounded-lg mt-10">
      <h1 className="text-2xl font-semibold mb-6">🧑‍💼 Företagsprofil</h1>

      <div className="grid gap-4">
        {[
          ["företagsnamn", "Företagsnamn"],
          ["adress", "Adress"],
          ["postnummer", "Postnummer"],
          ["stad", "Stad"],
          ["organisationsnummer", "Organisationsnummer"],
          ["momsregistreringsnummer", "Momsregistreringsnummer"],
          ["telefonnummer", "Telefonnummer"],
          ["bankinfo", "Bankinfo"],
          ["webbplats", "Webbplats"],
        ].map(([name, label]) => (
          <div key={name}>
            <label className="block text-sm mb-1">{label}</label>
            <input
              type="text"
              name={name}
              value={form[name as keyof typeof form]}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 bg-cyan-700 hover:bg-cyan-800 px-5 py-2 rounded"
      >
        💾 Spara uppgifter
      </button>

      {sparat && <p className="text-green-400 mt-4">✅ Uppgifterna sparades!</p>}
    </div>
  );
}
