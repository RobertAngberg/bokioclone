import { fetchBalansData } from "./actions";
import Balansrapport from "./Balansrapport";

export default async function Page() {
  const year = "2025";
  const data = await fetchBalansData(year);

  if (!data) {
    return <div className="text-white p-8">❌ Ingen balansdata tillgänglig för {year}.</div>;
  }

  return <Balansrapport initialData={data} />;
}
