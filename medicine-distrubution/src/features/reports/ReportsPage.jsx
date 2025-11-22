import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient.js';

const ReportsPage = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [productId, setProductId] = useState('');
  const [singleDate, setSingleDate] = useState('');

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

  // ------------------------ GENERIC RENDERERS ------------------------

  const renderValue = (val) => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'string' || typeof val === 'number') return val;
    if (Array.isArray(val)) return `${val.length} items`;
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const renderTable = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0)
      return <p className="text-xs text-slate-500">No data found.</p>;

    const columns = Object.keys(rows[0] || {});

    return (
      <div className="overflow-x-auto max-h-[28rem]">
        <table className="min-w-full text-xs border rounded">
          <thead className="bg-slate-100 text-slate-600 uppercase">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-2 py-1 text-left border-b">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b hover:bg-slate-50">
                {columns.map((col) => (
                  <td key={col} className="px-2 py-1 border-b">
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

  // ------------------------ LEDGER RENDERER ------------------------

  const renderLedger = (ledger) => {
    if (!ledger || typeof ledger !== "object") return null;

    const person = ledger.customer || ledger.supplier;

    return (
      <div className="space-y-4 text-xs">

        {/* PERSON CARD */}
        {person && (
          <div className="bg-slate-50 border rounded p-3 space-y-1">
            <h4 className="font-semibold text-slate-700">
              {ledger.customer ? "Customer Details" : "Supplier Details"}
            </h4>
            <p><strong>Name:</strong> {person.name}</p>
            <p><strong>Phone:</strong> {person.phone}</p>
            <p><strong>Address:</strong> {person.address}</p>
          </div>
        )}

        {/* OPENING BALANCE */}
        {'opening_balance' in ledger && (
          <div className="bg-white border rounded p-3">
            <strong>Opening Balance:</strong> Rs. {ledger.opening_balance}
          </div>
        )}

        {/* SALES TABLE */}
        {Array.isArray(ledger.sales) && ledger.sales.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-700 mb-1">Sales</h4>
            {renderTable(ledger.sales)}
          </div>
        )}

        {/* PAYMENTS TABLE */}
        {Array.isArray(ledger.payments) && ledger.payments.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-700 mb-1">Payments</h4>
            {renderTable(ledger.payments)}
          </div>
        )}

        {/* CLOSING BALANCE */}
        {'closing_balance' in ledger && (
          <div className="bg-white border rounded p-3">
            <strong>Closing Balance:</strong> Rs. {ledger.closing_balance}
          </div>
        )}
      </div>
    );
  };

  // ------------------------ MAIN REPORT RENDERING ------------------------

  const renderReportOutput = () => {
    if (!reportData)
      return <p className="text-xs text-slate-500">Run any report to see data here.</p>;

    // LEDGER DETECTION
    if (typeof reportData === "object" && (reportData.customer || reportData.supplier)) {
      return renderLedger(reportData);
    }

    // PURE ARRAY
    if (Array.isArray(reportData)) return renderTable(reportData);

    // {data: []}
    if (reportData.data && Array.isArray(reportData.data)) {
      return renderTable(reportData.data);
    }

    // DEFAULT JSON
    return (
      <div className="text-xs bg-slate-50 rounded-lg p-3 border overflow-auto max-h-[32rem]">
        <pre>{JSON.stringify(reportData, null, 2)}</pre>
      </div>
    );
  };

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
            <label className="text-xs font-medium">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs font-medium">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs font-medium">Product ID</label>
            <input
              type="number"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full"
            />
          </div>
        </section>

        {/* BUTTONS */}
        <section className="grid gap-2 md:grid-cols-3 text-xs">
          <button onClick={runSalesReport} className="px-3 py-2 border rounded">Sales Report</button>
          <button onClick={runPurchaseReport} className="px-3 py-2 border rounded">Purchase Report</button>
          <button onClick={runStockReport} className="px-3 py-2 border rounded">Stock Report</button>
          <button onClick={runNearExpiryReport} className="px-3 py-2 border rounded">Near Expiry</button>
          <button onClick={runProfitLossReport} className="px-3 py-2 border rounded">Profit-Loss</button>
          <button onClick={runProductSalesReport} className="px-3 py-2 border rounded">Product-wise Sales</button>
          <button onClick={runCustomerLedger} className="px-3 py-2 border rounded">Customer Ledger</button>
          <button onClick={runSupplierLedger} className="px-3 py-2 border rounded">Supplier Ledger</button>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={singleDate}
              onChange={(e) => setSingleDate(e.target.value)}
              className="w-full"
            />
            <button onClick={runDailyReport} className="px-3 py-2 border rounded">Daily Summary</button>
          </div>
        </section>
      </section>

      {/* OUTPUT */}
      <section className="bg-white rounded-xl shadow-sm border p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">Report Output</h3>
        {renderReportOutput()}
      </section>
    </main>
  );
};

export default ReportsPage;
