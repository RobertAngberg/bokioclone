"use client";

import { useState } from "react";
import Image from "next/image";
import { updateUserProfile } from "./actions";
import type { User } from "@prisma/client";

type Props = {
  user: User;
};

export default function DinaUppgifter({ user }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    företagsnamn: user.företagsnamn ?? "",
    organisationsnummer: user.organisationsnummer ?? "",
    momsnummer: user.momsnummer ?? "",
    adress: user.adress ?? "",
    adress2: user.adress2 ?? "",
    postnummer: user.postnummer ?? "",
    stad: user.stad ?? "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value);
    });
    await updateUserProfile(formDataObj);
    alert("Sparat!");
  };

  return (
    <div className="mb-4 rounded bg-cyan-950 p-1">
      <div
        className="flex justify-between items-center bg-cyan-950 px-4 py-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-bold">Dina uppgifter</h2>
        <span>{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="transition-all duration-300 ease-in-out bg-cyan-900 p-6 space-y-6">
          {user.image && (
            <div className="flex justify-center">
              <Image
                src={user.image}
                alt="Profilbild"
                width={96}
                height={96}
                className="border-2 border-white"
              />
            </div>
          )}

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">E-post</label>
              <input
                type="text"
                value={user.email ?? ""}
                disabled
                className="mt-1 w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Namn</label>
              <input
                type="text"
                value={user.name ?? ""}
                disabled
                className="mt-1 w-full px-3 py-2 text-black"
              />
            </div>

            {[
              ["företagsnamn", "Företagsnamn"],
              ["organisationsnummer", "Organisationsnummer"],
              ["momsnummer", "Momsnummer"],
              ["adress", "Adress"],
              ["adress2", "Adress 2"],
              ["postnummer", "Postnummer"],
              ["stad", "Stad"],
            ].map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium">{label}</label>
                <input
                  type="text"
                  name={field}
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 text-black"
                />
              </div>
            ))}
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
