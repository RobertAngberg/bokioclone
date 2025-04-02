"use client";

import { useEffect, useState } from "react";
import { useFakturaContext } from "./FakturaProvider";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function DinaUppgifter() {
  const { data: session } = useSession();
  const { formData, setFormData } = useFakturaContext();
  const [isOpen, setIsOpen] = useState(false);

  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";
  const image = session?.user?.image ?? "";

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      företagsnamn: prev.företagsnamn || name,
      email: prev.email || email,
    }));
  }, [name, email, setFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="mb-4 rounded bg-cyan-950 p-1">
      <div
        className="flex justify-between items-center bg-cyan-950 px-4 py-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-bold text-white">Dina uppgifter</h2>
        <span className="text-white">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="bg-cyan-900 p-6 text-white space-y-6">
          {/* Profilbild + namn-badge */}
          {image && (
            <div className="flex flex-col items-center mb-4">
              <div className="w-24 h-24 relative rounded-full overflow-hidden border-2 border-cyan-700 shadow-md">
                <Image
                  src={image}
                  alt="Profilbild"
                  fill
                  className="object-cover"
                  sizes="96px"
                  priority
                />
              </div>
              <p className="mt-2 text-sm text-cyan-300">Inloggad som {name}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Namn</label>
              <input
                type="text"
                value={name}
                readOnly
                className="w-full px-3 py-2 text-black bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">E-post</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full px-3 py-2 text-black bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Företagsnamn</label>
              <input
                type="text"
                name="företagsnamn"
                value={formData.företagsnamn}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Adress</label>
              <input
                type="text"
                name="adress"
                value={formData.adress}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Postnummer</label>
              <input
                type="text"
                name="postnummer"
                value={formData.postnummer}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stad</label>
              <input
                type="text"
                name="stad"
                value={formData.stad}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
