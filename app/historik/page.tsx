import Historik from "./Historik";
import { fetchTransaktioner } from "./actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  // Starta ALLA asynkrona operationer samtidigt
  const delayPromise = new Promise((r) => setTimeout(r, 400));

  const currentYear = new Date().getFullYear();
  const fromYear = currentYear - 4;

  // Hämta ALLA transaktioner från senaste 5 åren (startar parallellt med delay)
  const dataPromise = fetchTransaktioner(`${fromYear}`);

  // Promise.all väntar på att alla blir klara (delay + data hämtas parallellt)
  const [, result] = await Promise.all([delayPromise, dataPromise]);

  const historyData =
    result.success && Array.isArray(result.data)
      ? result.data.map((item) => ({
          transaktions_id: item.id,
          transaktionsdatum: new Date(item.transaktionsdatum).toISOString().slice(0, 10),
          kontobeskrivning: item.kontobeskrivning || "",
          belopp: item.belopp ?? 0,
          kommentar: item.kommentar ?? "",
          fil: item.fil ?? "",
        }))
      : [];

  return <Historik initialData={historyData} />;
}
