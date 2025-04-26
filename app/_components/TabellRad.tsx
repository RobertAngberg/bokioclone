"use client";

export interface ColumnDefinition<T> {
  key: keyof T | string; // ✅ Fix: tillåt dynamiska keys (t.ex. "2025")
  label?: string;
  render?: (value: any, row: T) => React.ReactNode;
  hiddenOnMobile?: boolean;
}

interface TableRowProps<T> {
  item: T;
  columns: ColumnDefinition<T>[];
  onClick?: (item: T) => void;
  isActive?: boolean;
  rowIndex: number;
}

export default function TabellRad<T>({
  item,
  columns,
  onClick,
  isActive,
  rowIndex,
}: TableRowProps<T>) {
  const rowColorClass = rowIndex % 2 === 0 ? "bg-gray-950" : "bg-gray-900";

  return (
    <tr
      onClick={() => onClick?.(item)}
      className={`cursor-pointer transition-colors duration-200 ${rowColorClass} hover:bg-gray-700 ${
        isActive ? "bg-gray-800" : ""
      }`}
    >
      {columns.map((col, colIndex) => {
        const rawValue = (item as any)[col.key];
        const renderedValue = col.render
          ? col.render(rawValue, item)
          : (rawValue as React.ReactNode);

        const paddingClass = colIndex === 0 ? "pl-6 pr-4 py-3" : "px-4 py-3";

        return (
          <td
            key={String(col.key)}
            className={`${paddingClass} text-left ${col.hiddenOnMobile ? "hidden md:table-cell" : ""}`}
          >
            {renderedValue}
          </td>
        );
      })}
    </tr>
  );
}
