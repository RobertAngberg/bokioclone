// ✅ app/rapporter/page.tsx
import Rapporter from "./Rapporter";

export default async function Page() {
  // Simulerad delay (t.ex. för skeleton loaders etc.)
  await new Promise((r) => setTimeout(r, 400));

  return <Rapporter />;
}
