// app/rapporter/balansrakning/page.tsx
import Balansrakning from "./Balansrakning";
import { fetchBalansData } from "./actions";

export default async function Page() {
  const year = "2025";
  const data = await fetchBalansData(year);

  console.log("✅ Fick balansdata:", data);

  if (!data || !Array.isArray(data.tillgangar) || !Array.isArray(data.skulderOchEgetKapital)) {
    return (
      <div className="text-white p-8">
        ❌ Ingen balansdata tillgänglig för {year}. Kontrollera att transaktioner finns.
      </div>
    );
  }

  return <Balansrakning initialData={data} />;
}
