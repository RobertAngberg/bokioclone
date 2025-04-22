import Startsida from "./Startsida";
import { fetchDataFromYear } from "./start/actions";

export default async function Page() {
  // 💡 Simulerad fördröjning för att ge plats åt loading.tsx
  await new Promise((resolve) => setTimeout(resolve, 400));

  // 🔄 Ladda årsdata i förväg så Startsida slipper göra det själv
  const initialData = await fetchDataFromYear("2025");

  return <Startsida initialData={initialData} />;
}
