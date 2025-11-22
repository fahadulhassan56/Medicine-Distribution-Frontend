import React from 'react';

const DataTable = ({ columns, data, onRowClick }) => {
  // 🔥 Ensure data is always an array (prevents .map errors)
  const safeRows = Array.isArray(data) ? data : [];

  return (
    <section className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {safeRows.length === 0 && (
              <tr>
                <td
                  className="px-3 py-4 text-center text-slate-500"
                  colSpan={columns.length}
                >
                  No records found.
                </td>
              </tr>
            )}

            {safeRows.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex} // fallback if ID is missing
                className={onRowClick ? 'hover:bg-slate-50 cursor-pointer' : ''}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2 text-slate-700">
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key] ?? "--"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DataTable;
