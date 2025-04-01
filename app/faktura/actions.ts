"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authorized" };

  const data = {
    företagsnamn: formData.get("företagsnamn")?.toString().trim() || null,
    organisationsnummer: formData.get("organisationsnummer")?.toString().trim() || null,
    momsnummer: formData.get("momsnummer")?.toString().trim() || null,
    adress: formData.get("adress")?.toString().trim() || null,
    adress2: formData.get("adress2")?.toString().trim() || null,
    postnummer: formData.get("postnummer")?.toString().trim() || null,
    stad: formData.get("stad")?.toString().trim() || null,
  };

  await prisma.user.update({
    where: { email: session.user.email },
    data,
  });

  revalidatePath("/faktura");
  return { success: true };
}

export async function updateCustomerProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authorized" };

  const kundId = parseInt(formData.get("kundId")?.toString() || "0");
  if (!kundId) return { error: "Ogiltigt kund-ID" };

  const data = {
    FöretagEllerPrivat: formData.get("FöretagEllerPrivat")?.toString().trim() || null,
    Företagsnamn: formData.get("Företagsnamn")?.toString().trim() || null,
    Organisationsnummer: formData.get("Organisationsnummer")?.toString().trim() || null,
    Momsnummer: formData.get("Momsnummer") ? BigInt(formData.get("Momsnummer")!.toString()) : null,
    Kundnummer: formData.get("Kundnummer") ? BigInt(formData.get("Kundnummer")!.toString()) : null,
    Postadress: formData.get("Postadress")?.toString().trim() || null,
    Postadress2: formData.get("Postadress2")?.toString().trim() || null,
    Postnummer: formData.get("Postnummer")
      ? parseInt(formData.get("Postnummer")!.toString())
      : null,
    Stad: formData.get("Stad")?.toString().trim() || null,
    BetalningsvillkorDagar: formData.get("BetalningsvillkorDagar")
      ? parseInt(formData.get("BetalningsvillkorDagar")!.toString())
      : null,
    Dröjsmålsränta: formData.get("Dröjsmålsränta")
      ? parseFloat(formData.get("Dröjsmålsränta")!.toString())
      : null,
    Leverans: formData.get("Leverans")?.toString().trim() || null,
    OmvändSkattskyldighet: formData.get("OmvändSkattskyldighet")?.toString() === "true",
  };

  await prisma.kunder.update({
    where: {
      id: kundId,
      userId: parseInt(session.user.id),
    },
    data,
  });

  revalidatePath("/faktura");
  return { success: true };
}
