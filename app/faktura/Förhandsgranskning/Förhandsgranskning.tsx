//#region
/* eslint-disable @next/next/no-img-element */
"use client";

import { useFakturaContext } from "../FakturaProvider";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { hämtaFöretagsprofil } from "../actions";
import BetalningsInfo from "./BetalningsInfo";
import RotRutInfo from "./RotRutInfo";
import ArtiklarLista from "./ArtiklarLista";
import Logotyp from "./Logotyp";
import Fot from "./Fot";
import AvsändMottag from "./AvsändMottag";
import TotalerInfo from "./TotalerInfo";
//#endregion

export default function Forhandsgranskning() {
  const { formData, setFormData } = useFakturaContext();
  const { data: session } = useSession();
  const rows = formData.artiklar || [];
  const [profil, setProfil] = useState<any>(null);

  // Hämta företagsprofil vid mount
  useEffect(() => {
    const fetchProfil = async () => {
      if (!session?.user?.id) return;
      const data = await hämtaFöretagsprofil(session.user.id);
      setProfil(data);
    };
    fetchProfil();
  }, [session?.user?.id]);

  // Synka profil till formData när profil laddas
  useEffect(() => {
    if (profil) {
      setFormData((prev) => ({
        ...prev,
        företagsnamn: profil.företagsnamn ?? "",
        adress: profil.adress ?? "",
        postnummer: profil.postnummer ?? "",
        stad: profil.stad ?? "",
        organisationsnummer: profil.organisationsnummer ?? "",
        momsregistreringsnummer: profil.momsregistreringsnummer ?? "",
        telefonnummer: profil.telefonnummer ?? "",
        epost: profil.epost ?? "",
        bankinfo: profil.bankinfo ?? "",
        webbplats: profil.webbplats ?? "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profil]);

  // Hämta logotyp från localStorage om den saknas
  useEffect(() => {
    if (!formData.logo) {
      const logo = localStorage.getItem("bokioclone_logo");
      if (logo) setFormData((prev) => ({ ...prev, logo }));
    }
    if (!formData.logoWidth) {
      const logoWidth = localStorage.getItem("bokioclone_logoWidth");
      if (logoWidth) setFormData((prev) => ({ ...prev, logoWidth: Number(logoWidth) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Logotypstorlek-slider (endast i preview)
  const initialSlider = (((formData.logoWidth ?? 200) - 50) / 150) * 100;
  const [logoSliderValue, setLogoSliderValue] = useState(initialSlider);

  useEffect(() => {
    const calculated = 50 + (logoSliderValue / 100) * 150;
    setFormData((prev) => ({ ...prev, logoWidth: calculated }));
    localStorage.setItem("bokioclone_logoWidth", calculated.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoSliderValue]);

  const logoSize = formData.logoWidth ?? 200;

  // Summeringsberäkningar
  const sumExkl = rows.reduce(
    (acc, rad) =>
      acc + parseFloat(String(rad.antal) || "0") * parseFloat(String(rad.prisPerEnhet) || "0"),
    0
  );

  const totalMoms = rows.reduce((acc, rad) => {
    const antal = parseFloat(String(rad.antal) || "0");
    const pris = parseFloat(String(rad.prisPerEnhet) || "0");
    const moms = parseFloat(String(rad.moms) || "0");
    return acc + antal * pris * (moms / 100);
  }, 0);

  // ROT/RUT-avdrag enligt Skatteverket: 30% av arbetskostnad inkl moms
  const arbetskostnadInklMoms = sumExkl + totalMoms;
  const rotRutAvdrag =
    formData.rotRutAktiverat && formData.rotRutTyp === "ROT"
      ? 0.3 * arbetskostnadInklMoms
      : formData.rotRutAktiverat && formData.rotRutTyp === "RUT"
        ? 0.5 * arbetskostnadInklMoms
        : 0;

  const totalSum = arbetskostnadInklMoms - rotRutAvdrag;
  const summaAttBetala = Math.max(totalSum, 0);

  return (
    <>
      <div
        id="print-area"
        className="relative bg-white text-black w-[210mm] h-[297mm] p-10 text-[11pt] leading-relaxed overflow-hidden flex flex-col"
        style={{ backgroundColor: "#ffffff", minHeight: "297mm" }}
      >
        <Logotyp
          logo={formData.logo}
          logoSize={logoSize}
          logoSliderValue={logoSliderValue}
          setLogoSliderValue={setLogoSliderValue}
          showSlider={true}
        />

        {/* Wrapper, ej fot */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h1 className="text-4xl font-bold mb-16">Faktura</h1>

          <AvsändMottag formData={formData} />

          <BetalningsInfo formData={formData} summaAttBetala={summaAttBetala} />

          <RotRutInfo formData={formData} />

          <ArtiklarLista rows={rows} />

          <TotalerInfo
            sumExkl={sumExkl}
            totalMoms={totalMoms}
            rotRutAvdrag={rotRutAvdrag}
            summaAttBetala={summaAttBetala}
            valuta={rows[0]?.valuta ?? "SEK"}
            rotRutTyp={formData.rotRutTyp}
          />
        </div>

        <Fot formData={formData} session={session} />
      </div>
    </>
  );
}
