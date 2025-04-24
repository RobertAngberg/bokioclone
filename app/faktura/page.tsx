// ✅ app/faktura/page.tsx
import { FakturaProvider } from "./FakturaProvider";
import Fakturor from "./Fakturor";
import {
  hämtaSparadeKunder,
  hämtaSparadeFakturor,
  hämtaSparadeArtiklar, // 🆕 lägg till
} from "./actions";

export default async function Page() {
  await new Promise((r) => setTimeout(r, 400));

  const kunder = await hämtaSparadeKunder();
  const fakturor = await hämtaSparadeFakturor();
  const artiklar = await hämtaSparadeArtiklar(); // 🆕 hämta artiklar

  return (
    <FakturaProvider>
      <Fakturor kunder={kunder} fakturor={fakturor} artiklar={artiklar} /> {/* 🆕 skicka in */}
    </FakturaProvider>
  );
}
