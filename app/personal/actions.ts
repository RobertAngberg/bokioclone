//#region
"use server";

import { Pool } from "pg";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

type AnställdData = {
  förnamn: string;
  efternamn: string;
  personnummer: string;
  jobbtitel: string;
  mail: string;
  clearingnummer: string;
  bankkonto: string;
  adress: string;
  postnummer: string;
  ort: string;
  startdatum: string;
  slutdatum: string;
  anställningstyp: string;
  löneperiod: string;
  ersättningPer: string;
  kompensation: string;
  arbetsvecka: string;
  arbetsbelastning: string;
  deltidProcent: string;
  tjänsteställeAdress: string;
  tjänsteställeOrt: string;
  skattetabell: string;
  skattekolumn: string;
  växaStöd: boolean;
};
//#endregion

export async function hämtaAllaAnställda() {
  console.log("🚀 hämtaAllaAnställda() startar...");

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Ingen inloggad användare");
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const client = await pool.connect();

    const query = `
      SELECT * FROM anställda 
      WHERE user_id = $1 
      ORDER BY skapad DESC
    `;

    const result = await client.query(query, [userId]);
    console.log("✅ Hittade", result.rows.length, "anställda");

    client.release();
    return result.rows;
  } catch (error) {
    console.error("❌ hämtaAllaAnställda error:", error);
    return [];
  }
}

export async function hämtaAnställd(anställdId: number) {
  console.log("🚀 hämtaAnställd() startar för ID:", anställdId);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Ingen inloggad användare");
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const client = await pool.connect();

    const query = `
      SELECT * FROM anställda 
      WHERE id = $1 AND user_id = $2
    `;

    const result = await client.query(query, [anställdId, userId]);
    console.log("✅ Hämtade anställd:", result.rows[0]);

    client.release();
    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ hämtaAnställd error:", error);
    return null;
  }
}

export async function sparaAnställd(data: AnställdData, anställdId?: number | null) {
  console.log("🚀 sparaAnställd() startar...", { anställdId });

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Ingen inloggad användare");
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const client = await pool.connect();

    // Om anställdId finns - UPPDATERA, annars SKAPA NY
    if (anställdId) {
      // UPPDATERA befintlig anställd
      const updateQuery = `
        UPDATE anställda SET
          förnamn = $1, efternamn = $2, personnummer = $3, jobbtitel = $4, mail = $5,
          clearingnummer = $6, bankkonto = $7, adress = $8, postnummer = $9, ort = $10,
          startdatum = $11, slutdatum = $12, anställningstyp = $13, löneperiod = $14, ersättning_per = $15,
          kompensation = $16, arbetsvecka_timmar = $17, arbetsbelastning = $18, deltid_procent = $19,
          tjänsteställe_adress = $20, tjänsteställe_ort = $21,
          skattetabell = $22, skattekolumn = $23, växa_stöd = $24,
          uppdaterad = NOW()
        WHERE id = $25 AND user_id = $26
        RETURNING id
      `;

      const values = [
        data.förnamn || null,
        data.efternamn || null,
        data.personnummer || null,
        data.jobbtitel || null,
        data.mail || null,
        data.clearingnummer || null,
        data.bankkonto || null,
        data.adress || null,
        data.postnummer || null,
        data.ort || null,
        data.startdatum || null,
        data.slutdatum || null,
        data.anställningstyp || null,
        data.löneperiod || null,
        data.ersättningPer || null,
        data.kompensation ? parseFloat(data.kompensation) : null,
        data.arbetsvecka ? parseInt(data.arbetsvecka, 10) : null,
        data.arbetsbelastning || null,
        data.deltidProcent ? parseInt(data.deltidProcent, 10) : null,
        data.tjänsteställeAdress || null,
        data.tjänsteställeOrt || null,
        data.skattetabell ? parseInt(data.skattetabell, 10) : null,
        data.skattekolumn ? parseInt(data.skattekolumn, 10) : null,
        data.växaStöd,
        anställdId,
        userId,
      ];

      console.log("� Uppdaterar anställd ID:", anställdId);
      const result = await client.query(updateQuery, values);

      client.release();
      revalidatePath("/personal");

      return {
        success: true,
        id: anställdId,
        message: "Anställd uppdaterad!",
      };
    } else {
      // SKAPA NY anställd
      const insertQuery = `
        INSERT INTO anställda (
          förnamn, efternamn, personnummer, jobbtitel, mail,
          clearingnummer, bankkonto, adress, postnummer, ort,
          startdatum, slutdatum, anställningstyp, löneperiod, ersättning_per,
          kompensation, arbetsvecka_timmar, arbetsbelastning, deltid_procent,
          tjänsteställe_adress, tjänsteställe_ort,
          skattetabell, skattekolumn, växa_stöd,
          user_id
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15,
          $16, $17, $18, $19,
          $20, $21,
          $22, $23, $24,
          $25
        ) RETURNING id
      `;

      const values = [
        data.förnamn || null,
        data.efternamn || null,
        data.personnummer || null,
        data.jobbtitel || null,
        data.mail || null,
        data.clearingnummer || null,
        data.bankkonto || null,
        data.adress || null,
        data.postnummer || null,
        data.ort || null,
        data.startdatum || null,
        data.slutdatum || null,
        data.anställningstyp || null,
        data.löneperiod || null,
        data.ersättningPer || null,
        data.kompensation ? parseFloat(data.kompensation) : null,
        data.arbetsvecka ? parseInt(data.arbetsvecka, 10) : null,
        data.arbetsbelastning || null,
        data.deltidProcent ? parseInt(data.deltidProcent, 10) : null,
        data.tjänsteställeAdress || null,
        data.tjänsteställeOrt || null,
        data.skattetabell ? parseInt(data.skattetabell, 10) : null,
        data.skattekolumn ? parseInt(data.skattekolumn, 10) : null,
        data.växaStöd,
        userId,
      ];

      console.log("➕ Skapar ny anställd");
      const result = await client.query(insertQuery, values);

      const nyAnställdId = result.rows[0].id;

      client.release();
      revalidatePath("/personal");

      return {
        success: true,
        id: nyAnställdId,
        message: "Anställd sparad!",
      };
    }
  } catch (error) {
    console.error("❌ sparaAnställd error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ett fel uppstod vid sparande",
    };
  }
}

export async function taBortAnställd(anställdId: number) {
  console.log("🗑️ taBortAnställd() startar för ID:", anställdId);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Ingen inloggad användare");
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const client = await pool.connect();

    const query = `
      DELETE FROM anställda 
      WHERE id = $1 AND user_id = $2
    `;

    const result = await client.query(query, [anställdId, userId]);
    console.log("✅ Anställd borttagen:", result.rowCount);

    client.release();
    revalidatePath("/personal");

    return {
      success: true,
      message: "Anställd borttagen!",
    };
  } catch (error) {
    console.error("❌ taBortAnställd error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ett fel uppstod",
    };
  }
}

export async function hämtaFöretagsprofil(userId: string): Promise<any | null> {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        företagsnamn,
        adress,
        postnummer,
        stad,
        organisationsnummer,
        momsregistreringsnummer,
        telefonnummer,
        epost,
        webbplats
      FROM företagsprofil
      WHERE id = $1
      LIMIT 1
      `,
      [userId]
    );

    return rows[0] || null;
  } catch (error) {
    console.error("Fel vid hämtning av företagsprofil:", error);
    return null;
  }
}

export async function hämtaSemesterTransaktioner(
  anställdId: number,
  startDatum?: string,
  slutDatum?: string,
  typ?: string,
  bokfört?: boolean
) {
  console.log("🚀 hämtaSemesterTransaktioner() startar för anställd:", anställdId);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Ingen inloggad användare");
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const client = await pool.connect();

    // Kontrollera att anställd tillhör användaren
    const checkQuery = `
      SELECT id FROM anställda 
      WHERE id = $1 AND user_id = $2
    `;
    const checkResult = await client.query(checkQuery, [anställdId, userId]);

    if (checkResult.rows.length === 0) {
      client.release();
      return [];
    }

    let query = `
      SELECT 
        s.*,
        l.månad as lönespec_månad,
        l.år as lönespec_år
      FROM semester s
      LEFT JOIN lönespecifikationer l ON s.lönespecifikation_id = l.id
      WHERE s.anställd_id = $1
    `;

    const queryParams: any[] = [anställdId];
    let paramIndex = 2;

    // Lägg till filter
    if (startDatum) {
      query += ` AND s.datum >= $${paramIndex}`;
      queryParams.push(startDatum);
      paramIndex++;
    }

    if (slutDatum) {
      query += ` AND s.datum <= $${paramIndex}`;
      queryParams.push(slutDatum);
      paramIndex++;
    }

    if (typ && typ !== "Alla") {
      query += ` AND s.typ = $${paramIndex}`;
      queryParams.push(typ);
      paramIndex++;
    }

    if (bokfört !== undefined) {
      query += ` AND s.bokfört = $${paramIndex}`;
      queryParams.push(bokfört);
      paramIndex++;
    }

    query += ` ORDER BY s.datum DESC, s.skapad DESC`;

    const result = await client.query(query, queryParams);
    console.log("✅ Hittade", result.rows.length, "semestertransaktioner");

    client.release();
    return result.rows;
  } catch (error) {
    console.error("❌ hämtaSemesterTransaktioner error:", error);
    return [];
  }
}

export async function sparaSemesterTransaktion(data: {
  anställdId: number;
  datum: string;
  typ: string;
  antal: number;
  frånDatum?: string;
  tillDatum?: string;
  beskrivning?: string;
  lönespecifikationId?: number;
  bokfört?: boolean;
}) {
  console.log("🚀 sparaSemesterTransaktion() startar...", data);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Ingen inloggad användare");
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const client = await pool.connect();

    // Kontrollera att anställd tillhör användaren
    const checkQuery = `
      SELECT id FROM anställda 
      WHERE id = $1 AND user_id = $2
    `;
    const checkResult = await client.query(checkQuery, [data.anställdId, userId]);

    if (checkResult.rows.length === 0) {
      client.release();
      return { success: false, error: "Anställd inte hittad" };
    }

    const insertQuery = `
      INSERT INTO semester (
        anställd_id, datum, typ, antal, från_datum, till_datum, 
        beskrivning, lönespecifikation_id, bokfört, skapad_av
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      ) RETURNING id
    `;

    const values = [
      data.anställdId,
      data.datum,
      data.typ,
      data.antal,
      data.frånDatum || null,
      data.tillDatum || null,
      data.beskrivning || null,
      data.lönespecifikationId || null,
      data.bokfört || false,
      userId,
    ];

    const result = await client.query(insertQuery, values);
    const nyTransaktionId = result.rows[0].id;

    client.release();
    revalidatePath("/personal");

    return {
      success: true,
      id: nyTransaktionId,
      message: "Semestertransaktion sparad!",
    };
  } catch (error) {
    console.error("❌ sparaSemesterTransaktion error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ett fel uppstod vid sparande",
    };
  }
}

export async function raderaSemesterTransaktion(transaktionId: number) {
  console.log("🗑️ raderaSemesterTransaktion() startar för ID:", transaktionId);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Ingen inloggad användare");
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const client = await pool.connect();

    // Kontrollera att transaktionen tillhör användarens anställd
    const checkQuery = `
      SELECT s.id FROM semester s
      JOIN anställda a ON s.anställd_id = a.id
      WHERE s.id = $1 AND a.user_id = $2
    `;
    const checkResult = await client.query(checkQuery, [transaktionId, userId]);

    if (checkResult.rows.length === 0) {
      client.release();
      return { success: false, error: "Transaktion inte hittad" };
    }

    const deleteQuery = `DELETE FROM semester WHERE id = $1`;
    await client.query(deleteQuery, [transaktionId]);

    client.release();
    revalidatePath("/personal");

    return {
      success: true,
      message: "Semestertransaktion borttagen!",
    };
  } catch (error) {
    console.error("❌ raderaSemesterTransaktion error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ett fel uppstod",
    };
  }
}

export async function uppdateraSemesterdata(
  anställdId: number,
  data: {
    semesterdagarPerÅr?: number;
    kvarandeDagar?: number;
    sparadeDagar?: number;
    användaFörskott?: number;
    kvarandeFörskott?: number;
    innestående?: number;
  }
) {
  console.log("🚀 uppdateraSemesterdata() startar för anställd:", anställdId);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Ingen inloggad användare");
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const client = await pool.connect();

    const updateQuery = `
      UPDATE anställda SET
        semesterdagar_per_år = $1,
        kvarvarande_dagar = $2,
        sparade_dagar = $3,
        använda_förskott = $4,
        kvarvarande_förskott = $5,
        innestående_ersättning = $6,
        uppdaterad = NOW()
      WHERE id = $7 AND user_id = $8
      RETURNING id
    `;

    const values = [
      data.semesterdagarPerÅr || 0,
      data.kvarandeDagar || 0,
      data.sparadeDagar || 0,
      data.användaFörskott || 0,
      data.kvarandeFörskott || 0,
      data.innestående || 0,
      anställdId,
      userId,
    ];

    const result = await client.query(updateQuery, values);

    if (result.rowCount === 0) {
      client.release();
      return { success: false, error: "Anställd inte hittad" };
    }

    client.release();
    revalidatePath("/personal");

    return {
      success: true,
      message: "Semesterdata uppdaterad!",
    };
  } catch (error) {
    console.error("❌ uppdateraSemesterdata error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ett fel uppstod",
    };
  }
}

export async function hämtaLönespecifikationer(anställdId: number) {
  console.log("🚀 hämtaLönespecifikationer() startar för anställd:", anställdId);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Ingen inloggad användare");
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const client = await pool.connect();

    // Kontrollera att anställd tillhör användaren
    const checkQuery = `
      SELECT id FROM anställda 
      WHERE id = $1 AND user_id = $2
    `;
    const checkResult = await client.query(checkQuery, [anställdId, userId]);

    if (checkResult.rows.length === 0) {
      client.release();
      return [];
    }

    const query = `
      SELECT * FROM lönespecifikationer 
      WHERE anställd_id = $1 
      ORDER BY år DESC, månad DESC
    `;

    const result = await client.query(query, [anställdId]);
    console.log("✅ Hittade", result.rows.length, "lönespecifikationer");

    client.release();
    return result.rows;
  } catch (error) {
    console.error("❌ hämtaLönespecifikationer error:", error);
    return [];
  }
}

export async function genereraLönespecifikation(anställdId: number, månad?: number, år?: number) {
  console.log("🚀 genereraLönespecifikation() startar för anställd:", anställdId);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Ingen inloggad användare");
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const client = await pool.connect();

    // Hämta anställd data
    const anställdQuery = `
      SELECT * FROM anställda 
      WHERE id = $1 AND user_id = $2
    `;
    const anställdResult = await client.query(anställdQuery, [anställdId, userId]);

    if (anställdResult.rows.length === 0) {
      client.release();
      return { success: false, error: "Anställd hittades inte" };
    }

    const anställd = anställdResult.rows[0];

    // Beräkna period (nuvarande månad om inte specificerat)
    const now = new Date();
    const targetMånad = månad || now.getMonth() + 1; // 1-12
    const targetÅr = år || now.getFullYear();

    // Kontrollera om lönespec redan finns
    const existsQuery = `
      SELECT id FROM lönespecifikationer 
      WHERE anställd_id = $1 AND månad = $2 AND år = $3
    `;
    const existsResult = await client.query(existsQuery, [anställdId, targetMånad, targetÅr]);

    if (existsResult.rows.length > 0) {
      client.release();
      return {
        success: false,
        error: `Lönespecifikation för ${targetMånad}/${targetÅr} finns redan`,
      };
    }

    // Beräkna period datum
    const periodStart = new Date(targetÅr, targetMånad - 1, 1);
    const periodSlut = new Date(targetÅr, targetMånad, 0);

    // Beräkna grundlön baserat på anställnings typ
    let grundlön = 0;
    const kompensation = parseFloat(anställd.kompensation || 0);

    switch (anställd.ersättning_per) {
      case "Månad":
        grundlön = kompensation;
        break;
      case "År":
        grundlön = kompensation / 12;
        break;
      case "Timme":
        const timmarPerVecka = parseFloat(anställd.arbetsvecka_timmar || 40);
        grundlön = (kompensation * timmarPerVecka * 52) / 12;
        break;
      case "Vecka":
        grundlön = (kompensation * 52) / 12;
        break;
      case "Dag":
        grundlön = kompensation * 21.7; // Genomsnitt arbetsdagar per månad
        break;
      default:
        grundlön = kompensation;
    }

    // Justera för deltid
    if (anställd.arbetsbelastning === "Deltid" && anställd.deltid_procent) {
      grundlön = grundlön * (parseFloat(anställd.deltid_procent) / 100);
    }

    // Bruttolön (bara grundlön till att börja med)
    const bruttolön = grundlön;

    // Beräkna skatt
    const skattesatser: { [key: number]: number } = {
      29: 0.18,
      30: 0.2,
      31: 0.21974,
      32: 0.24,
      33: 0.26,
      34: 0.21974,
      35: 0.3,
      36: 0.32,
      37: 0.34,
      38: 0.36,
      39: 0.38,
      40: 0.4,
      41: 0.42,
      42: 0.44,
    };

    const skattetabell = parseInt(anställd.skattetabell) || 34;
    const skattesats = skattesatser[skattetabell] || 0.21974;
    const skatt = Math.round(bruttolön * skattesats);

    // Beräkna sociala avgifter (arbetsgivaravgifter)
    const socialaAvgifter = Math.round(bruttolön * 0.3142); // 31.42%

    // Nettolön
    const nettolön = bruttolön - skatt;

    // Standard arbetstimmar per månad
    const standardTimmar =
      anställd.ersättning_per === "Timme"
        ? parseFloat(anställd.arbetsvecka_timmar || 40) * 4.33
        : 0;

    // Skapa lönespecifikation
    const insertQuery = `
      INSERT INTO lönespecifikationer (
        anställd_id, period_start, period_slut, månad, år,
        grundlön, bruttolön, skatt, sociala_avgifter, nettolön,
        arbetade_timmar, status, skapad_av
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `;

    const insertResult = await client.query(insertQuery, [
      anställdId,
      periodStart,
      periodSlut,
      targetMånad,
      targetÅr,
      Math.round(grundlön),
      Math.round(bruttolön),
      skatt,
      socialaAvgifter,
      Math.round(nettolön),
      standardTimmar,
      "Utkast",
      userId,
    ]);

    client.release();

    const lönespecId = insertResult.rows[0].id;
    console.log("✅ Lönespecifikation skapad med ID:", lönespecId);

    return {
      success: true,
      message: `Lönespecifikation för ${getMånadsNamn(targetMånad)} ${targetÅr} har skapats`,
      id: lönespecId,
    };
  } catch (error) {
    console.error("❌ genereraLönespecifikation error:", error);
    return { success: false, error: "Kunde inte skapa lönespecifikation" };
  }
}

function getMånadsNamn(månad: number): string {
  const månader = [
    "Januari",
    "Februari",
    "Mars",
    "April",
    "Maj",
    "Juni",
    "Juli",
    "Augusti",
    "September",
    "Oktober",
    "November",
    "December",
  ];
  return månader[månad - 1] || "Okänd";
}

export async function hämtaUtlägg(anställdId: number) {
  console.log("🚀 hämtaUtlägg() startar för anställd:", anställdId);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Ingen inloggad användare");
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const client = await pool.connect();

    // Kontrollera att anställd tillhör användaren
    const checkQuery = `
      SELECT id FROM anställda 
      WHERE id = $1 AND user_id = $2
    `;
    const checkResult = await client.query(checkQuery, [anställdId, userId]);

    if (checkResult.rows.length === 0) {
      client.release();
      return [];
    }

    const query = `
      SELECT * FROM utlägg 
      WHERE anställd_id = $1 
      ORDER BY datum DESC, skapad DESC
    `;

    const result = await client.query(query, [anställdId]);
    console.log("✅ Hittade", result.rows.length, "utlägg");

    client.release();
    return result.rows;
  } catch (error) {
    console.error("❌ hämtaUtlägg error:", error);
    return [];
  }
}

export async function godkännUtlägg(utläggId: number, lönespecId?: number) {
  console.log("🚀 godkännUtlägg() startar för utlägg:", utläggId, "lönespec:", lönespecId);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Ingen inloggad användare");
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const client = await pool.connect();

    // Kontrollera att utlägg tillhör användarens anställd
    const checkQuery = `
      SELECT u.*, a.förnamn, a.efternamn FROM utlägg u
      JOIN anställda a ON u.anställd_id = a.id
      WHERE u.id = $1 AND a.user_id = $2
    `;
    const checkResult = await client.query(checkQuery, [utläggId, userId]);

    if (checkResult.rows.length === 0) {
      client.release();
      return { success: false, error: "Utlägg inte hittat" };
    }

    const utlägg = checkResult.rows[0];

    if (utlägg.status !== "Väntande") {
      client.release();
      return { success: false, error: "Utlägg är redan behandlat" };
    }

    // Uppdatera utlägg status
    const updateUtläggQuery = `
      UPDATE utlägg SET
        status = 'Godkänd',
        godkänd_datum = NOW(),
        lönespecifikation_id = $1,
        uppdaterad = NOW()
      WHERE id = $2
      RETURNING *
    `;

    await client.query(updateUtläggQuery, [lönespecId || null, utläggId]);

    // Om lönespec är specificerad, uppdatera lönespecen
    if (lönespecId) {
      // Kontrollera att lönespec tillhör samma anställd
      const lönespecQuery = `
        SELECT * FROM lönespecifikationer 
        WHERE id = $1 AND anställd_id = $2
      `;
      const lönespecResult = await client.query(lönespecQuery, [lönespecId, utlägg.anställd_id]);

      if (lönespecResult.rows.length > 0) {
        const lönespec = lönespecResult.rows[0];
        const utläggBelopp = parseFloat(utlägg.belopp);

        // Lägg till utlägg till bruttolön
        const nyBruttolön = parseFloat(lönespec.bruttolön) + utläggBelopp;

        // Omberäkna skatt och nettolön
        const skattetabell = 34; // Default, borde hämtas från anställd
        const skattesats = 0.21974;
        const nySkatt = Math.round(nyBruttolön * skattesats);
        const nyNettolön = nyBruttolön - nySkatt;

        // Uppdatera lönespecifikation
        const updateLönespecQuery = `
          UPDATE lönespecifikationer SET
            bruttolön = $1,
            skatt = $2,
            nettolön = $3,
            utlägg_total = COALESCE(utlägg_total, 0) + $4,
            uppdaterad = NOW()
          WHERE id = $5
        `;

        await client.query(updateLönespecQuery, [
          Math.round(nyBruttolön),
          nySkatt,
          Math.round(nyNettolön),
          utläggBelopp,
          lönespecId,
        ]);

        console.log(`✅ Utlägg ${utläggBelopp} kr tillagt till lönespec ${lönespecId}`);
      }
    }

    client.release();
    revalidatePath("/personal");

    return {
      success: true,
      message: `Utlägg godkänt${lönespecId ? " och tillagt till lönespec" : ""}!`,
    };
  } catch (error) {
    console.error("❌ godkännUtlägg error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ett fel uppstod",
    };
  }
}

export async function avvisaUtlägg(utläggId: number, anledning?: string) {
  console.log("🚀 avvisaUtlägg() startar för utlägg:", utläggId);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Ingen inloggad användare");
  }

  const userId = parseInt(session.user.id, 10);

  try {
    const client = await pool.connect();

    // Kontrollera att utlägg tillhör användarens anställd
    const checkQuery = `
      SELECT u.* FROM utlägg u
      JOIN anställda a ON u.anställd_id = a.id
      WHERE u.id = $1 AND a.user_id = $2
    `;
    const checkResult = await client.query(checkQuery, [utläggId, userId]);

    if (checkResult.rows.length === 0) {
      client.release();
      return { success: false, error: "Utlägg inte hittat" };
    }

    const updateQuery = `
      UPDATE utlägg SET
        status = 'Avvisad',
        kommentar = CASE 
          WHEN kommentar IS NULL THEN $1
          ELSE kommentar || ' | AVVISAD: ' || $1
        END,
        uppdaterad = NOW()
      WHERE id = $2
      RETURNING *
    `;

    await client.query(updateQuery, [anledning || "Ingen anledning angiven", utläggId]);

    client.release();
    revalidatePath("/personal");

    return {
      success: true,
      message: "Utlägg avvisat!",
    };
  } catch (error) {
    console.error("❌ avvisaUtlägg error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Ett fel uppstod",
    };
  }
}

export async function sparaExtrarad({
  lönespecifikation_id,
  kolumn1,
  kolumn2,
  kolumn3,
  kolumn4,
}: {
  lönespecifikation_id: number;
  kolumn1: string;
  kolumn2: string;
  kolumn3: string;
  kolumn4: string;
}) {
  try {
    const client = await pool.connect();
    await client.query(
      `INSERT INTO lönespec_extrarader (lönespecifikation_id, kolumn1, kolumn2, kolumn3, kolumn4)
       VALUES ($1, $2, $3, $4, $5)`,
      [lönespecifikation_id, kolumn1, kolumn2, kolumn3, kolumn4]
    );
    client.release();
    return { success: true };
  } catch (error) {
    console.error("❌ sparaExtrarad error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Fel vid sparande" };
  }
}

export async function hämtaExtrarader(lönespecifikation_id: number) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM lönespec_extrarader WHERE lönespecifikation_id = $1`,
      [lönespecifikation_id]
    );
    client.release();
    return result.rows;
  } catch (error) {
    console.error("❌ hämtaExtrarader error:", error);
    return [];
  }
}
