"use client";

import { useEffect, useState, useTransition } from "react";
import { useFakturaContext } from "./FakturaProvider";
import KundUppgifter from "./KundUppgifter";
import ProdukterTjanster from "./ProdukterTjänster";
import Förhandsgranskning from "./Förhandsgranskning";
import SparadeFakturor from "./SparadeFakturor";
import AnimeradFlik from "../_components/AnimeradFlik";
import Knapp from "../_components/Knapp";
import MainLayout from "../_components/MainLayout";
import Alternativ from "./Alternativ";
import Betalning from "./Betalning";
import Avsandare from "./Avsandare";
import type { Artikel } from "./actions";
import {
  saveInvoice,
  hämtaFakturaMedRader,
  deleteFaktura,
  deleteKund,
  hämtaSparadeArtiklar,
  deleteFavoritArtikel,
  hämtaSparadeFakturor,
} from "./actions";

type Props = { kunder: any[]; fakturor: any[]; artiklar?: Artikel[] };

export default function Fakturor({ kunder: initialKunder, fakturor: initialFakturor }: Props) {
  const { formData, setFormData, setKundStatus } = useFakturaContext();
  const [showPreview, setShowPreview] = useState(false);
  const [kunder, setKunder] = useState(initialKunder);
  const [fakturor, setFakturor] = useState(initialFakturor);
  const [artiklar, setArtiklar] = useState<Artikel[]>([]);
  const [isPending, startTransition] = useTransition();

  /* --- init data --- */
  useEffect(() => {
    hämtaSparadeArtiklar().then(setArtiklar);
  }, []);
  useEffect(() => {
    const reload = async () => setFakturor(await hämtaSparadeFakturor());
    const handler = () => reload();
    window.addEventListener("reloadFakturor", handler);
    return () => window.removeEventListener("reloadFakturor", handler);
  }, []);

  /* --- helpers --- */
  const hanteraValdKund = (kund: any) => {
    setFormData((prev) => ({
      ...prev,
      kundId: kund.id?.toString() ?? "",
      kundnamn: kund.kundnamn,
      kundnummer: kund.kundnummer,
      kundorganisationsnummer: kund.kundorgnummer,
      kundvatnummer: kund.kundmomsnummer,
      kundadress: kund.kundadress1,
      kundpostnummer: kund.kundpostnummer,
      kundstad: kund.kundstad,
      kundemail: kund.kundemail,
    }));
    setKundStatus("loaded");
  };

  const hanteraValdFaktura = async (id: number) => {
    const data = await hämtaFakturaMedRader(id);
    if (!data?.faktura) return alert("❌ Kunde inte hämta faktura");
    const { faktura, artiklar } = data;
    setFormData({
      id: faktura.id,
      fakturanummer: faktura.fakturanummer ?? "",
      fakturadatum: faktura.fakturadatum?.toISOString().slice(0, 10) ?? "",
      forfallodatum: faktura.forfallodatum?.toISOString().slice(0, 10) ?? "",
      betalningsmetod: faktura.betalningsmetod ?? "",
      betalningsvillkor: faktura.betalningsvillkor ?? "",
      drojsmalsranta: faktura.drojsmalsranta ?? "",
      kundId: faktura.kundId?.toString() ?? "",
      nummer: faktura.nummer ?? "",
      kundmomsnummer: faktura.kundmomsnummer ?? "",
      kundnamn: faktura.kundnamn ?? "",
      kundnummer: faktura.kundnummer ?? "",
      kundorganisationsnummer: faktura.kundorganisationsnummer ?? "",
      kundadress: faktura.kundadress ?? "",
      kundpostnummer: faktura.kundpostnummer ?? "",
      kundstad: faktura.kundstad ?? "",
      kundemail: faktura.kundemail ?? "",
      företagsnamn: "",
      email: "",
      adress: "",
      postnummer: "",
      stad: "",
      organisationsnummer: "",
      momsregistreringsnummer: "",
      telefonnummer: "",
      bankinfo: "",
      webbplats: "",
      logo: "",
      artiklar: artiklar.map((rad) => ({
        beskrivning: rad.beskrivning,
        antal: Number(rad.antal),
        prisPerEnhet: Number(rad.prisPerEnhet),
        moms: Number(rad.moms),
        valuta: rad.valuta ?? "SEK",
        typ: rad.typ === "tjänst" ? "tjänst" : "vara",
      })),
    });
    setKundStatus("loaded");
  };

  const handleDeleteFaktura = (id: number) => {
    if (!confirm("❌ Vill du ta bort fakturan?")) return;
    startTransition(() => {
      setFakturor((f) => f.filter((x) => x.id !== id));
      deleteFaktura(id);
    });
  };
  const handleDeleteKund = (id: number) => {
    if (!confirm("❌ Vill du ta bort kunden?")) return;
    startTransition(() => {
      setKunder((k) => k.filter((x) => x.id !== id));
      deleteKund(id);
    });
  };
  const handleDeleteArtikel = async (id: number) => {
    if (!confirm("❌ Vill du ta bort artikeln?")) return;
    await deleteFavoritArtikel(id);
    setArtiklar((a) => a.filter((x) => x.id !== id));
  };

  const handleSave = async () => {
    const fd = new FormData();
    fd.append("artiklar", JSON.stringify(formData.artiklar ?? []));
    Object.entries(formData).forEach(([k, v]) => {
      if (k !== "artiklar" && v != null) fd.append(k, String(v));
    });
    const res = await saveInvoice(fd);
    if (res.success) {
      alert("✅ Faktura sparad!");
      setFakturor(await hämtaSparadeFakturor());
    } else alert("❌ Kunde inte spara fakturan.");
  };

  return (
    <>
      <MainLayout>
        <h1 className="text-3xl text-center mb-8">Fakturor</h1>

        <AnimeradFlik title="Sparade fakturor" icon="📂">
          <SparadeFakturor
            onSelectCustomer={hanteraValdKund}
            onSelectInvoice={hanteraValdFaktura}
            onDeleteCustomer={handleDeleteKund}
            onDeleteInvoice={handleDeleteFaktura}
            onDeleteArtikel={handleDeleteArtikel}
            onSelectArtiklar={(a) =>
              setFormData((p) => ({ ...p, artiklar: [...(p.artiklar ?? []), ...a] }))
            }
            kunder={kunder}
            fakturor={fakturor}
            artiklar={artiklar}
          />
        </AnimeradFlik>

        <AnimeradFlik title="Avsändare" icon="🧑‍💻">
          <Avsandare />
        </AnimeradFlik>
        <AnimeradFlik title="Kunduppgifter" icon="🧑‍💼">
          <KundUppgifter />
        </AnimeradFlik>
        <AnimeradFlik title="Produkter & Tjänster" icon="📦">
          <ProdukterTjanster />
        </AnimeradFlik>
        <AnimeradFlik title="Betalning" icon="💰">
          <Betalning />
        </AnimeradFlik>

        <AnimeradFlik title="Alternativ" icon="⚙️">
          <Alternativ onSave={handleSave} onPreview={() => setShowPreview(true)} />
        </AnimeradFlik>
      </MainLayout>

      {/* Dold yta för vanlig pappersutskrift */}
      <div id="print-area" className="hidden print:block">
        <Förhandsgranskning />
      </div>

      {/* Modal preview – klassen preview-wrapper används vid PDF-export */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 print:hidden">
          <div className="relative bg-white max-w-[95vw] max-h-[95vh] overflow-auto shadow-2xl border border-gray-300 rounded-none">
            <div className="absolute top-4 right-4 z-50">
              <Knapp onClick={() => setShowPreview(false)} text="❌ Stäng" />
            </div>
            <div className="p-6 flex justify-center">
              <div className="preview-wrapper w-[210mm] h-[297mm] bg-white shadow border rounded">
                <Förhandsgranskning />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
