//#region Huvud
"use client";

import { useEffect, useState, useMemo } from "react";
import { hämtaExtrarader, taBortExtrarad } from "../../actions";
import ExtraRader from "../Extrarader/Extrarader";
import LöneTabell from "./LöneTabell";
import { beräknaLönekomponenter } from "../Formler";

type LönekomponenterProps = {
  lönespec: any;
  grundlön?: number;
  övertid?: number;
  bruttolön?: number;
  socialaAvgifter?: number;
  skatt?: number;
  onBeräkningarUppdaterade?: (lönespecId: string, beräkningar: any) => void;
};

export default function Lönekomponenter({
  lönespec,
  grundlön,
  övertid,
  onBeräkningarUppdaterade,
}: LönekomponenterProps) {
  //#endregion

  //#region State
  const [extrarader, setExtrarader] = useState<any[]>([]);
  //#endregion

  //#region Beräkningar
  const beräknadeVärden = useMemo(() => {
    // Från formler.ts
    return beräknaLönekomponenter(grundlön ?? 0, övertid ?? 0, lönespec, extrarader);
  }, [grundlön, övertid, lönespec, extrarader]);
  //#endregion

  //#region Effects
  useEffect(() => {
    if (lönespec?.id) {
      hämtaExtrarader(lönespec.id).then(setExtrarader);
    }
  }, [lönespec?.id]);

  useEffect(() => {
    if (onBeräkningarUppdaterade && lönespec?.id && beräknadeVärden) {
      onBeräkningarUppdaterade(lönespec.id, beräknadeVärden);
    }
  }, [beräknadeVärden, onBeräkningarUppdaterade, lönespec?.id]);
  //#endregion

  //#region Handlers
  const handleTaBortExtrarad = async (extraradId: number) => {
    if (confirm("Är du säker på att du vill ta bort denna rad?")) {
      try {
        await taBortExtrarad(extraradId);
        if (lönespec?.id) {
          hämtaExtrarader(lönespec.id).then(setExtrarader);
        }
      } catch (error) {
        console.error("Fel vid borttagning av extrarad:", error);
        alert("Kunde inte ta bort raden");
      }
    }
  };

  const handleNyRad = () => {
    if (lönespec?.id) {
      hämtaExtrarader(lönespec.id).then(setExtrarader);
    }
  };
  //#endregion

  return (
    <div className="bg-slate-700 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Lönekomponenter</h3>

      {/* Debug info */}
      {process.env.NODE_ENV === "development" && (
        <div className="mb-4 p-2 bg-slate-600 rounded text-xs text-yellow-300">
          <strong>Debug:</strong> Skattunderlag: {beräknadeVärden.skattunderlag?.toLocaleString()}{" "}
          kr | Skatt: {beräknadeVärden.skatt?.toLocaleString()} kr | Extrarader: {extrarader.length}{" "}
          st
        </div>
      )}

      <LöneTabell
        beräknadeVärden={beräknadeVärden}
        extrarader={extrarader}
        onTaBortExtrarad={handleTaBortExtrarad}
      />

      <ExtraRader
        lönespecId={lönespec?.id}
        grundlön={beräknadeVärden.grundlön}
        onNyRad={handleNyRad}
      />
    </div>
  );
}
