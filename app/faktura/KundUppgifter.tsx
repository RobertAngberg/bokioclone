"use client";

import { useFakturaContext } from "./FakturaProvider";
import { useEffect } from "react";

export default function KundUppgifter() {
  const { formData, setFormData } = useFakturaContext();

  useEffect(() => {
    console.log("🔍 Kunduppgifter formData:", formData);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="space-y-8">
      <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-2 flex gap-6">
          <label className="flex items-center gap-2 text-white">
            <input
              type="radio"
              name="kundtyp"
              value="Företag"
              checked={formData.kundtyp === "Företag"}
              onChange={handleChange}
            />
            Företag
          </label>
          <label className="flex items-center gap-2 text-white">
            <input
              type="radio"
              name="kundtyp"
              value="Privatkund"
              checked={formData.kundtyp === "Privatkund"}
              onChange={handleChange}
            />
            Privatkund
          </label>
        </div>

        <Input label="Kundnamn" name="kundnamn" value={formData.kundnamn} onChange={handleChange} />
        <Input
          label="Organisationsnummer"
          name="kundorganisationsnummer"
          value={formData.kundorganisationsnummer}
          onChange={handleChange}
        />
        <Input
          label="VAT-nummer"
          name="kundvatnummer"
          value={formData.kundvatnummer}
          onChange={handleChange}
        />
        <Input
          label="Kundnummer"
          name="kundnummer"
          value={formData.kundnummer}
          onChange={handleChange}
        />
        <Input
          label="Adress"
          name="kundadress"
          value={formData.kundadress}
          onChange={handleChange}
        />
        <Input
          label="Adress 2"
          name="kundadress2"
          value={formData.kundadress2}
          onChange={handleChange}
        />
        <Input
          label="Postnummer"
          name="kundpostnummer"
          value={formData.kundpostnummer}
          onChange={handleChange}
        />
        <Input label="Stad" name="kundstad" value={formData.kundstad} onChange={handleChange} />
        <Input label="E-post" name="kundemail" value={formData.kundemail} onChange={handleChange} />
      </form>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-white mb-2">{label}</label>
      <input
        type="text"
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className="w-full px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-lg"
      />
    </div>
  );
}
