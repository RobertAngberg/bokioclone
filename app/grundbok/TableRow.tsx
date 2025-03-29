interface TableRowProps {
  item: {
    transaktions_id: number;
    transaktionsdatum: string;
    fil?: string;
    kontobeskrivning: string;
    belopp: number;
    kommentar?: string;
  };
  handleRowClick: (id: number) => void;
  activeId: number | null;
  details: {
    transaktionspost_id: number;
    kontobeskrivning: string;
    debet: number;
    kredit: number;
  }[];
}

function TableRow({ item, handleRowClick, activeId, details }: TableRowProps) {
  return (
    <>
      <tr
        key={item.transaktions_id}
        onClick={() => handleRowClick(item.transaktions_id)}
        className="cursor-pointer even:bg-gray-950 odd:bg-gray-900 hover:bg-gray-700"
      >
        <td className="p-5">{item.transaktions_id}</td>
        <td className="p-5">{item.transaktionsdatum}</td>
        <td className="hidden p-5 md:table-cell">{item.fil}</td>
        <td className="p-5">{item.kontobeskrivning}</td>
        <td className="p-5">{item.belopp}</td>
        <td className="hidden p-5 md:table-cell">{item.kommentar}</td>
      </tr>

      {activeId === item.transaktions_id && (
        <tr className="text-left bg-gray-800">
          <td colSpan={6}>
            <div className="flex items-center justify-center p-5">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="w-1/3">Konto</th>
                    <th className="w-1/3">Debet</th>
                    <th className="w-1/3">Kredit</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((detail) => (
                    <tr key={detail.transaktionspost_id}>
                      <td>{detail.kontobeskrivning}</td>
                      <td>{detail.debet}</td>
                      <td>{detail.kredit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export { TableRow };
