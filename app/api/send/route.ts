import { NextResponse } from "next/server";
import { Resend } from "resend";
import EmailTemplate from "./EmailTemplate";

// TA BORT DENNA RAD - initieras inte vid build-tid längre:
// const resend = new Resend(process.env.RESEND_API_KEY);

// Din egen e-postadress för testning
const DEV_EMAIL = "info@xn--bokfr-mua.com";

export async function POST(request: Request) {
  try {
    // FLYTTA RESEND INIT HIT - körs vid runtime när environment variables finns:
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing");
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY); // ✅ Runtime init!

    // Få data från request
    const body = await request.json();
    const { faktura, pdfAttachment, filename = "faktura.pdf", customMessage } = body;
    const firstName = faktura.kundnamn?.split(" ")[0] || "kund";

    // Kundens e-post (för visning i testkörningen)
    const customerEmail = faktura.kundemail || "ingen-email";

    // Skapa ämnesrad med företagsnamn - samma för alla miljöer
    const företagsnamn = faktura.företagsnamn || "Företag";
    const fakturanummer = faktura.fakturanummer || "";
    const subject = `Faktura #${fakturanummer} från ${företagsnamn}`;

    // Förbered e-postkontrollen
    const emailOptions: any = {
      from: process.env.RESEND_FROM_EMAIL || "Faktura <onboarding@resend.dev>",
      // Använd alltid din egen e-post för testning
      to: [process.env.NODE_ENV === "production" ? customerEmail : DEV_EMAIL],
      subject: subject,
      react: EmailTemplate({ firstName, faktura, customMessage }),
    };

    // Lägg till bilaga om den finns
    if (pdfAttachment) {
      emailOptions.attachments = [
        {
          filename: filename,
          content: pdfAttachment,
        },
      ];
    }

    const { data, error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      data,
      message:
        process.env.NODE_ENV !== "production"
          ? `E-post skickades till ${DEV_EMAIL} (i produktionsmiljö skulle den skickas till ${customerEmail})`
          : `E-post skickad till ${customerEmail}`,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Fel vid skickande av e-post" }, { status: 500 });
  }
}
