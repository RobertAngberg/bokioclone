// ✅ app/grundbok/page.tsx
import Grundbok from "./Grundbok";
import { fetchTransaktioner } from "./actions";

export default async function Page() {
  await new Promise((r) => setTimeout(r, 400));

  const result = await fetchTransaktioner("2025");
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

  return <Grundbok initialData={historyData} />;
}
