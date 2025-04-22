// ✅ app/faktura/page.tsx
import { FakturaProvider } from "./FakturaProvider";
import Fakturor from "./Fakturor"; // eller Fakturasida, beroende på vad din komponent heter
import { hämtaSparadeKunder, hämtaSparadeFakturor } from "./actions";

export default async function Page() {
  await new Promise((r) => setTimeout(r, 400));

  const kunder = await hämtaSparadeKunder();
  const fakturor = await hämtaSparadeFakturor();

  return (
    <FakturaProvider>
      <Fakturor kunder={kunder} fakturor={fakturor} />
    </FakturaProvider>
  );
}
