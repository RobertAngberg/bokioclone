"use client";

import { useState, useEffect, useRef } from "react";
import { FakturaProvider, useFakturaContext } from "./FakturaProvider";

import Avsandare from "./Avsandare";
import KundUppgifter from "./KundUppgifter";
import ProdukterTjanster from "./ProdukterTjanster";
import Villkor from "./Villkor";
import Ovrigt from "./Ovrigt";
import Forhandsgranskning from "./Forhandsgranskning";
import ForhandsgranskaKnapp from "./ForhandsgranskaKnapp";
import ExportPdfButton from "./ExportPdfButton";
import Existerande from "./Existerande";
import { saveInvoice, hämtaFakturaMedRader } from "./actions";

function AnimatedFlik({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState("0px");

  const toggle = () => {
    if (!open && contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      setContentHeight(scrollHeight + "px");
      setOpen(true);
    } else {
      if (contentRef.current) {
        const scrollHeight = contentRef.current.scrollHeight;
        setContentHeight(scrollHeight + "px");
        requestAnimationFrame(() => {
          setContentHeight("0px");
        });
      }
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open && contentRef.current) {
      const timeout = setTimeout(() => {
        setContentHeight("auto");
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={toggle}
        className="w-full px-4 py-3 text-lg font-semibold flex items-center justify-between bg-slate-900 hover:bg-slate-800 rounded-t-lg transition"
      >
        <span>
          {icon} {title}
        </span>
        <span
          className={`ml-auto transition-transform duration-300 ${
            open ? "rotate-90" : ""
          } text-white`}
        >
          ▼
        </span>
      </button>
      <div
        ref={contentRef}
        style={{
          height: contentHeight,
          transition: "height 300ms ease",
          overflow: "hidden",
        }}
      >
        <div className="p-4 bg-slate-900">{children}</div>
      </div>
    </div>
  );
}

function Fakturasida() {
  const { formData, setFormData, kundStatus, setKundStatus } = useFakturaContext();
  const [showPreview, setShowPreview] = useState(false);

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
    if (!data || !data.faktura) {
      alert("❌ Kunde inte hämta faktura");
      return;
    }
    const { faktura, artiklar } = data;

    setFormData({
      id: faktura.id,
      fakturanummer: faktura.fakturanummer ?? "",
      fakturadatum: faktura.fakturadatum ?? "",
      forfallodatum: faktura.forfallodatum ?? "",
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

      artiklar: artiklar.map((rad: any) => ({
        beskrivning: rad.beskrivning,
        antal: Number(rad.antal),
        prisPerEnhet: Number(rad.prisPerEnhet),
        moms: Number(rad.moms),
        valuta: rad.valuta ?? "SEK",
        typ: (rad.typ === "tjänst" ? "tjänst" : "vara") as "tjänst" | "vara",
      })),
    });

    setKundStatus("loaded");
  };

  const handleSave = async () => {
    const fd = new FormData();

    try {
      const artiklarStr = JSON.stringify(formData.artiklar ?? []);
      fd.append("artiklar", artiklarStr);
    } catch (err) {
      alert("❌ Kunde inte konvertera artiklar");
      return;
    }

    Object.entries(formData).forEach(([k, v]) => {
      if (k !== "artiklar" && v !== undefined && v !== null) {
        fd.append(k, String(v));
      }
    });

    const res = await saveInvoice(fd);
    alert(res.success ? "✅ Faktura sparad!" : "❌ Kunde inte spara fakturan.");
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 print:hidden text-slate-100 overflow-x-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="w-full space-y-6 p-8 bg-cyan-950 border border-cyan-800 rounded-2xl shadow-lg">
          <h1 className="text-3xl text-center">Fakturor</h1>

          <AnimatedFlik title="Ladda in existerande" icon="📂">
            <Existerande onSelectCustomer={hanteraValdKund} onSelectInvoice={hanteraValdFaktura} />
          </AnimatedFlik>

          <AnimatedFlik title="Kunduppgifter" icon="🧑‍💻">
            <KundUppgifter />
          </AnimatedFlik>

          <AnimatedFlik title="Produkter & Tjänster" icon="📦">
            <ProdukterTjanster />
          </AnimatedFlik>

          <AnimatedFlik title="Villkor" icon="⚖️">
            <Villkor />
          </AnimatedFlik>

          <AnimatedFlik title="Övrigt" icon="🗒️">
            <Ovrigt />
          </AnimatedFlik>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSave}
                className="h-10 px-4 bg-cyan-700 rounded-lg hover:bg-cyan-800"
              >
                💾 Spara
              </button>
              <ExportPdfButton />
              <button
                onClick={() => window.print()}
                className="h-10 px-4 bg-cyan-700 rounded-lg hover:bg-cyan-800"
              >
                🖨️ Skriv ut
              </button>
            </div>

            <ForhandsgranskaKnapp
              onClick={() => setShowPreview(true)}
              className="h-10 px-4 bg-cyan-700 rounded-lg hover:bg-cyan-800"
            />
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <Forhandsgranskning />
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative bg-white shadow-xl rounded-2xl max-w-[95vw] max-h-[95vh] overflow-auto">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 rounded px-3 py-1"
            >
              Stäng
            </button>
            <div className="p-4 flex justify-center">
              <div className="w-[210mm] h-[297mm] shadow border">
                <Forhandsgranskning />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <FakturaProvider>
      <Fakturasida />
    </FakturaProvider>
  );
}
