import React from "react";

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
  rowIndex: number; // Add rowIndex to the props
}

function TableRow({ item, handleRowClick, activeId, details, rowIndex }: TableRowProps) {
  const isExpanded = activeId === item.transaktions_id;
  const isLoading = isExpanded && details.length === 0;

  // Apply alternating colors based on the rowIndex
  const rowColorClass = rowIndex % 2 === 0 ? "bg-gray-950" : "bg-gray-900";

  return (
    <>
      <tr
        onClick={() => handleRowClick(item.transaktions_id)}
        className={`cursor-pointer transition-colors duration-200 ${rowColorClass} hover:bg-gray-700`}
      >
        <td className="p-5 text-left">{item.transaktions_id}</td>
        <td className="p-5 text-left">{item.transaktionsdatum}</td>
        <td className="hidden p-5 text-left md:table-cell">{item.fil}</td>
        <td className="p-5 text-left">{item.kontobeskrivning}</td>
        <td className="p-5 text-left">{item.belopp}</td>
        <td className="hidden p-5 text-left md:table-cell">{item.kommentar}</td>
      </tr>

      {/* Show loading spinner when expanding and fetching details */}
      <tr className={`bg-gray-800 text-left overflow-hidden ${isExpanded ? "" : "hidden"}`}>
        <td colSpan={6} className="p-0">
          {isExpanded && isLoading ? (
            <div className="flex justify-center p-5">
              <div className="border-t-4 border-cyan-600 border-solid rounded-full w-16 h-16 animate-spin"></div>
            </div>
          ) : (
            isExpanded && (
              <div className="p-5">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="w-1/3 text-left">Konto</th>
                      <th className="w-1/3 text-left">Debet</th>
                      <th className="w-1/3 text-left">Kredit</th>
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
            )
          )}
        </td>
      </tr>
    </>
  );
}

export { TableRow };
