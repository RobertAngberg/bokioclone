"use client";

import { useState } from "react";
import { useFakturaContext } from "./FakturaProvider";

export default function KundUppgifter() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUtland, setShowUtland] = useState(false);
  const { formData, setFormData } = useFakturaContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="mb-4 rounded bg-cyan-950 p-1">
      <div
        className="flex justify-between items-center bg-cyan-950 px-4 py-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-bold text-white">Kunduppgifter</h2>
        <span className="text-white">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="transition-all duration-300 ease-in-out bg-cyan-900 p-6 space-y-6">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="kundtyp"
                  value="Företag"
                  checked={formData.kundtyp === "Företag"}
                  onChange={handleChange}
                />
                Företag
              </label>
              <label className="flex items-center gap-2">
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

            <div>
              <label className="block text-sm font-medium text-white">Namn</label>
              <input
                type="text"
                name="kundnamn"
                value={formData.kundnamn}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white">Adress</label>
              <input
                type="text"
                name="kundadress"
                value={formData.kundadress}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white">Postnummer</label>
              <input
                type="text"
                name="kundpostnummer"
                value={formData.kundpostnummer}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white">Stad</label>
              <input
                type="text"
                name="kundstad"
                value={formData.kundstad}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-white">E-post</label>
              <input
                type="email"
                name="kundemail"
                value={formData.kundemail}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
