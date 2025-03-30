"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

// ✅ SERVER ACTION: Save transaction
export async function saveTransaction(formData: FormData) {
  const transaktionsdatum = formData.get("transaktionsdatum")?.toString().trim() || "";
  const kommentar = formData.get("kommentar")?.toString().trim() || "";
  const kontonummer = formData.get("kontonummer")?.toString().trim() || "";
  const kontobeskrivning = formData.get("kontobeskrivning")?.toString().trim() || "";
  const belopp = parseFloat(formData.get("belopp")?.toString().trim() || "0");
  const moms = parseFloat(formData.get("moms")?.toString().trim() || "0");
  const beloppUtanMoms = parseFloat(formData.get("beloppUtanMoms")?.toString().trim() || "0");
  const fil = formData.get("fil") as File | null;
  const filename = fil ? fil.name : "";

  console.log("📥 Received form data:", {
    transaktionsdatum,
    kommentar,
    kontonummer,
    kontobeskrivning,
    belopp,
    moms,
    beloppUtanMoms,
    filename,
  });

  try {
    const konto = await prisma.konto.findFirst({ where: { kontonummer } });
    const företagskonto = await prisma.konto.findFirst({ where: { kontonummer: "1930" } });
    const momsKonto = await prisma.konto.findFirst({ where: { kontonummer: "2640" } }); // ingående moms
    const utgåendeMomsKonto = await prisma.konto.findFirst({ where: { kontonummer: "2610" } });

    if (!konto) throw new Error("⛔ Konto not found");
    if (!företagskonto || !momsKonto || !utgåendeMomsKonto) {
      throw new Error("⛔ Required standard accounts not found");
    }

    // ✅ Använd kontotyp direkt från kontot i databasen
    const kontotyp = konto.kontotyp;
    console.log("🧠 Bestämd kontotyp från konto:", kontotyp);

    const transaktionsposter =
      kontotyp === "Utgift"
        ? [
            { konto_id: företagskonto.konto_id, debet: 0, kredit: belopp },
            { konto_id: momsKonto.konto_id, debet: moms, kredit: 0 },
            { konto_id: konto.konto_id, debet: beloppUtanMoms, kredit: 0 },
          ]
        : [
            { konto_id: företagskonto.konto_id, debet: belopp, kredit: 0 },
            { konto_id: utgåendeMomsKonto.konto_id, debet: 0, kredit: moms },
            { konto_id: konto.konto_id, debet: 0, kredit: beloppUtanMoms },
          ];

    console.log("📌 Transaction rows to create:", transaktionsposter);

    const transaktion = await prisma.transaktion.create({
      data: {
        transaktionsdatum: new Date(transaktionsdatum),
        kontobeskrivning,
        kontotyp,
        belopp,
        fil: filename,
        kommentar,
        transaktionsposter: {
          create: transaktionsposter,
        },
      },
    });

    console.log("✅ Saved transaction ID:", transaktion.transaktions_id);

    revalidatePath("/grundbok");
    return {
      success: true,
      id: transaktion.transaktions_id,
      debug: {
        transaktionsposter,
        formData: {
          transaktionsdatum,
          kontonummer,
          kontotyp,
          belopp,
        },
      },
    };
  } catch (error) {
    console.error("❌ saveTransaction error:", error);
    return { success: false, error };
  }
}

// ✅ SERVER ACTION: Search account
export async function searchAccount(searchText: string) {
  if (!searchText) return null;

  try {
    const result = await prisma.konto.findFirst({
      where: {
        sökord: {
          contains: searchText,
          mode: "insensitive",
        },
      },
    });

    console.log("🔍Search result:", result);

    if (!result) return null;

    return {
      kontonummer: result.kontonummer,
      kontotyp: undefined,
      kontobeskrivning: result.kontobeskrivning ?? "",
      sökord: result.sökord ?? "",
    };
  } catch (error) {
    console.error("❌ searchAccount error:", error);
    return null;
  }
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function extractDataFromOCR(text: string) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            'Extract date and amount from OCR text. Respond with *raw* JSON only (no markdown, no triple backticks). Format: { "datum": "YYYY-MM-DD", "belopp": 1234.56 }.',
        },
        { role: "user", content: text },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (content && content.startsWith("{")) {
      return JSON.parse(content);
    }

    console.warn("⚠️ GPT unstructured content:", content);
    return { datum: "", belopp: 0 };
  } catch (error) {
    console.error("❌ extractDataFromOCR error:", error);
    return { datum: "", belopp: 0 };
  }
}

export async function getKontotyp(kontonummer: string) {
  try {
    const result = await prisma.konto.findFirst({
      where: {
        kontonummer: {
          equals: kontonummer.trim(),
        },
      },
    });
    console.log("✅ Hittat konto:", result);
    return result?.kontotyp ?? null;
  } catch (err) {
    console.error("❌ getKontotyp error:", err);
    return null;
  }
}
