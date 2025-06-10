//#region Huvud
"use client";

import { useState } from "react";
import AnställdInfo from "./Lönespec/AnställdInfo";
import LönespecHeader from "./Lönespec/LönespecHeader";
import Lönetabell from "./Lönespec/Lönetabell";
import Sammanfattning from "./Lönespec/Sammanfattning";
import Företagsinfo from "./Lönespec/Företagsinfo";
import Förhandsgranskning from "./Lönespec/Förhandsgranskning";
import ExporteraPDFKnapp from "./Lönespec/ExporteraPDFKnapp";

interface LönespecProps {
  anställd?: any;
}
//#endregion

export default function Lönespec({ anställd }: LönespecProps) {
  const [showPreview, setShowPreview] = useState(false);

  //#region Beräkningar
  // Dynamisk skatteberäkning
  const beräknaSkatt = (bruttolön: number, skattetabell: number): number => {
    const skattesatser: { [key: number]: number } = {
      29: 0.18,
      30: 0.2,
      31: 0.21974,
      32: 0.24,
      33: 0.26,
      34: 0.21974,
      35: 0.3,
      36: 0.32,
      37: 0.34,
      38: 0.36,
      39: 0.38,
      40: 0.4,
      41: 0.42,
      42: 0.44,
    };

    const skattesats = skattesatser[skattetabell] || 0.21974;
    return Math.round(bruttolön * skattesats);
  };

  // Bokios socialskatt (31.42% exakt)
  const beräknaSocialSkatt = (bruttolön: number): number => {
    return Math.round(bruttolön * 0.3142);
  };

  // Bokios månadslön beräkning
  const beräknaMånadslön = (anställd: any): number => {
    if (!anställd.kompensation) return 0;
    const lön = parseFloat(anställd.kompensation);

    switch (anställd.ersättning_per) {
      case "Timme":
        const timmarPerVecka = parseFloat(anställd.arbetsvecka_timmar) || 40;
        return (lön * timmarPerVecka * 52) / 12;
      case "Dag":
        return lön / 0.046;
      case "Vecka":
        return (lön * 52) / 12;
      case "År":
        return lön / 12;
      case "Månad":
      default:
        return lön;
    }
  };

  // Beräkna löneperiod (föregående månad)
  const beräknaLöneperiod = (): string => {
    const now = new Date();
    const år = now.getFullYear();
    const månad = now.getMonth() - 1; // Föregående månad

    const startDatum = new Date(år, månad, 1);
    const slutDatum = new Date(år, månad + 1, 0);

    return `${startDatum.toISOString().split("T")[0]} - ${slutDatum.toISOString().split("T")[0]}`;
  };

  // Beräkna utbetalningsdatum (25:e nuvarande månad)
  const beräknaUtbetalning = (): string => {
    const now = new Date();
    const år = now.getFullYear();
    const månad = now.getMonth();
    const utbetalningsDatum = new Date(år, månad, 25);

    return utbetalningsDatum.toISOString().split("T")[0];
  };
  //#endregion

  if (!anställd) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl text-white font-semibold">Lönespecar</h3>
          <p className="text-gray-400">Välj en anställd för att visa lönespecar.</p>
        </div>
      </div>
    );
  }

  //#region Formler
  const månadslön = beräknaMånadslön(anställd);
  const bruttolön =
    anställd.arbetsbelastning === "Deltid" && anställd.deltid_procent
      ? Math.round(månadslön * (parseFloat(anställd.deltid_procent) / 100))
      : månadslön;

  const skattetabell = parseInt(anställd.skattetabell) || 34;
  const skatt = beräknaSkatt(bruttolön, skattetabell);
  const nettolön = bruttolön - skatt;
  const socialSkatt = beräknaSocialSkatt(bruttolön);
  const totalLönekostnad = bruttolön + socialSkatt;

  const löneperiod = beräknaLöneperiod();
  const utbetalning = beräknaUtbetalning();
  //#endregion

  return (
    <>
      <div className="space-y-6 max-w-4xl mx-auto">
        <AnställdInfo
          anställd={anställd}
          personnummer={anställd.personnummer}
          bankkonto={`${anställd.clearingnummer}-${anställd.bankkonto}`}
        />

        <div className="bg-slate-800 p-6 rounded-lg">
          <LönespecHeader
            personnummer={anställd.personnummer}
            bankkonto={`${anställd.clearingnummer}-${anställd.bankkonto}`}
            löneperiod={löneperiod}
          />

          <Lönetabell bruttolön={bruttolön} />

          <Sammanfattning
            bruttolön={bruttolön}
            skatt={skatt}
            nettolön={nettolön}
            socialSkatt={socialSkatt}
            totalLönekostnad={totalLönekostnad}
            utbetalning={utbetalning}
            anställd={anställd}
          />
        </div>

        <Företagsinfo anställd={anställd} />

        <ExporteraPDFKnapp onClick={() => setShowPreview(true)} />
      </div>

      <Förhandsgranskning
        anställd={anställd}
        bruttolön={bruttolön}
        skatt={skatt}
        nettolön={nettolön}
        socialSkatt={socialSkatt}
        totalLönekostnad={totalLönekostnad}
        utbetalning={utbetalning}
        löneperiod={löneperiod}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}
