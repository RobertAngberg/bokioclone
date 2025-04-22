import Huvudbok from "./Huvudbok";
import { fetchHuvudbok } from "./actions";

export default async function Page() {
  await new Promise((r) => setTimeout(r, 400));

  const result = await fetchHuvudbok();

  return <Huvudbok initialData={result} />;
}
