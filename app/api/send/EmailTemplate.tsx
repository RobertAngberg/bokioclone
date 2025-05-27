import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  faktura?: any;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({ firstName, faktura }) => {
  // Beräkna totalsumma om faktura finns
  const totalExMoms =
    faktura?.artiklar?.reduce(
      (sum: number, item: any) => sum + item.antal * item.prisPerEnhet,
      0
    ) || 0;

  const totalMoms =
    faktura?.artiklar?.reduce(
      (sum: number, item: any) => sum + item.antal * item.prisPerEnhet * (item.moms / 100),
      0
    ) || 0;

  const summaAttBetala = totalExMoms + totalMoms;
  const valuta = faktura?.artiklar?.[0]?.valuta || "SEK";

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h1>Faktura #{faktura?.fakturanummer || ""}</h1>

      <p>Hej {firstName}!</p>

      <p>
        Här kommer din faktura med förfallodatum {faktura?.forfallodatum || ""}. Du hittar den
        bifogad som PDF.
      </p>

      <div
        style={{
          margin: "20px 0",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "5px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Fakturainformation</h2>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px 0" }}>
                <strong>Fakturanummer:</strong>
              </td>
              <td>{faktura?.fakturanummer || ""}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0" }}>
                <strong>Datum:</strong>
              </td>
              <td>{faktura?.fakturadatum || ""}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0" }}>
                <strong>Förfallodatum:</strong>
              </td>
              <td>{faktura?.forfallodatum || ""}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0" }}>
                <strong>Betalningsmetod:</strong>
              </td>
              <td>{faktura?.betalningsmetod || ""}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0" }}>
                <strong>Summa:</strong>
              </td>
              <td>
                <strong>
                  {summaAttBetala.toFixed(2)} {valuta}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>Vid frågor, vänligen kontakta oss på {faktura?.email || faktura?.telefonnummer || ""}.</p>

      <div
        style={{
          marginTop: "30px",
          borderTop: "1px solid #eaeaea",
          paddingTop: "20px",
          fontSize: "12px",
          color: "#666",
        }}
      >
        <p>{faktura?.företagsnamn || ""}</p>
        <p>
          {faktura?.adress || ""}, {faktura?.postnummer || ""} {faktura?.stad || ""}
        </p>
        <p>Org.nr: {faktura?.organisationsnummer || ""}</p>
      </div>
    </div>
  );
};

export default EmailTemplate;
