import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DinaUppgifter from "./DinaUppgifter";
import ArtiklarTjanster from "./ArtiklarTjanster";
import KundUppgifter from "./KundUppgifter";
import Villkor from "./Villkor";
import Ovrigt from "./Ovrigt";

export default async function FakturaPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/");
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return <p>Ingen användare hittades.</p>;

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 mt-4">Skapa en faktura</h1>
      <ArtiklarTjanster />
      <DinaUppgifter user={user} />
      <KundUppgifter user={user} />
      <Villkor />
      <Ovrigt />
    </main>
  );
}
