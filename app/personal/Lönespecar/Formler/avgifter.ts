/**
 * Beräknar sociala avgifter
 */
export function beräknaSocialaAvgifter(bruttolön: number, sats: number = 0.3142): number {
  return Math.round(bruttolön * sats);
}

/**
 * Beräknar total lönekostnad
 */
export function beräknaLönekostnad(bruttolön: number, socialaAvgifter: number): number {
  return bruttolön + socialaAvgifter;
}
