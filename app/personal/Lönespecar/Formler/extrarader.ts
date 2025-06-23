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

/**
 * Identifierar om en post är skattepliktig
 */
export function ärSkattepliktig(benämning: string): boolean {
  return SKATTEPLIKTIGA_POSTER.some((typ) => benämning.toLowerCase().includes(typ.toLowerCase()));
}
