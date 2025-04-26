import { getMomsrapport } from "./actions";
import Momsrapport from "./Momsrapport";
import MainLayout from "../../_components/MainLayout";

export default async function Page() {
  const data = await getMomsrapport("2025");

  return (
    <MainLayout>
      <Momsrapport initialData={data} />
    </MainLayout>
  );
}
