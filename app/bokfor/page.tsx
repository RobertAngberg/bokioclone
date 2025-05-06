import Bokför from "./Bokför";
import { fetchFavoritforval } from "./actions";

export default async function Page() {
  // Simulerad fördröjning för att ge plats åt loading.tsx
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Hämta favoritförval innan komponenten laddas
  const favoritFörvalen = await fetchFavoritforval();

  return <Bokför favoritFörvalen={favoritFörvalen} />;
}
