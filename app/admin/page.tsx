import Admin from "./Admin";

export default async function Page() {
  await new Promise((r) => setTimeout(r, 400));
  return <Admin />;
}
