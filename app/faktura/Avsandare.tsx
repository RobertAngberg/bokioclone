"use client";

import { useEffect, useState, useRef } from "react";
import { useFakturaContext } from "./FakturaProvider";
import { useSession } from "next-auth/react";

export default function Avsandare() {
  const { data: session } = useSession();
  const { formData, setFormData } = useFakturaContext();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";

  const MAX_SIZE_BYTES = 1024 * 1024;

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      företagsnamn: prev.företagsnamn ?? name,
      email: prev.email ?? email,
    }));
  }, [name, email, setFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
          },
          "image/jpeg",
          0.7
        );
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const handleFileUpload = async (file: File) => {
    setError("");
    let finalBlob: Blob = file;

    if (file.size > MAX_SIZE_BYTES) {
      finalBlob = await compressImage(file);
    }

    if (finalBlob.size > MAX_SIZE_BYTES) {
      setError("Filen är fortfarande för stor efter komprimering (max 1 MB).");
      return;
    }

    const base64 = await blobToBase64(finalBlob);
    setFormData((prev) => ({ ...prev, logo: base64 }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mb-4 rounded bg-cyan-950 p-1">
      <div
        className="flex justify-between items-center bg-cyan-950 px-4 py-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-bold text-white">Avsändare</h2>
        <span className="text-white">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="bg-cyan-900 p-6 text-white space-y-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
              <span className="px-4 py-2 bg-cyan-700 text-white rounded hover:bg-cyan-800">
                Ladda upp logotyp
              </span>
            </label>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            {formData.logo && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 relative rounded shadow overflow-hidden">
                  <img src={formData.logo} alt="Logotyp" className="object-contain w-full h-full" />
                </div>
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, logo: "" }));
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    setError("");
                  }}
                  className="px-4 py-2 bg-cyan-700 text-white rounded hover:bg-cyan-800"
                >
                  🗑️ Ta bort logotyp
                </button>
              </div>
            )}
          </div>

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
                value={formData.företagsnamn ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Adress</label>
              <input
                type="text"
                name="adress"
                value={formData.adress ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Postnummer</label>
              <input
                type="text"
                name="postnummer"
                value={formData.postnummer ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stad</label>
              <input
                type="text"
                name="stad"
                value={formData.stad ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Organisationsnummer</label>
              <input
                type="text"
                name="organisationsnummer"
                value={formData.organisationsnummer ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Momsregistreringsnummer</label>
              <input
                type="text"
                name="momsregistreringsnummer"
                value={formData.momsregistreringsnummer ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Telefonnummer</label>
              <input
                type="text"
                name="telefonnummer"
                value={formData.telefonnummer ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bankinfo</label>
              <input
                type="text"
                name="bankinfo"
                value={formData.bankinfo ?? ""}
                onChange={handleChange}
                className="w-full px-3 py-2 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Webbplats</label>
              <input
                type="text"
                name="webbplats"
                value={formData.webbplats ?? ""}
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
