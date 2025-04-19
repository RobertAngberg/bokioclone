"use client";

import { FakturaProvider } from "./FakturaProvider";
import Steg1 from "./Steg1";

export default function Page() {
  return (
    <FakturaProvider>
      <Steg1 />
    </FakturaProvider>
  );
}
