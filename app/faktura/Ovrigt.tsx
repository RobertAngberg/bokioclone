"use client";

import { useState } from "react";

export default function Ovrigt() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    betalningsmetod: "Bankgiro",
    nummer: "",
    momsvisning: "Inklusive",
    fakturanummer: "1",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="mb-4 rounded bg-cyan-950 p-1">
      <div
        className="flex justify-between items-center bg-cyan-950 px-4 py-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-bold text-white">Övrigt</h2>
        <span className="text-white">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="transition-all duration-300 ease-in-out bg-cyan-900 p-6 text-white space-y-6">
          <h2 className="text-xl font-bold mb-4">Betalningsmetod</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Välj metod</label>
              <select
                name="betalningsmetod"
                value={formData.betalningsmetod}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              >
                <option value="Bankgiro">Bankgiro</option>
                <option value="Plusgiro">Plusgiro</option>
                <option value="Bankkonto">Bankkonto</option>
                <option value="Swish">Swish</option>
                <option value="PayPal">PayPal</option>
                <option value="IBAN">IBAN</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nummer</label>
              <input
                name="nummer"
                value={formData.nummer}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Visa moms</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="momsvisning"
                  value="Inklusive"
                  checked={formData.momsvisning === "Inklusive"}
                  onChange={handleChange}
                />
                Inklusive
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="momsvisning"
                  value="Exklusive"
                  checked={formData.momsvisning === "Exklusive"}
                  onChange={handleChange}
                />
                Exklusive
              </label>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-1">Fakturanummer</label>
            <input
              name="fakturanummer"
              value={formData.fakturanummer}
              onChange={handleChange}
              className="w-full px-3 py-2 text-black"
            />
          </div>
        </div>
      )}
    </div>
  );
}
