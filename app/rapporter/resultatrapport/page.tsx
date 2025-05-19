import Resultatrapport from "./Resultatrapport";
import { hamtaResultatrapport, fetchFöretagsprofil } from "./actions";
import { auth } from "@/auth";

export default async function Page() {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const session = await auth();
  const userId = session?.user?.id;
  const profilPromise = userId ? fetchFöretagsprofil(Number(userId)) : Promise.resolve(null);

  const dataPromise = hamtaResultatrapport();
  const [data, profil] = await Promise.all([dataPromise, profilPromise]);

  return (
    <Resultatrapport
      initialData={data}
      företagsnamn={profil?.företagsnamn ?? ""}
      organisationsnummer={profil?.organisationsnummer ?? ""}
    />
  );
}
