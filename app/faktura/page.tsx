//#region Huvud
import { FakturaProvider } from "./FakturaProvider";
import Fakturor from "./Fakturor";
import { hämtaSparadeKunder, hämtaSparadeFakturor, hämtaSparadeArtiklar } from "./actions";
//#endregion

export default async function Page() {
  await new Promise((r) => setTimeout(r, 400));

  const [kunder, fakturor, artiklar] = await Promise.all([
    hämtaSparadeKunder(),
    hämtaSparadeFakturor(),
    hämtaSparadeArtiklar(),
  ]);

  return (
    <FakturaProvider>
      <Fakturor kunder={kunder} fakturor={fakturor} artiklar={artiklar} />
    </FakturaProvider>
  );
}
