import Resultatrapport from "./Resultatrapport";
import { hamtaResultatrapport } from "./actions";

export default async function Page() {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const data = await hamtaResultatrapport();

  return <Resultatrapport initialData={data} />;
}
