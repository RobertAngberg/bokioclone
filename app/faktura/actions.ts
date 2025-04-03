"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveInvoice(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Ingen inloggad användare");

  const userId = parseInt(session.user.id);

  try {
    const artiklar = JSON.parse(formData.get("artiklar")?.toString() || "[]");

    const faktura = await prisma.faktura.create({
      data: {
        userId,
        fakturanummer: formData.get("fakturanummer")?.toString() || "",
        fakturadatum: new Date(formData.get("fakturadatum")?.toString() || new Date()),
        forfallodatum: new Date(formData.get("forfallodatum")?.toString() || new Date()),
        betalningsmetod: formData.get("betalningsmetod")?.toString() || null,
        betalningsvillkor: formData.get("betalningsvillkor")?.toString() || null,
        drojsmalsranta: formData.get("drojsmalsranta")?.toString() || null,
        leverans: formData.get("leverans")?.toString() || null,
        kommentar: formData.get("kommentar")?.toString() || null,

        företagsnamn: formData.get("företagsnamn")?.toString() || "",
        adress: formData.get("adress")?.toString() || "",
        postnummer: formData.get("postnummer")?.toString() || "",
        stad: formData.get("stad")?.toString() || "",
        email: formData.get("email")?.toString() || "",
        logo: formData.get("logo")?.toString() || null,

        kundnamn: formData.get("kundnamn")?.toString() || "",
        kundadress: formData.get("kundadress")?.toString() || "",
        kundpostnummer: formData.get("kundpostnummer")?.toString() || "",
        kundstad: formData.get("kundstad")?.toString() || "",
        kundemail: formData.get("kundemail")?.toString() || "",
        kundtyp: formData.get("kundtyp")?.toString() || "",

        artiklar: {
          create: artiklar.map((rad: any) => ({
            beskrivning: rad.beskrivning,
            antal: rad.antal,
            prisPerEnhet: rad.prisPerEnhet,
            moms: rad.moms,
            valuta: rad.valuta,
            typ: rad.typ,
          })),
        },
      },
    });

    console.log("✅ Sparad faktura:", faktura.id);
    revalidatePath("/fakturor");
    return { success: true, id: faktura.id };
  } catch (error) {
    console.error("❌ saveInvoice error:", error);
    return { success: false, error };
  }
}

export async function getAllInvoices() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, invoices: [] };

  const userId = parseInt(session.user.id);

  try {
    const fakturor = await prisma.faktura.findMany({
      where: { userId },
      include: {
        artiklar: true, // 👈 inkluderar fakturarader
      },
      orderBy: { id: "desc" },
    });

    return { success: true, invoices: fakturor }; // Justera så att det är i rätt format
  } catch (error) {
    console.error("❌ Error fetching invoices:", error);
    return { success: false, invoices: [] }; // Hantera eventuella fel
  }
}
