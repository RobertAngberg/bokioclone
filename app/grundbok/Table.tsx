import { TableRow } from "./TableRow";

interface HistoryItem {
  transaktions_id: number;
  transaktionsdatum: string;
  kontobeskrivning: string;
  belopp: number;
  kommentar?: string;
  fil?: string;
}

interface TransactionDetail {
  transaktionspost_id: number;
  kontobeskrivning: string;
  debet: number;
  kredit: number;
}

interface TableProps {
  historyData: HistoryItem[];
  handleRowClick: (id: number) => void;
  activeId: number | null;
  details: TransactionDetail[];
  isLoading?: boolean;
}

function Table({ historyData, handleRowClick, activeId, details, isLoading }: TableProps) {
  return (
    <table className="w-full m-auto md:w-3/4">
      <thead className="text-lg bg-cyan-950">
        <tr>
          <th className="p-5 text-left rounded-tl-lg">ID</th>
          <th className="p-5 text-left">Datum</th>
          <th className="hidden p-5 md:table-cell text-left">Fil</th>
          <th className="p-5 text-left">Konto</th>
          <th className="p-5 text-left">Belopp</th>
          <th className="hidden p-5 pr-10 text-left rounded-tr-lg md:table-cell">Kommentar</th>
        </tr>
      </thead>
      <tbody>
        {historyData.map((item, index) => (
          <TableRow
            key={item.transaktions_id}
            item={item}
            handleRowClick={handleRowClick}
            activeId={activeId}
            details={details}
            rowIndex={index} // Pass rowIndex here to TableRow component
          />
        ))}
      </tbody>
    </table>
  );
}

export { Table };
