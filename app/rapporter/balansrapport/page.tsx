import Balansrapport from "./Balansrapport";
import { fetchBalansData, fetchFöretagsprofil } from "./actions";
import { auth } from "@/auth";

export default async function Page() {
  const sessionPromise = auth();
  const year = new Date().getFullYear().toString();
  const balansPromise = fetchBalansData(year);

  const session = await sessionPromise;
  const userId = session?.user?.id;
  const profilPromise = userId ? fetchFöretagsprofil(Number(userId)) : Promise.resolve(null);

  const [initialData, profil] = await Promise.all([balansPromise, profilPromise]);

  return (
    <Balansrapport
      initialData={initialData}
      företagsnamn={profil?.företagsnamn ?? ""}
      organisationsnummer={profil?.organisationsnummer ?? ""}
    />
  );
}
