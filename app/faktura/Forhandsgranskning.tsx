"use client";

import { useFakturaContext } from "./FakturaProvider";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useSession } from "next-auth/react";
import { useRef, useState, useEffect } from "react";
import { hamtaFöretagsprofil } from "../admin/actions";

export default function Forhandsgranskning() {
  const { formData, setFormData } = useFakturaContext();
  const { data: session } = useSession();
  const rows = formData.artiklar || [];
  const buttonRef = useRef<HTMLDivElement>(null);
  const [profil, setProfil] = useState<any>(null);

  useEffect(() => {
    const hämtaProfil = async () => {
      const data = await hamtaFöretagsprofil();
      setProfil(data);
    };
    hämtaProfil();
  }, []);

  const initialSlider = (((formData.logoWidth ?? 200) - 50) / 150) * 100;
  const [logoSliderValue, setLogoSliderValue] = useState(initialSlider);

  useEffect(() => {
    const calculated = 50 + (logoSliderValue / 100) * 150;
    setFormData((prev) => ({ ...prev, logoWidth: calculated }));
  }, [logoSliderValue, setFormData]);

  const logoSize = formData.logoWidth ?? 200;

  const sumExkl = rows.reduce(
    (acc, rad) => acc + parseFloat(String(rad.antal)) * parseFloat(String(rad.prisPerEnhet)),
    0
  );

  const totalMoms = rows.reduce((acc, rad) => {
    const antal = parseFloat(String(rad.antal));
    const pris = parseFloat(String(rad.prisPerEnhet));
    const moms = parseFloat(String(rad.moms));
    return acc + antal * pris * (moms / 100);
  }, 0);

  const totalSum = sumExkl + totalMoms;

  const exportToPDF = async () => {
    const element = document.getElementById("print-area");
    if (!element) return;

    const originalDisplay = element.style.display;
    element.style.display = "block"; // Temporärt synlig

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      if (canvas.width === 0 || canvas.height === 0) {
        console.error("❌ Canvas har ogiltiga dimensioner", canvas.width, canvas.height);
        return;
      }

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = 210;
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save("faktura.pdf");
    } catch (error) {
      console.error("❌ Error exporting PDF:", error);
    } finally {
      element.style.display = originalDisplay; // Återställ display
    }
  };

  return (
    <div
      id="print-area"
      className="relative bg-white text-black w-[210mm] h-[297mm] p-10 text-[11pt] leading-relaxed overflow-hidden flex flex-col justify-between"
      style={{ backgroundColor: "#ffffff" }}
    >
      {formData.logo && (
        <div className="absolute top-10 right-10 group flex flex-col items-end">
          <img
            src={formData.logo}
            crossOrigin="anonymous"
            alt="Logotyp"
            style={{
              maxWidth: `${logoSize}px`,
              maxHeight: "200px",
              objectFit: "contain",
            }}
            className="transition-all"
          />
          <input
            type="range"
            min={0}
            max={100}
            value={logoSliderValue}
            onChange={(e) => setLogoSliderValue(Number(e.target.value))}
            className="mt-2 w-32 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )}

      <div>
        <h1 className="text-4xl font-bold mb-16">Faktura</h1>
        <div className="grid grid-cols-2 gap-6 mb-20">
          <div>
            <p className="font-bold">{profil?.företagsnamn ?? formData.företagsnamn}</p>
            <p>{profil?.adress ?? formData.adress}</p>
            <p>
              {profil?.postnummer ?? formData.postnummer} {profil?.stad ?? formData.stad}
            </p>
          </div>
          <div>
            <p className="font-bold">{formData.kundnamn}</p>
            <p>{formData.kundadress}</p>
            <p>
              {formData.kundpostnummer} {formData.kundstad}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-10 text-[10pt]">
          {[
            ["Fakturanummer", formData.fakturanummer],
            ["Fakturadatum", formData.fakturadatum],
            ["Förfallodatum", formData.forfallodatum],
            ["Betalningsmetod", formData.betalningsmetod],
            ["Betalningsvillkor", formData.betalningsvillkor + " dagar"],
          ].map(([label, value], i) => (
            <div key={i}>
              <p className="font-bold">{label}</p>
              <p>{value}</p>
            </div>
          ))}
        </div>

        <table className="w-full text-left border mb-6 text-[10pt]" style={{ borderColor: "#ccc" }}>
          <thead>
            <tr>
              {["Beskrivning", "Antal", "Pris", "Moms", "Belopp"].map((header, i) => (
                <th
                  key={i}
                  className="p-2 border"
                  style={{ borderColor: "#ccc", verticalAlign: "middle" }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((rad, i) => {
              const antal = parseFloat(String(rad.antal));
              const pris = parseFloat(String(rad.prisPerEnhet));
              const moms = parseFloat(String(rad.moms));
              const belopp = antal * pris * (1 + moms / 100);
              return (
                <tr key={i} style={{ borderBottom: "1px solid #ccc" }}>
                  <td className="p-2">{rad.beskrivning}</td>
                  <td className="p-2">{antal}</td>
                  <td className="p-2">
                    {pris.toFixed(2)} {rad.valuta}
                  </td>
                  <td className="p-2">{moms}%</td>
                  <td className="p-2">
                    {belopp.toFixed(2)} {rad.valuta}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="text-right space-y-1 text-[10pt]">
          <p>
            <strong>Summa exkl. moms:</strong> {sumExkl.toFixed(2)} {rows[0]?.valuta ?? "SEK"}
          </p>
          <p>
            <strong>Moms totalt:</strong> {totalMoms.toFixed(2)} {rows[0]?.valuta ?? "SEK"}
          </p>
          <p className="text-lg font-bold">
            Summa att betala: {totalSum.toFixed(2)} {rows[0]?.valuta ?? "SEK"}
          </p>
        </div>
      </div>

      <div
        className="grid grid-cols-2 mt-10 pt-6 text-[10pt]"
        style={{ borderTop: "1px solid #ccc" }}
      >
        <div className="space-y-1">
          <p className="font-bold">Namn</p>
          <p>{profil?.adress ?? formData.adress}</p>
          <p>
            {profil?.postnummer ?? formData.postnummer} {profil?.stad ?? formData.stad}
          </p>
          <p>Org.nr: {profil?.organisationsnummer ?? "—"}</p>
          <p>Moms.nr: {profil?.momsregistreringsnummer ?? "—"}</p>
        </div>
        <div className="text-right space-y-1">
          <p className="font-bold">Kontaktuppgifter</p>
          <p>{session?.user?.name ?? "—"}</p>
          <p>Telefon: {profil?.telefonnummer ?? "—"}</p>
          <p>E-post: {formData.email}</p>
          <p>Webb: {profil?.webbplats ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}
