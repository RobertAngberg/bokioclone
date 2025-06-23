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
 * Skattetabeller för olika inkomstnivåer
 */
export const SKATTETABELLER = {
  hög: { min: 35000, sats: 0.21974 }, // ✅ ÄNDRA FRÅN 0.21707 TILL 0.21974
  medel: { min: 31500, sats: 0.215 }, // ✅ Från tidigare test
  låg: { min: 30000, sats: 0.205 },
  grund: { min: 0, sats: 0.19 },
} as const;

/**
 * Bilersättning per km
 */
export const BILERSÄTTNING_SATSER = {
  bensinDiesel: 2.85, // kr per km
  el: 1.2, // kr per km
} as const;
