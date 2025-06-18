// Bokios officiella beräkningar baserat på deras dokumentation

/**
 * Beräknar daglön enligt Bokios formel
 * Bokio: 1 dag = 4,6% av månadslön
 */
export function beräknaDaglön(månadslön: number): number {
  return månadslön * 0.046;
}

/**
 * Beräknar timlön enligt Bokios formel
 * Bokio: månadslön × 12 / (52 × arbetstimmar per vecka)
 */
export function beräknaTimlön(månadslön: number, arbetstimmarPerVecka: number = 40): number {
  return (månadslön * 12) / (52 * arbetstimmarPerVecka);
}

/**
 * Beräknar veckolön enligt Bokios formel
 * Bokio: årslön / 52 veckor
 */
export function beräknaVeckolön(månadslön: number): number {
  return (månadslön * 12) / 52;
}

/**
 * Beräknar karensavdrag enligt Bokios formel
 * Bokio: 20% av veckosjuklön (som är 80% av veckolön)
 */
export function beräknaKarensavdrag(månadslön: number): number {
  const veckolön = beräknaVeckolön(månadslön);
  const veckosjuklön = veckolön * 0.8; // 80% av veckolön
  return veckosjuklön * 0.2; // 20% av veckosjuklön
}

/**
 * Beräknar värdet för en obetald dag
 * Använder Bokios dagslön (4,6% av månadslön)
 */
export function beräknaObetaldDag(månadslön: number): number {
  return beräknaDaglön(månadslön);
}

/**
 * Beräknar reducerade dagar enligt Bokios formel
 * Reducerade dagar = kombination av frånvaro + sjuklön (80%)
 * Resultat: Nettoavdrag per dag (20% av dagslön)
 */
export function beräknaReduceradeDagar(månadslön: number, antalDagar: number): number {
  const daglön = beräknaDaglön(månadslön);
  const nettoAvdragPerDag = daglön * 0.2; // 20% av dagslön (100% - 80% sjuklön)
  return nettoAvdragPerDag * antalDagar;
}

/**
 * Beräknar reducerade dagar per timme
 * Användbart för delvis frånvaro
 */
export function beräknaReduceradeDagarPerTimme(
  månadslön: number,
  antalTimmar: number,
  arbetstimmarPerDag: number = 8
): number {
  const daglön = beräknaDaglön(månadslön);
  const nettoAvdragPerTimme = (daglön * 0.2) / arbetstimmarPerDag; // 20% av dagslön ÷ 8h
  return nettoAvdragPerTimme * antalTimmar;
}

/**
 * Beräknar sjuklön enligt Bokios formel
 * Bokio: 80% av dagslön × antal dagar
 */
export function beräknaSjuklön(månadslön: number, antalDagar: number): number {
  const daglön = beräknaDaglön(månadslön);
  return daglön * antalDagar * 0.8;
}

/**
 * Beräknar semesterlön enligt Bokios formel
 * Bokio: 0,43% av månadslön (sammalöneregeln)
 */
export function beräknaSemesterlön(månadslön: number): number {
  return månadslön * 0.0043;
}

/**
 * Beräknar semesterersättning för timanställda enligt Bokios formel
 * Bokio: 12% av timlön × arbetstimmar (procentregeln)
 */
export function beräknaSemesterersättning(timlön: number, arbetstimmar: number): number {
  return timlön * arbetstimmar * 0.12;
}

/**
 * Beräknar föräldrapenning (80% av dagslön som standard)
 * Bokio: Liknande sjuklön men för föräldraledighet
 */
export function beräknaFöräldrapenning(månadslön: number, antalDagar: number): number {
  const daglön = beräknaDaglön(månadslön);
  return daglön * antalDagar * 0.8;
}

/**
 * Beräknar VAB (Vård av sjukt barn) - 80% av dagslön
 * Bokio: Samma som sjuklön
 */
export function beräknaVAB(månadslön: number, antalDagar: number): number {
  return beräknaSjuklön(månadslön, antalDagar);
}

/**
 * Detaljerad beräkning av reducerade dagar för transparens
 */
export function detaljberäkningReduceradeDagar(månadslön: number, antalDagar: number) {
  const daglön = beräknaDaglön(månadslön);
  const totalFrånvaro = daglön * antalDagar; // Totalt avdrag för frånvaro
  const sjuklön = totalFrånvaro * 0.8; // 80% ersätts med sjuklön
  const nettoAvdrag = totalFrånvaro - sjuklön; // 20% kvar som nettokostnad

  return {
    daglön,
    totalFrånvaro,
    sjuklön,
    nettoAvdrag,
    nettoAvdragPerDag: nettoAvdrag / antalDagar,
  };
}

/**
 * Hjälpfunktion för att formatera belopp till svenska kronor
 */
export function formateraBeloppSEK(belopp: number): string {
  return (
    belopp.toLocaleString("sv-SE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " kr"
  );
}

/**
 * Hjälpfunktion för att avrunda till 2 decimaler
 */
export function avrundaBelopp(belopp: number): number {
  return Math.round(belopp * 100) / 100;
}

// Konstanter för Bokios beräkningar
export const BOKIO_KONSTANTER = {
  DAGLÖN_PROCENT: 0.046, // 4,6%
  SJUKLÖN_PROCENT: 0.8, // 80%
  KARENSAVDRAG_PROCENT: 0.2, // 20%
  SEMESTERLÖN_PROCENT: 0.0043, // 0,43%
  SEMESTERERSÄTTNING_PROCENT: 0.12, // 12%
  VECKOR_PER_ÅR: 52,
  MÅNADER_PER_ÅR: 12,
  STANDARD_ARBETSTIMMAR_PER_VECKA: 40,
} as const;
