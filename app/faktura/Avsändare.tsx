"use client";

import { useEffect, useRef, useState } from "react";
import { useFakturaContext } from "./FakturaProvider";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { hamtaFöretagsprofil } from "../admin/actions";

export default function Avsandare() {
  const { data: session } = useSession();
  const { formData, setFormData } = useFakturaContext();
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const name = session?.user?.name ?? "";
  const email = session?.user?.email ?? "";
  const MAX_SIZE_BYTES = 1024 * 1024;

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email: prev.email ?? email,
    }));

    const hämtaProfil = async () => {
      const profil = await hamtaFöretagsprofil();
      if (!profil) return;

      setFormData((prev) => ({
        ...prev,
        företagsnamn: profil.företagsnamn ?? "",
        adress: profil.adress ?? "",
        postnummer: profil.postnummer ?? "",
        stad: profil.stad ?? "",
        organisationsnummer: profil.organisationsnummer ?? "",
        momsregistreringsnummer: profil.momsregistreringsnummer ?? "",
        telefonnummer: profil.telefonnummer ?? "",
        bankinfo: profil.bankinfo ?? "",
        webbplats: profil.webbplats ?? "",
      }));
    };

    hämtaProfil();
  }, [email, setFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            }
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
    let finalBlob = file;

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
    <div className="p-6 bg-slate-900 text-white space-y-6 rounded-b-lg">
      {/* Logotyp */}
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
              <Image src={formData.logo} alt="Logotyp" fill className="object-contain" />
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

      {/* Fält */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Namn" value={name} readOnly />
        <Input label="E-post" value={email} readOnly />

        <Input
          name="företagsnamn"
          label="Företagsnamn"
          value={formData.företagsnamn}
          onChange={handleChange}
        />
        <Input name="adress" label="Adress" value={formData.adress} onChange={handleChange} />
        <Input
          name="postnummer"
          label="Postnummer"
          value={formData.postnummer}
          onChange={handleChange}
        />
        <Input name="stad" label="Stad" value={formData.stad} onChange={handleChange} />
        <Input
          name="organisationsnummer"
          label="Organisationsnummer"
          value={formData.organisationsnummer}
          onChange={handleChange}
        />
        <Input
          name="momsregistreringsnummer"
          label="Momsregistreringsnummer"
          value={formData.momsregistreringsnummer}
          onChange={handleChange}
        />
        <Input
          name="telefonnummer"
          label="Telefonnummer"
          value={formData.telefonnummer}
          onChange={handleChange}
        />
        <Input name="bankinfo" label="Bankinfo" value={formData.bankinfo} onChange={handleChange} />
        <Input
          name="webbplats"
          label="Webbplats"
          value={formData.webbplats}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  name?: string;
  value: string | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value ?? ""}
        onChange={onChange}
        readOnly={readOnly}
        className={`w-full px-3 py-2 ${
          readOnly ? "cursor-not-allowed" : ""
        } text-white bg-slate-900 border border-slate-700 rounded-lg`}
      />
    </div>
  );
}
