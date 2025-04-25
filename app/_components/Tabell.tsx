"use client";

import React from "react";
import TabellRad, { ColumnDefinition } from "./TabellRad";
export type { ColumnDefinition } from "./TabellRad";

export interface TableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  getRowId: (item: T) => string | number;
  activeId: string | number | null;
  handleRowClick: (id: string | number) => void;
  renderExpandedRow?: (item: T) => React.ReactNode;
}

export default function Tabell<T>({
  data,
  columns,
  getRowId,
  activeId,
  handleRowClick,
  renderExpandedRow,
}: TableProps<T>) {
  return (
    <div className="max-w-5xl mx-auto overflow-x-auto border border-slate-700 rounded-lg shadow">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-slate-800 text-left">
          <tr>
            {columns.map((col, colIndex) => {
              const paddingClass = colIndex === 0 ? "pl-6 pr-4 py-3" : "px-4 py-3";
              return (
                <th
                  key={String(col.key)}
                  className={`${paddingClass} ${col.hiddenOnMobile ? "hidden md:table-cell" : ""}`}
                >
                  {col.label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const id = getRowId(item);
            const isExpanded = activeId === id;

            return (
              <React.Fragment key={id}>
                <TabellRad
                  item={item}
                  columns={columns}
                  onClick={() => handleRowClick(id)}
                  isActive={isExpanded}
                  rowIndex={index}
                />
                {isExpanded && renderExpandedRow?.(item)}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
