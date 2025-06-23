import { SKATTETABELLER } from "./konstanter";
import { ärSkattepliktig } from "./extrarader";

/**
 * Beräknar skatt baserat på skattunderlag
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
