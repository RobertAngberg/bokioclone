//#region Huvud
"use client";

import { useState, useEffect, useCallback } from "react";
import { hämtaLönespecifikationer, hämtaUtlägg, hämtaFöretagsprofil } from "../actions";
import LönespecList from "./LönespecList";
import LoadingSpinner from "../../_components/LoadingSpinner";
import Förhandsgranskning from "./Förhandsgranskning";

interface LönespecProps {
  anställd: any;
  specificLönespec?: any;
  ingenAnimering?: boolean;
  onTaBortLönespec?: () => void;
  taBortLoading?: boolean;
}

export default function Lönespecar({
  anställd,
  specificLönespec,
  ingenAnimering,
  onTaBortLönespec,
  taBortLoading,
}: LönespecProps) {
  //#endregion

  //#region State
  const [lönespecar, setLönespecar] = useState<any[]>([]);
  const [utlägg, setUtlägg] = useState<any[]>([]);
  const [företagsprofil, setFöretagsprofil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [visaFörhandsgranskning, setVisaFörhandsgranskning] = useState<string | null>(null);
  const [beräknadeVärden, setBeräknadeVärden] = useState<any>({});
  //#endregion

  //#region Data Loading
  useEffect(() => {
    if (specificLönespec) {
      setLönespecar([specificLönespec]);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      if (!anställd?.id) return;

      try {
        setLoading(true);
        const [lönespecarData, utläggData] = await Promise.all([
          hämtaLönespecifikationer(anställd.id),
          hämtaUtlägg(anställd.id),
        ]);

        setLönespecar(lönespecarData);
        setUtlägg(utläggData);

        const session = await fetch("/api/session").then((r) => r.json());
        if (session?.user?.id) {
          const företagsprofilData = await hämtaFöretagsprofil(session.user.id);
          setFöretagsprofil(företagsprofilData);
        }
      } catch (error) {
        console.error("Fel vid laddning av data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [anställd?.id, specificLönespec]);
  //#endregion

  //#region Handlers
  const handleBeräkningarUppdaterade = useCallback((lönespecId: string, beräkningar: any) => {
    setBeräknadeVärden((prev: any) => ({
      ...prev,
      [lönespecId]: beräkningar,
    }));
  }, []);
  //#endregion

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <LönespecList
        lönespecar={lönespecar}
        anställd={anställd}
        utlägg={utlägg}
        onFörhandsgranskning={setVisaFörhandsgranskning}
        onBeräkningarUppdaterade={handleBeräkningarUppdaterade}
        beräknadeVärden={beräknadeVärden}
        ingenAnimering={ingenAnimering}
        onTaBortLönespec={onTaBortLönespec}
        taBortLoading={taBortLoading}
      />

      {visaFörhandsgranskning && (
        <Förhandsgranskning
          lönespec={lönespecar.find((l) => l.id === visaFörhandsgranskning)}
          anställd={anställd}
          företagsprofil={företagsprofil}
          onStäng={() => setVisaFörhandsgranskning(null)}
        />
      )}
    </>
  );
}
