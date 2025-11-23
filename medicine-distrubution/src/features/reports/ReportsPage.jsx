import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient.js';
import * as XLSX from 'xlsx';

const ReportsPage = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [productId, setProductId] = useState('');
  const [singleDate, setSingleDate] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ------------------------ REPORT LOADERS ------------------------
  const runSalesReport = async () => {
    try {
      const res = await axiosClient.get('/reports/sales', {
        params: { from_date: fromDate, to_date: toDate }
      });
      setReportData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load sales report');
    }
  };

  const runPurchaseReport = async () => {
    try {
      const res = await axiosClient.get('/reports/purchases', {
        params: { from_date: fromDate, to_date: toDate }
      });
      setReportData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load purchase report');
    }
  };

  const runStockReport = async () => {
    try {
      const res = await axiosClient.get('/reports/stock');
      setReportData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load stock report');
    }
  };

  const runNearExpiryReport = async () => {
    try {
      const res = await axiosClient.get('/reports/near-expiry', {
        params: { days: 250 }
      });
      setReportData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load near expiry report');
    }
  };

  const runProfitLossReport = async () => {
    try {
      const res = await axiosClient.get('/reports/profit-loss', {
        params: { from_date: fromDate, to_date: toDate }
      });
      setReportData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load profit-loss report');
    }
  };

  const runProductSalesReport = async () => {
    try {
      const res = await axiosClient.get('/reports/product-sales', {
        params:
          productId && fromDate && toDate
            ? { product_id: productId, from_date: fromDate, to_date: toDate }
            : {}
      });
      setReportData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load product sales report');
    }
  };

  const runCustomerLedger = async () => {
    try {
      const res = await axiosClient.get('/reports/customer-ledger/1');
      setReportData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load customer ledger report');
    }
  };

  const runSupplierLedger = async () => {
    try {
      const res = await axiosClient.get('/reports/supplier-ledger/1');
      setReportData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load supplier ledger report');
    }
  };

  const runDailyReport = async () => {
    try {
      const res = await axiosClient.get('/reports/daily-summary', {
        params: { date: singleDate }
      });
      setReportData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load daily summary report');
    }
  };

  // ------------------------ UTILITIES ------------------------

  const prettyLabel = (key) =>
    key
      .replace(/\./g, ' ')
      .replace(/\[\d+\]/g, '') // remove [0], [1] for display
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const maybeFormatDateString = (val) => {
    if (typeof val !== 'string') return val;
    if (/^\d{4}-\d{2}-\d{2}T/.test(val)) {
      return val.slice(0, 10);
    }
    return val;
  };

  const renderValue = (val) => {
    if (val === null || val === undefined) return '—';

    if (typeof val === 'string' || typeof val === 'number') {
      return maybeFormatDateString(val);
    }

    if (Array.isArray(val)) return `${val.length} items`;

    if (typeof val === 'object') {
      if (val.name) return val.name;
      if (val.product_name) return val.product_name;
      if (val.batch_no) return val.batch_no;
      if (val.invoice_no) return val.invoice_no;
      if (val.invoice_number) return val.invoice_number;
      if (val.phone) return val.phone;
      if (val.address && val.name) return `${val.name} (${val.address})`;
      if (val.id && typeof val.id === 'number') return `#${val.id}`;
      return '[details]';
    }

    return String(val);
  };

  const isPlainObject = (val) =>
    val !== null && typeof val === 'object' && !Array.isArray(val);

  const flattenObject = (obj, prefix = '') => {
    const result = {};
    if (!obj || typeof obj !== 'object') return result;

    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (isPlainObject(value)) {
        Object.assign(result, flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        value.forEach((item, idx) => {
          const arrKey = `${newKey}[${idx}]`;
          if (isPlainObject(item)) {
            Object.assign(result, flattenObject(item, arrKey));
          } else {
            result[arrKey] = item;
          }
        });
      } else {
        result[newKey] = value;
      }
    });

    return result;
  };

  const displayCell = (v) => {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'string' || typeof v === 'number') {
      return maybeFormatDateString(v);
    }
    return JSON.stringify(v);
  };

  // ------------------------ GENERIC TABLE RENDERER (MAIN) ------------------------

  const renderTable = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0)
      return <p className="text-xs text-slate-500">No data found.</p>;

    const columns = Object.keys(rows[0] || {});

    return (
      <div className="overflow-x-auto max-h-[28rem] rounded-lg border border-slate-200">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-100 text-slate-700 uppercase">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-2 py-1 text-left border-b border-slate-200">
                  {prettyLabel(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50 hover:bg-slate-100'}
              >
                {columns.map((col) => (
                  <td key={col} className="px-2 py-1 border-b border-slate-100">
                    {renderValue(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ------------------------ LEDGER RENDERER (MAIN) ------------------------

  const renderLedger = (ledger) => {
    if (!ledger || typeof ledger !== 'object') return null;

    const person = ledger.customer || ledger.supplier;

    return (
      <div className="space-y-4 text-xs">
        {person && (
          <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
            <h4 className="font-semibold text-slate-700">
              {ledger.customer ? 'Customer Details' : 'Supplier Details'}
            </h4>
            <p>
              <strong>Name:</strong> {person.name}
            </p>
            <p>
              <strong>Phone:</strong> {person.phone}
            </p>
            <p>
              <strong>Address:</strong> {person.address}
            </p>
          </div>
        )}

        {'opening_balance' in ledger && (
          <div className="bg-white border border-slate-200 rounded p-3">
            <strong>Opening Balance:</strong> Rs. {ledger.opening_balance}
          </div>
        )}

        {Array.isArray(ledger.sales) && ledger.sales.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-700 mb-1">Sales</h4>
            {renderTable(ledger.sales)}
          </div>
        )}

        {Array.isArray(ledger.purchases) && ledger.purchases.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-700 mb-1">Purchases</h4>
            {renderTable(ledger.purchases)}
          </div>
        )}

        {Array.isArray(ledger.payments) && ledger.payments.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-700 mb-1">Payments</h4>
            {renderTable(ledger.payments)}
          </div>
        )}

        {'closing_balance' in ledger && (
          <div className="bg-white border border-slate-200 rounded p-3">
            <strong>Closing Balance:</strong> Rs. {ledger.closing_balance}
          </div>
        )}
      </div>
    );
  };

  // ------------------------ EXCEL EXPORT ------------------------

  const sheetNameFromKey = (key) => {
    const name = prettyLabel(key);
    return name.slice(0, 31) || 'Sheet';
  };

  const handleExportExcel = () => {
    if (!reportData) {
      alert('No report data to export.');
      return;
    }

    const envelope = reportData;
    const payload =
      envelope && envelope.data !== undefined ? envelope.data : envelope;

    if (!payload && payload !== 0) {
      alert('No report data to export.');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Meta sheet (success, message, etc.)
    if (envelope && typeof envelope === 'object') {
      const meta = {};
      Object.entries(envelope).forEach(([k, v]) => {
        if (k === 'data') return;
        meta[k] = v;
      });
      if (Object.keys(meta).length > 0) {
        const metaRows = Object.keys(meta).map((k) => ({
          key: k,
          value: meta[k]
        }));
        const wsMeta = XLSX.utils.json_to_sheet(metaRows);
        XLSX.utils.book_append_sheet(wb, wsMeta, 'Meta');
      }
    }

    const addSheetFromArrayFlat = (rows, name) => {
      if (!Array.isArray(rows) || rows.length === 0) return;
      const flatRows = rows.map((r) => flattenObject(r));
      const ws = XLSX.utils.json_to_sheet(flatRows);
      XLSX.utils.book_append_sheet(wb, ws, sheetNameFromKey(name));
    };

    const addSheetFromObjectSimple = (obj, name) => {
      if (!obj || typeof obj !== 'object') return;
      const rows = Object.keys(obj).map((k) => ({
        key: k,
        value: obj[k]
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, sheetNameFromKey(name));
    };

    if (Array.isArray(payload)) {
      addSheetFromArrayFlat(payload, 'Data');
    } else if (typeof payload === 'object') {
      const entries = Object.entries(payload);
      const arrayKeys = entries.filter(([, v]) => Array.isArray(v)).map(([k]) => k);

      if (arrayKeys.length === 0) {
        addSheetFromObjectSimple(payload, 'Summary');
      } else {
        arrayKeys.forEach((k) => {
          const arr = payload[k];
          addSheetFromArrayFlat(arr, k);
        });

        const scalarSummary = {};
        entries.forEach(([k, v]) => {
          if (!Array.isArray(v) && (typeof v !== 'object' || v === null)) {
            scalarSummary[k] = v;
          }
        });
        if (Object.keys(scalarSummary).length > 0) {
          addSheetFromObjectSimple(scalarSummary, 'Summary');
        }
      }
    } else {
      addSheetFromObjectSimple({ value: payload }, 'Value');
    }

    if (wb.SheetNames.length === 0) {
      alert('Nothing suitable to export.');
      return;
    }

    XLSX.writeFile(wb, 'report.xlsx');
  };

  // ------------------------ MAIN REPORT RENDERING (CENTER PANEL) ------------------------

  const renderReportOutput = () => {
    if (!reportData)
      return <p className="text-xs text-slate-500">Run any report to see data here.</p>;

    const payload =
      reportData && reportData.data !== undefined ? reportData.data : reportData;

    if (
      payload &&
      typeof payload === 'object' &&
      (payload.customer ||
        payload.supplier ||
        Array.isArray(payload.sales) ||
        Array.isArray(payload.purchases) ||
        Array.isArray(payload.payments))
    ) {
      return renderLedger(payload);
    }

    if (Array.isArray(payload)) return renderTable(payload);

    if (payload && typeof payload === 'object') {
      const rows = Object.keys(payload).map((k) => ({
        key: prettyLabel(k),
        value: renderValue(payload[k])
      }));
      return renderTable(rows);
    }

    return (
      <div className="text-xs bg-slate-50 rounded-lg p-3 border overflow-auto max-h-[32rem]">
        <pre>{JSON.stringify(payload, null, 2)}</pre>
      </div>
    );
  };

  // ------------------------ MODAL DETAILED VIEW (TABLES, NOT JSON) ------------------------

  const renderDetailedModalContent = () => {
    if (!reportData) return null;

    const envelope = reportData;
    const payload =
      envelope && envelope.data !== undefined ? envelope.data : envelope;

    // META table
    const metaEntries =
      envelope && typeof envelope === 'object'
        ? Object.entries(envelope).filter(([k]) => k !== 'data')
        : [];

    const metaTable =
      metaEntries.length > 0 ? (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-slate-700 mb-1">Meta</h4>
          <div className="overflow-x-auto rounded border border-slate-200">
            <table className="min-w-full text-[11px]">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-2 py-1 text-left border-b border-slate-200">Field</th>
                  <th className="px-2 py-1 text-left border-b border-slate-200">Value</th>
                </tr>
              </thead>
              <tbody>
                {metaEntries.map(([k, v]) => (
                  <tr key={k} className="bg-white">
                    <td className="px-2 py-1 border-b border-slate-100">{k}</td>
                    <td className="px-2 py-1 border-b border-slate-100">
                      {displayCell(v)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null;

    // If payload is an array: show flattened array table
    if (Array.isArray(payload)) {
      const flatRows = payload.map((r) => flattenObject(r));
      const colSet = new Set();
      flatRows.forEach((r) => {
        Object.keys(r).forEach((k) => colSet.add(k));
      });
      const columns = Array.from(colSet);

      return (
        <>
          {metaTable}
          <h4 className="text-xs font-semibold text-slate-700 mb-1">Data (Flattened)</h4>
          <div className="overflow-x-auto rounded border border-slate-200 max-h-[60vh]">
            <table className="min-w-full text-[11px]">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c}
                      className="px-2 py-1 text-left border-b border-slate-200"
                    >
                      {prettyLabel(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flatRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                  >
                    {columns.map((c) => (
                      <td key={c} className="px-2 py-1 border-b border-slate-100">
                        {displayCell(row[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }

    // If payload is an object: show flattened key/value path table
    if (payload && typeof payload === 'object') {
      const flat = flattenObject(payload);
      const entries = Object.entries(flat);

      return (
        <>
          {metaTable}
          <h4 className="text-xs font-semibold text-slate-700 mb-1">Data (Flattened)</h4>
          <div className="overflow-x-auto rounded border border-slate-200 max-h-[60vh]">
            <table className="min-w-full text-[11px]">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-2 py-1 text-left border-b border-slate-200">
                    Field Path
                  </th>
                  <th className="px-2 py-1 text-left border-b border-slate-200">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map(([path, value]) => (
                  <tr key={path} className="bg-white">
                    <td className="px-2 py-1 border-b border-slate-100">{path}</td>
                    <td className="px-2 py-1 border-b border-slate-100">
                      {displayCell(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      );
    }

    // Fallback
    return (
      <>
        {metaTable}
        <div className="text-[11px] bg-slate-50 rounded p-2 border overflow-auto max-h-[60vh]">
          <pre>{JSON.stringify(payload, null, 2)}</pre>
        </div>
      </>
    );
  };

  // ------------------------ JSX ------------------------

  return (
    <main className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Reports</h2>
        <p className="text-sm text-slate-600">
          Sales, purchase, stock, profit-loss and ledger reports.
        </p>
      </header>

      {/* FILTERS SECTION */}
      <section className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
        <section className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-slate-700">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Product ID</label>
            <input
              type="number"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
            />
          </div>
        </section>

        {/* BUTTONS */}
        <section className="grid gap-2 md:grid-cols-3 text-xs">
          <button onClick={runSalesReport} className="px-3 py-2 border rounded hover:bg-slate-50">
            Sales Report
          </button>
          <button
            onClick={runPurchaseReport}
            className="px-3 py-2 border rounded hover:bg-slate-50"
          >
            Purchase Report
          </button>
          <button onClick={runStockReport} className="px-3 py-2 border rounded hover:bg-slate-50">
            Stock Report
          </button>
          <button
            onClick={runNearExpiryReport}
            className="px-3 py-2 border rounded hover:bg-slate-50"
          >
            Near Expiry
          </button>
          <button
            onClick={runProfitLossReport}
            className="px-3 py-2 border rounded hover:bg-slate-50"
          >
            Profit-Loss
          </button>
          <button
            onClick={runProductSalesReport}
            className="px-3 py-2 border rounded hover:bg-slate-50"
          >
            Product-wise Sales
          </button>
          <button
            onClick={runCustomerLedger}
            className="px-3 py-2 border rounded hover:bg-slate-50"
          >
            Customer Ledger
          </button>
          <button
            onClick={runSupplierLedger}
            className="px-3 py-2 border rounded hover:bg-slate-50"
          >
            Supplier Ledger
          </button>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={singleDate}
              onChange={(e) => setSingleDate(e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
            />
            <button
              onClick={runDailyReport}
              className="px-3 py-2 border rounded hover:bg-slate-50"
            >
              Daily Summary
            </button>
          </div>
        </section>
      </section>

      {/* OUTPUT */}
      <section className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-800">Report Output</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDetailsModal(true)}
              disabled={!reportData}
              className={`px-3 py-1.5 text-xs rounded border ${
                reportData
                  ? 'hover:bg-slate-50'
                  : 'text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              View Details
            </button>
            <button
              onClick={handleExportExcel}
              disabled={!reportData}
              className={`px-3 py-1.5 text-xs rounded border ${
                reportData
                  ? 'hover:bg-slate-50'
                  : 'text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              Download Excel
            </button>
          </div>
        </div>
        {renderReportOutput()}
      </section>

      {/* DETAILS MODAL */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <h4 className="text-sm font-semibold text-slate-800">Detailed Report</h4>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-500 hover:text-slate-800 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-3 overflow-auto text-xs">
              {renderDetailedModalContent()}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ReportsPage;
