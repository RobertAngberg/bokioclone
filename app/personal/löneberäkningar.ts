// =====================================================================================
// 🎯 CENTRALISERADE LÖNEBERÄKNINGAR
// =====================================================================================
// Alla formler och beräkningar från Formler-mappen konsoliderade till en enda fil
// Ersätter: konstanter.ts, typer.ts, grundberäkningar.ts, avgifter.ts,
//          skatteberäkning.ts, extrarader.ts, huvudberäkningar.ts
// =====================================================================================

// =====================================================================================
// 📋 INTERFACES OCH TYPER
// =====================================================================================

export interface LöneBeräkning {
  grundlön: number;
  tillägg: number;
  avdrag: number;
  bruttolön: number;
  socialaAvgifter: number;
  skatt: number;
  nettolön: number;
  totalLönekostnad: number;
}

export interface LöneKontrakt {
  månadslön: number;
  arbetstimmarPerVecka: number;
  skattetabell: string;
  skattekolumn: number;
  kommunalSkatt: number;
  socialaAvgifterSats: number;
}

export interface DagAvdrag {
  föräldraledighet: number;
  vårdAvSjuktBarn: number;
  sjukfrånvaro: number;
}

export type BilTyp = "bensinDiesel" | "el";

export interface Extrarad {
  kolumn1: string; // Benämning
  kolumn2: string; // Antal
  kolumn3: string; // Belopp
  kolumn4?: string; // Kommentar
}

// =====================================================================================
// 🔢 KONSTANTER OCH SATSER
// =====================================================================================

/**
 * Bokios officiella konstanter
 */
export const BOKIO_KONSTANTER = {
  DAGLÖN_PROCENT: 0.046,
  SJUKLÖN_PROCENT: 0.8,
  KARENSAVDRAG_PROCENT: 0.2,
  SEMESTERLÖN_PROCENT: 0.0043,
  SEMESTERERSÄTTNING_PROCENT: 0.12,
  VECKOR_PER_ÅR: 52,
  MÅNADER_PER_ÅR: 12,
  STANDARD_ARBETSTIMMAR_PER_VECKA: 40,
} as const;

/**
 * Skattetabeller från actions.ts + Formler-mappen konsoliderade
 */
const SKATTESATSER: { [key: number]: number } = {
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

/**
 * Skattetabeller för olika inkomstnivåer (från konstanter.ts)
 */
export const SKATTETABELLER = {
  hög: { min: 35000, sats: 0.21974 },
  medel: { min: 31500, sats: 0.215 },
  låg: { min: 30000, sats: 0.205 },
  grund: { min: 0, sats: 0.19 },
} as const;

/**
 * Sociala avgifter konstant
 */
const SOCIAL_AVGIFT_SATS = 0.3142; // 31.42%

/**
 * Bilersättning per km
 */
export const BILERSÄTTNING_SATSER = {
  bensinDiesel: 2.85, // kr per km
  el: 1.2, // kr per km
} as const;

/**
 * Lista över skattepliktiga förmåner och tillägg
 */
const SKATTEPLIKTIGA_POSTER = [
  "försäkring",
  "boende",
  "gratis frukost",
  "gratis lunch eller middag",
  "gratis mat",
  "parkering",
  "företagsbil",
  "annan förmån",
  "ränteförmån",
  "lön",
  "övertid",
  "ob-tillägg",
  "risktillägg",
  "semestertillägg",
] as const;

// =====================================================================================
// 🧮 GRUNDLÄGGANDE BERÄKNINGAR
// =====================================================================================

/**
 * Beräknar daglön enligt Bokios formel
 * Bokio: 1 dag = 4,6% av månadslön
 */
export function beräknaDaglön(månadslön: number): number {
  return månadslön * BOKIO_KONSTANTER.DAGLÖN_PROCENT;
}

/**
 * Beräknar timlön enligt Bokios formel
 * Bokio: månadslön × 12 / (52 × arbetstimmar per vecka)
 */
export function beräknaTimlön(månadslön: number, arbetstimmarPerVecka: number = 40): number {
  return (
    (månadslön * BOKIO_KONSTANTER.MÅNADER_PER_ÅR) /
    (BOKIO_KONSTANTER.VECKOR_PER_ÅR * arbetstimmarPerVecka)
  );
}

/**
 * Beräknar veckolön enligt Bokios formel
 * Bokio: årslön / 52 veckor
 */
export function beräknaVeckolön(månadslön: number): number {
  return (månadslön * BOKIO_KONSTANTER.MÅNADER_PER_ÅR) / BOKIO_KONSTANTER.VECKOR_PER_ÅR;
}

/**
 * Beräknar karensavdrag enligt Bokios formel
 * Bokio: 20% av veckosjuklön (som är 80% av veckolön)
 */
export function beräknaKarensavdrag(månadslön: number): number {
  const veckolön = beräknaVeckolön(månadslön);
  const veckosjuklön = veckolön * BOKIO_KONSTANTER.SJUKLÖN_PROCENT;
  return veckosjuklön * BOKIO_KONSTANTER.KARENSAVDRAG_PROCENT;
}

/**
 * Beräknar semesterlön enligt Bokios formel
 * Bokio: 0,43% av månadslön per dag
 */
export function beräknaSemesterLön(månadslön: number, dagar: number): number {
  return månadslön * BOKIO_KONSTANTER.SEMESTERLÖN_PROCENT * dagar;
}

/**
 * Beräknar semesterersättning enligt Bokios formel
 * Bokio: 12% av semesterlön
 */
export function beräknaSemesterersättning(semesterlön: number): number {
  return semesterlön * BOKIO_KONSTANTER.SEMESTERERSÄTTNING_PROCENT;
}

/**
 * Beräknar bilersättning enligt Bokios formel
 * Bokio: Olika satser för olika biltyper
 */
export function beräknaBilersättning(bilTyp: BilTyp, kilometer: number): number {
  return kilometer * BILERSÄTTNING_SATSER[bilTyp];
}

/**
 * Alias-funktioner för bakåtkompatibilitet
 */
export function beräknaObetaldDag(månadslön: number): number {
  return beräknaDaglön(månadslön);
}

export function beräknaSjukavdrag(månadslön: number): number {
  return beräknaDaglön(månadslön);
}

export function beräknaFöräldraledighetavdrag(månadslön: number): number {
  return beräknaDaglön(månadslön);
}

export function beräknaVårdavdrag(månadslön: number): number {
  return beräknaDaglön(månadslön);
}

// =====================================================================================
// 💰 LÖNEKONVERTERING (från actions.ts)
// =====================================================================================

/**
 * Konverterar olika lönetyper till månadslön
 * Flyttad från actions.ts rad 834-877
 */
export function konverteraLön(
  kompensation: number,
  ersättningPer: string,
  arbetsveckaTimmar: number = 40,
  deltidProcent?: number
): number {
  let grundlön = 0;

  switch (ersättningPer) {
    case "Månad":
      grundlön = kompensation;
      break;
    case "År":
      grundlön = kompensation / 12;
      break;
    case "Timme":
      grundlön = (kompensation * arbetsveckaTimmar * 52) / 12;
      break;
    case "Vecka":
      grundlön = (kompensation * 52) / 12;
      break;
    case "Dag":
      grundlön = kompensation * 21.7; // Genomsnitt arbetsdagar per månad
      break;
    default:
      grundlön = kompensation;
  }

  // Justera för deltid
  if (deltidProcent && deltidProcent < 100) {
    grundlön = grundlön * (deltidProcent / 100);
  }

  return Math.round(grundlön);
}

// =====================================================================================
// 🏦 AVGIFTER OCH SKATTER
// =====================================================================================

/**
 * Beräknar sociala avgifter
 */
export function beräknaSocialaAvgifter(
  bruttolön: number,
  sats: number = SOCIAL_AVGIFT_SATS
): number {
  return Math.round(bruttolön * sats);
}

/**
 * Beräknar total lönekostnad
 */
export function beräknaLönekostnad(bruttolön: number, socialaAvgifter: number): number {
  return bruttolön + socialaAvgifter;
}

/**
 * Identifierar om en post är skattepliktig
 */
export function ärSkattepliktig(benämning: string): boolean {
  return SKATTEPLIKTIGA_POSTER.some((typ) => benämning.toLowerCase().includes(typ.toLowerCase()));
}

/**
 * Beräknar skatt baserat på skattunderlag (från skatteberäkning.ts)
 */
export function beräknaSkatt(skattunderlag: number): number {
  let skattesats: number;

  if (skattunderlag >= SKATTETABELLER.hög.min) {
    skattesats = SKATTETABELLER.hög.sats;
  } else if (skattunderlag >= SKATTETABELLER.medel.min) {
    skattesats = SKATTETABELLER.medel.sats;
  } else if (skattunderlag >= SKATTETABELLER.låg.min) {
    skattesats = SKATTETABELLER.låg.sats;
  } else {
    skattesats = SKATTETABELLER.grund.sats;
  }

  return Math.round(skattunderlag * skattesats);
}

/**
 * Beräknar skatt med skattetabell (från actions.ts)
 */
export function beräknaSkattMedTabell(bruttolön: number, skattetabell?: number): number {
  const tabell = skattetabell || 34;
  const skattesats = SKATTESATSER[tabell] || 0.21974;
  return Math.round(bruttolön * skattesats);
}

/**
 * Beräknar skattunderlag med alla skattepliktiga tillägg
 */
export function beräknaSkattunderlag(grundlön: number, extrarader: any[]): number {
  let skattunderlag = grundlön;

  extrarader.forEach((rad) => {
    const belopp = parseFloat(rad.kolumn3) || 0;
    if (ärSkattepliktig(rad.kolumn1)) {
      skattunderlag += belopp;
    }
  });

  return skattunderlag;
}

// =====================================================================================
// 🎯 HUVUDBERÄKNINGAR - KOMPLETT LÖNEBERÄKNING
// =====================================================================================

/**
 * Komplett löneberäkning med extrarader (från huvudberäkningar.ts)
 * För avancerade beräkningar med övertid och dagavdrag
 */
export function beräknaKomplett(
  kontrakt: LöneKontrakt,
  övertidTimmar: number = 0,
  dagAvdrag: DagAvdrag = { föräldraledighet: 0, vårdAvSjuktBarn: 0, sjukfrånvaro: 0 },
  extrarader: any[] = []
) {
  // 1. Grundberäkningar
  const timlön = beräknaTimlön(kontrakt.månadslön, kontrakt.arbetstimmarPerVecka);
  const daglön = beräknaDaglön(kontrakt.månadslön);

  // 2. Övertidsersättning
  const övertidsersättning = övertidTimmar * timlön * 1.5;

  // 3. Dagavdrag
  const totalDagavdrag =
    (dagAvdrag.föräldraledighet + dagAvdrag.vårdAvSjuktBarn + dagAvdrag.sjukfrånvaro) * daglön;

  // 4. Extrarader
  let extraradsSumma = 0;
  extrarader.forEach((rad) => {
    const belopp = parseFloat(rad.kolumn3) || 0;
    extraradsSumma += belopp;
  });

  const justeradBruttolön =
    kontrakt.månadslön + övertidsersättning - totalDagavdrag + extraradsSumma;

  // 5. Skatt med extrarader
  const skattunderlag = beräknaSkattunderlag(
    kontrakt.månadslön + övertidsersättning - totalDagavdrag,
    extrarader
  );
  const skatt = beräknaSkatt(skattunderlag);

  const socialaAvgifter = beräknaSocialaAvgifter(justeradBruttolön, kontrakt.socialaAvgifterSats);
  const lönekostnad = beräknaLönekostnad(justeradBruttolön, socialaAvgifter);
  const nettolön = justeradBruttolön - skatt;

  return {
    timlön: Math.round(timlön * 100) / 100,
    daglön: Math.round(daglön),
    bruttolön: justeradBruttolön,
    socialaAvgifter,
    lönekostnad,
    skatt,
    dagavdrag: {
      föräldraledighet: dagAvdrag.föräldraledighet * daglön,
      vårdAvSjuktBarn: dagAvdrag.vårdAvSjuktBarn * daglön,
      sjukfrånvaro: dagAvdrag.sjukfrånvaro * daglön,
      totalt: totalDagavdrag,
    },
    nettolön,
    skattunderlag,
  };
}

/**
 * Huvudfunktion för lönekomponenter (från huvudberäkningar.ts)
 * För bakåtkompatibilitet med befintliga komponenter
 */
export function beräknaLönekomponenter(
  grundlön: number,
  övertid: number,
  lönespec: any,
  extrarader: any[]
) {
  const originalGrundlön = grundlön ?? lönespec?.grundlön ?? lönespec?.bruttolön ?? 35000;
  const originalÖvertid = övertid ?? lönespec?.övertid ?? 0;

  // Skapa kontrakt
  const kontrakt: LöneKontrakt = {
    månadslön: originalGrundlön,
    arbetstimmarPerVecka: 40,
    skattetabell: "34",
    skattekolumn: 1,
    kommunalSkatt: 32,
    socialaAvgifterSats: 0.3142,
  };

  // Analysera extrarader
  const dagAvdrag: DagAvdrag = {
    föräldraledighet: 0,
    vårdAvSjuktBarn: 0,
    sjukfrånvaro: 0,
  };

  const övrigaExtrarader: any[] = [];

  extrarader.forEach((rad) => {
    const antal = parseFloat(rad.kolumn2) || 1;

    if (rad.kolumn1?.toLowerCase().includes("föräldraledighet")) {
      dagAvdrag.föräldraledighet = antal;
    } else if (rad.kolumn1?.toLowerCase().includes("vård av sjukt barn")) {
      dagAvdrag.vårdAvSjuktBarn = antal;
    } else if (rad.kolumn1?.toLowerCase().includes("sjuk")) {
      dagAvdrag.sjukfrånvaro = antal;
    } else {
      övrigaExtrarader.push(rad);
    }
  });

  // Beräkna övertidstimmar
  const övertidTimmar = originalÖvertid > 0 ? originalÖvertid / (originalGrundlön * 0.01) : 0;

  // Använd huvudberäkning
  const beräkningar = beräknaKomplett(kontrakt, övertidTimmar, dagAvdrag, övrigaExtrarader);

  return {
    grundlön: originalGrundlön,
    övertid: originalÖvertid,
    extraradsSumma: övrigaExtrarader.reduce((sum, rad) => sum + (parseFloat(rad.kolumn3) || 0), 0),
    bruttolön: beräkningar.bruttolön,
    socialaAvgifter: beräkningar.socialaAvgifter,
    skatt: beräkningar.skatt,
    nettolön: beräkningar.nettolön,
    lönekostnad: beräkningar.lönekostnad,
    timlön: beräkningar.timlön,
    daglön: beräkningar.daglön,
    dagavdrag: beräkningar.dagavdrag,
    skattunderlag: beräkningar.skattunderlag,
  };
}

// =====================================================================================
// 📤 EXPORT SAMMANFATTNING
// =====================================================================================
// Huvudfunktioner för actions.ts: beräknaKompletLön(), konverteraLön()
// Huvudfunktioner för komponenter: beräknaLönekomponenter(), beräknaKomplett()
// Huvudfunktioner för bokföring: beräknaKompletLön() med extrarader
// Grundfunktioner: beräknaDaglön(), beräknaTimlön(), beräknaSocialaAvgifter(), etc.
