import { TableRow } from "./TableRow";

interface TableProps {
  historyData: Array<{
    transaktions_id: string;
    transaktionsdatum: string;
    fil?: string;
    kontobeskrivning: string;
    belopp: number;
    kommentar?: string;
  }>;
  handleRowClick: (id: number) => void;
  activeId: number | null;
  details: any; // Replace `any` with the appropriate type if known
}

function Table({ historyData, handleRowClick, activeId, details }: TableProps) {
  return (
    <table className="w-full m-auto md:w-3/4">
      <thead className="text-lg bg-cyan-950">
        <tr>
          <th className="p-5 rounded-tl-lg">ID</th>
          <th className="p-5">Datum</th>
          <th className="hidden p-5 md:table-cell">Fil</th>
          <th className="p-5">Konto</th>
          <th className="p-5">Belopp</th>
          <th className="hidden p-5 pr-10 rounded-tr-lg md:table-cell">Kommentar</th>
        </tr>
      </thead>
      <tbody>
        {historyData.map((item) => (
          <TableRow
            key={item.transaktions_id}
            item={item}
            handleRowClick={(id: string) => handleRowClick(Number(id))}
            activeId={activeId !== null ? String(activeId) : null}
            details={details}
          />
        ))}
      </tbody>
    </table>
  );
}

export { Table };
