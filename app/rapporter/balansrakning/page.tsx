import { fetchBalansData } from "./actions";
import Balansrakning from "./Balansrakning";

export default async function Page() {
  const year = "2025";
  const data = await fetchBalansData(year);

  if (!data) {
    return <div className="text-white p-8">❌ Ingen balansdata tillgänglig för {year}.</div>;
  }

  return <Balansrakning initialData={data} />;
}
