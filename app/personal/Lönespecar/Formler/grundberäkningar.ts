import { BOKIO_KONSTANTER, BILERSÄTTNING_SATSER } from "./konstanter";
import { BilTyp } from "./typer";

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
 * ✅ LÄGG TILL: Beräknar obetald dag (alias för daglön)
 * För bakåtkompatibilitet med radKonfiguration.ts
 */
export function beräknaObetaldDag(månadslön: number): number {
  return beräknaDaglön(månadslön);
}

/**
 * ✅ LÄGG TILL: Beräknar sjukavdrag (samma som daglön)
 * För bakåtkompatibilitet
 */
export function beräknaSjukavdrag(månadslön: number): number {
  return beräknaDaglön(månadslön);
}

/**
 * ✅ LÄGG TILL: Beräknar föräldraledighetavdrag (samma som daglön)
 * För bakåtkompatibilitet
 */
export function beräknaFöräldraledighetavdrag(månadslön: number): number {
  return beräknaDaglön(månadslön);
}

/**
 * ✅ LÄGG TILL: Beräknar vårdavdrag (samma som daglön)
 * För bakåtkompatibilitet med "vård av sjukt barn"
 */
export function beräknaVårdavdrag(månadslön: number): number {
  return beräknaDaglön(månadslön);
}
