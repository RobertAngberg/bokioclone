"use client";

import { useState } from "react";
import { updateUserProfile } from "./actions";
import type { User } from "@prisma/client";

type Props = {
  user: User;
};

export default function KundUppgifter({ user }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showUtland, setShowUtland] = useState(false);
  const [formData, setFormData] = useState({
    företagsnamn: user.företagsnamn ?? "",
    organisationsnummer: user.organisationsnummer ?? "",
    momsnummer: user.momsnummer ?? "",
    adress: user.adress ?? "",
    adress2: user.adress2 ?? "",
    postnummer: user.postnummer ?? "",
    stad: user.stad ?? "",
    utlandLand: "Land",
    utlandSprak: "Engelska",
    utlandLeveransland: "Land",
    omvandSkatt: false,
    kundtyp: "Företag",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, String(value));
    });
    await updateUserProfile(formDataObj);
    alert("Sparat!");
  };

  const isPrivatkund = formData.kundtyp === "Privatkund";

  return (
    <div className="mb-4 rounded bg-cyan-950 p-1">
      <div
        className="flex justify-between items-center bg-cyan-950 px-4 py-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-bold">Kunduppgifter</h2>
        <span>{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && (
        <div className="transition-all duration-300 ease-in-out bg-cyan-900 p-6 space-y-6">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kundtyp radio */}
            <div className="col-span-2">
              <div className="flex gap-6">
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
            </div>
            {/* E-post + Namn */}
            <div>
              <label className="block text-sm font-medium">E-post</label>
              <input
                type="text"
                value={user.email ?? ""}
                readOnly
                className="mt-1 w-full px-3 py-2 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Namn</label>
              <input
                type="text"
                value={user.name ?? ""}
                readOnly
                className="mt-1 w-full px-3 py-2 text-black"
              />
            </div>
            {/* Anpassade fält beroende på kundtyp */}
            <div>
              <label className="block text-sm font-medium">
                {isPrivatkund ? "Namn" : "Företagsnamn"}
              </label>
              <input
                type="text"
                name="företagsnamn"
                value={formData.företagsnamn}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                {isPrivatkund ? "Personnummer" : "Organisationsnummer"}
              </label>
              <input
                type="text"
                name="organisationsnummer"
                value={formData.organisationsnummer}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 text-black"
              />
            </div>
            {!isPrivatkund && (
              <div>
                <label className="block text-sm font-medium">Momsnummer</label>
                <input
                  type="text"
                  name="momsnummer"
                  value={formData.momsnummer}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 text-black"
                />
              </div>
            )}
            {["adress", "adress2", "postnummer", "stad"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium capitalize">{field}</label>
                <input
                  type="text"
                  name={field}
                  value={formData[field as keyof typeof formData] as string}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 text-black"
                />
              </div>
            ))}
            {/* Utlandskund toggle */}
            <div className="col-span-2">
              <button
                type="button"
                onClick={() => setShowUtland((s) => !s)}
                className="text-cyan-400 underline"
              >
                {showUtland ? "▲ Dölj utlandskund" : "▼ Utlandskund"}
              </button>
            </div>
            {showUtland && (
              <>
                <h2 className="col-span-2 text-xl font-bold">Utlandskund</h2>
                <div>
                  <label className="block text-sm font-medium">Land</label>
                  <input
                    type="text"
                    name="utlandLand"
                    value={formData.utlandLand}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Språk på faktura/offert</label>
                  <input
                    type="text"
                    name="utlandSprak"
                    value={formData.utlandSprak}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 text-black"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium">Leveransland</label>
                  <input
                    type="text"
                    name="utlandLeveransland"
                    value={formData.utlandLeveransland}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 text-black"
                  />
                </div>
              </>
            )}
            {/* Omvänd skattskyldighet */}
            <hr className="col-span-2 border-gray-600" />
            <h2 className="col-span-2 text-xl font-bold">Omvänd skattskyldighet</h2>
            <div className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                name="omvandSkatt"
                checked={formData.omvandSkatt}
                onChange={handleChange}
              />
              <label>Aktivera omvänd skattskyldighet till byggsektorn</label>
            </div>
          </form>
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700"
            >
              Spara
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
