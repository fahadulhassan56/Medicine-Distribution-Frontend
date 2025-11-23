import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient.js';
import { usePopup } from '../../components/ui/PopupContext'; // 👈 popup hook

const ReportsPage = () => {
  const { showPopup } = usePopup(); // 👈 get popup functions

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState(null); // tracks which report is active
  const [productId, setProductId] = useState('');
  const [singleDate, setSingleDate] = useState('');

  // ------------------------ REPORT LOADERS ------------------------
  const runSalesReport = async () => {
    try {
      setReportType('sales');
      const res = await axiosClient.get('/reports/sales', {
        params: { from_date: fromDate, to_date: toDate }
      });
      setReportData(res.data);
      showPopup({
        type: 'info',
        title: 'Sales Report',
        message: 'Sales report loaded successfully.'
      });
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Sales Report Failed',
        message: 'Failed to load sales report. Please try again.'
      });
    }
  };

  const runPurchaseReport = async () => {
    try {
      setReportType('purchases');
      const res = await axiosClient.get('/reports/purchases', {
        params: { from_date: fromDate, to_date: toDate }
      });
      setReportData(res.data);
      showPopup({
        type: 'info',
        title: 'Purchase Report',
        message: 'Purchase report loaded successfully.'
      });
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Purchase Report Failed',
        message: 'Failed to load purchase report. Please try again.'
      });
    }
  };

  const runStockReport = async () => {
    try {
      setReportType('stock');
      const res = await axiosClient.get('/reports/stock');
      setReportData(res.data);
      showPopup({
        type: 'info',
        title: 'Stock Report',
        message: 'Stock report loaded successfully.'
      });
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Stock Report Failed',
        message: 'Failed to load stock report. Please try again.'
      });
    }
  };

  const runNearExpiryReport = async () => {
    try {
      setReportType('near-expiry');
      const res = await axiosClient.get('/reports/near-expiry', {
        params: { days: 250 }
      });
      setReportData(res.data);
      showPopup({
        type: 'info',
        title: 'Near Expiry Report',
        message: 'Near expiry report loaded successfully.'
      });
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Near Expiry Failed',
        message: 'Failed to load near expiry report. Please try again.'
      });
    }
  };

  const runProfitLossReport = async () => {
    try {
      setReportType('profit-loss');
      const res = await axiosClient.get('/reports/profit-loss', {
        params: { from_date: fromDate, to_date: toDate }
      });
      setReportData(res.data);
      showPopup({
        type: 'info',
        title: 'Profit & Loss Report',
        message: 'Profit & loss report loaded successfully.'
      });
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Profit & Loss Failed',
        message: 'Failed to load profit-loss report. Please try again.'
      });
    }
  };

  const runProductSalesReport = async () => {
    try {
      setReportType('product-sales');
      const res = await axiosClient.get('/reports/product-sales', {
        params:
          productId && fromDate && toDate
            ? { product_id: productId, from_date: fromDate, to_date: toDate }
            : {}
      });
      setReportData(res.data);
      showPopup({
        type: 'info',
        title: 'Product-wise Sales',
        message: 'Product-wise sales report loaded successfully.'
      });
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Product Sales Failed',
        message: 'Failed to load product sales report. Please try again.'
      });
    }
  };

  const runCustomerLedger = async () => {
    try {
      setReportType('customer-ledger');
      const res = await axiosClient.get('/reports/customer-ledger/1');
      setReportData(res.data);
      showPopup({
        type: 'info',
        title: 'Customer Ledger',
        message: 'Customer ledger report loaded successfully.'
      });
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Customer Ledger Failed',
        message: 'Failed to load customer ledger report. Please try again.'
      });
    }
  };

  const runSupplierLedger = async () => {
    try {
      setReportType('supplier-ledger');
      const res = await axiosClient.get('/reports/supplier-ledger/1');
      setReportData(res.data);
      showPopup({
        type: 'info',
        title: 'Supplier Ledger',
        message: 'Supplier ledger report loaded successfully.'
      });
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Supplier Ledger Failed',
        message: 'Failed to load supplier ledger report. Please try again.'
      });
    }
  };

  const runDailyReport = async () => {
    try {
      setReportType('daily-summary');
      const res = await axiosClient.get('/reports/daily-summary', {
        params: { date: singleDate }
      });
      setReportData(res.data);
      showPopup({
        type: 'info',
        title: 'Daily Summary',
        message: 'Daily summary report loaded successfully.'
      });
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Daily Summary Failed',
        message: 'Failed to load daily summary report. Please try again.'
      });
    }
  };

  // ------------------------ HELPERS ------------------------

  const safeVal = (val) => {
    if (val === null || val === undefined || val === '') return '—';
    return val;
  };

  const formatDate = (val) => {
    if (!val) return '—';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return val;
    return d.toLocaleDateString();
  };

  const renderValue = (val) => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'string' || typeof val === 'number') return val;
    if (Array.isArray(val)) return `${val.length} items`;
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const renderGenericTable = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      return <p className="text-xs text-slate-500">No data found.</p>;
    }

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

  const renderCustomTable = (rows, columns) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      return <p className="text-xs text-slate-500">No data found.</p>;
    }

    return (
      <div className="overflow-x-auto max-h-[28rem]">
        <table className="min-w-full text-xs border rounded">
          <thead className="bg-slate-100 text-slate-600 uppercase">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-2 py-1 text-left border-b">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b hover:bg-slate-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-2 py-1 border-b">
                    {col.render ? col.render(row) : safeVal(row[col.key])}
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
    if (!ledger || typeof ledger !== 'object') return null;

    const person = ledger.customer || ledger.supplier;

    return (
      <div className="space-y-4 text-xs">
        {/* PERSON CARD */}
        {person && (
          <div className="bg-slate-50 border rounded p-3 space-y-1">
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

        {/* OPENING BALANCE */}
        {'opening_balance' in ledger && (
          <div className="bg-white border rounded p-3">
            <strong>Opening Balance:</strong> Rs. {ledger.opening_balance}
          </div>
        )}

        {/* SALES TABLE */}
        {Array.isArray(ledger.sales) && ledger.sales.length > 0 && (
          <div className="space-y-1">
            <h4 className="font-semibold text-slate-700">Sales</h4>
            {renderGenericTable(ledger.sales)}
          </div>
        )}

        {/* PAYMENTS TABLE */}
        {Array.isArray(ledger.payments) && ledger.payments.length > 0 && (
          <div className="space-y-1">
            <h4 className="font-semibold text-slate-700">Payments</h4>
            {renderGenericTable(ledger.payments)}
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

  // ------------------------ PER-REPORT RENDERERS ------------------------

  const extractRows = () => {
    if (!reportData) return [];
    if (Array.isArray(reportData)) return reportData;
    if (Array.isArray(reportData.data)) return reportData.data;
    return [];
  };

  const renderSalesReport = () => {
    const rows = extractRows();
    const columns = [
      { key: 'invoice_no', label: 'Invoice No' },
      { key: 'invoice_date', label: 'Date', render: (r) => formatDate(r.invoice_date) },
      {
        key: 'customer',
        label: 'Customer',
        render: (r) => r.customer?.name || `ID ${r.customer_id || '—'}`
      },
      {
        key: 'net_total',
        label: 'Net Total',
        render: (r) => `Rs. ${safeVal(r.net_total || r.total_amount)}`
      },
      { key: 'createdAt', label: 'Created At', render: (r) => formatDate(r.createdAt) }
    ];

    return renderCustomTable(rows, columns);
  };

  const renderPurchaseReport = () => {
    const rows = extractRows();
    const columns = [
      { key: 'invoice_no', label: 'Invoice No' },
      { key: 'invoice_date', label: 'Date', render: (r) => formatDate(r.invoice_date) },
      {
        key: 'supplier',
        label: 'Supplier',
        render: (r) => r.supplier?.name || `ID ${r.supplier_id || '—'}`
      },
      {
        key: 'total_amount',
        label: 'Total Amount',
        render: (r) => `Rs. ${safeVal(r.total_amount)}`
      },
      { key: 'createdAt', label: 'Created At', render: (r) => formatDate(r.createdAt) }
    ];

    return renderCustomTable(rows, columns);
  };

  const renderStockReport = () => {
    const rows = extractRows();
    const columns = [
      { key: 'product_id', label: 'Product ID' },
      { key: 'product_name', label: 'Product' },
      { key: 'total_qty', label: 'Total Qty', render: (r) => safeVal(r.total_qty || r.quantity) },
      { key: 'remaining_qty', label: 'Remaining', render: (r) => safeVal(r.remaining_qty) }
    ];

    return renderCustomTable(rows, columns);
  };

  const renderNearExpiryReport = () => {
    const rows = extractRows();
    const columns = [
      { key: 'product_id', label: 'Product ID' },
      { key: 'product_name', label: 'Product' },
      { key: 'batch_no', label: 'Batch No' },
      { key: 'expiry_date', label: 'Expiry', render: (r) => formatDate(r.expiry_date) },
      { key: 'quantity', label: 'Qty', render: (r) => safeVal(r.quantity) }
    ];

    return renderCustomTable(rows, columns);
  };

  const renderProductSalesReport = () => {
    const rows = extractRows();
    const columns = [
      { key: 'product_id', label: 'Product ID' },
      {
        key: 'product_name',
        label: 'Product',
        render: (r) =>
          r.product_name ||
          r.product?.product_name ||
          `Product #${r.product_id || '—'}`
      },
      {
        key: 'total_qty',
        label: 'Qty Sold',
        render: (r) => safeVal(r.total_qty || r.quantity)
      },
      {
        key: 'total_amount',
        label: 'Total Amount',
        render: (r) => `Rs. ${safeVal(r.total_amount)}`
      }
    ];

    return renderCustomTable(rows, columns);
  };

  const renderProfitLossReport = () => {
    if (!reportData || typeof reportData !== 'object') {
      return <p className="text-xs text-slate-500">No data for profit-loss report.</p>;
    }

    const summary = reportData.summary || reportData;
    const revenue = summary.total_sales ?? summary.revenue;
    const cost = summary.total_cost ?? summary.cost;
    const profit = summary.total_profit ?? summary.profit;

    const hasSummary = revenue !== undefined || cost !== undefined || profit !== undefined;

    const detailRows =
      (Array.isArray(reportData.details) && reportData.details) ||
      (Array.isArray(reportData.rows) && reportData.rows) ||
      (Array.isArray(reportData.breakdown) && reportData.breakdown) ||
      (Array.isArray(reportData.data) && reportData.data) ||
      (Array.isArray(reportData.items) && reportData.items) ||
      [];

    const scalarEntries = Object.entries(reportData).filter(
      ([key, value]) =>
        !['summary', 'details', 'rows', 'breakdown', 'data', 'items'].includes(key) &&
        (value === null ||
          ['string', 'number', 'boolean'].includes(typeof value))
    );

    return (
      <div className="space-y-4 text-xs">
        {hasSummary && (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="bg-slate-50 border rounded p-3">
              <p className="font-semibold text-slate-700 text-xs">Revenue</p>
              <p className="text-sm font-medium">Rs. {safeVal(revenue)}</p>
            </div>
            <div className="bg-slate-50 border rounded p-3">
              <p className="font-semibold text-slate-700 text-xs">Cost</p>
              <p className="text-sm font-medium">Rs. {safeVal(cost)}</p>
            </div>
            <div className="bg-slate-50 border rounded p-3">
              <p className="font-semibold text-slate-700 text-xs">Profit</p>
              <p className="text-sm font-medium">Rs. {safeVal(profit)}</p>
            </div>
          </div>
        )}

        {scalarEntries.length > 0 && (
          <div className="bg-white border rounded p-3">
            <p className="font-semibold text-slate-700 mb-2">Summary Fields</p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border rounded">
                <thead className="bg-slate-100 text-slate-600 uppercase">
                  <tr>
                    <th className="px-2 py-1 text-left border-b">Field</th>
                    <th className="px-2 py-1 text-left border-b">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {scalarEntries.map(([key, value]) => (
                    <tr key={key} className="border-b hover:bg-slate-50">
                      <td className="px-2 py-1 border-b">{key}</td>
                      <td className="px-2 py-1 border-b">{safeVal(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {Array.isArray(detailRows) && detailRows.length > 0 && (
          <div>
            <p className="font-semibold text-slate-700 mb-1">Detailed Rows</p>
            {renderGenericTable(detailRows)}
          </div>
        )}

        {!hasSummary &&
          scalarEntries.length === 0 &&
          (!detailRows || detailRows.length === 0) && (
            <p className="text-xs text-slate-500">
              No structured data found in profit-loss response.
            </p>
          )}
      </div>
    );
  };

  const renderDailySummary = () => {
    const rows = extractRows();

    if (rows.length > 0) {
      return renderGenericTable(rows);
    }

    return (
      <div className="text-xs bg-slate-50 rounded-lg p-3 border overflow-auto max-h-[32rem]">
        <pre>{JSON.stringify(reportData, null, 2)}</pre>
      </div>
    );
  };

  // ------------------------ MAIN REPORT RENDERING ------------------------

  const renderReportOutput = () => {
    if (!reportData)
      return (
        <p className="text-xs text-slate-500">
          Run any report to see data here.
        </p>
      );

    if (reportType === 'customer-ledger' || reportType === 'supplier-ledger') {
      if (typeof reportData === 'object') {
        return renderLedger(reportData);
      }
    }

    switch (reportType) {
      case 'sales':
        return renderSalesReport();
      case 'purchases':
        return renderPurchaseReport();
      case 'stock':
        return renderStockReport();
      case 'near-expiry':
        return renderNearExpiryReport();
      case 'product-sales':
        return renderProductSalesReport();
      case 'profit-loss':
        return renderProfitLossReport();
      case 'daily-summary':
        return renderDailySummary();
      default: {
        const rows = extractRows();
        if (rows.length > 0) return renderGenericTable(rows);

        return (
          <div className="text-xs bg-slate-50 rounded-lg p-3 border overflow-auto max-h-[32rem]">
            <pre>{JSON.stringify(reportData, null, 2)}</pre>
          </div>
        );
      }
    }
  };

  // ------------------------ PAGE UI ------------------------

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
            <label className="text-xs font-medium text-slate-700 block mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Product ID (for product-wise sales)
            </label>
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
          <button
            onClick={runSalesReport}
            className="px-3 py-2 border rounded hover:bg-slate-50"
          >
            Sales Report
          </button>
          <button
            onClick={runPurchaseReport}
            className="px-3 py-2 border rounded hover:bg-slate-50"
          >
            Purchase Report
          </button>
          <button
            onClick={runStockReport}
            className="px-3 py-2 border rounded hover:bg-slate-50"
          >
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

          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Daily Summary Date
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                className="w-full"
              />
              <button
                onClick={runDailyReport}
                className="px-3 py-2 border rounded hover:bg-slate-50 whitespace-nowrap"
              >
                Daily Summary
              </button>
            </div>
          </div>
        </section>
      </section>

      {/* OUTPUT */}
      <section className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-800">Report Output</h3>
          {reportType && (
            <span className="text-[11px] text-slate-500 capitalize">
              Showing: {reportType.replace('-', ' ')}
            </span>
          )}
        </div>
        {renderReportOutput()}
      </section>
    </main>
  );
};

export default ReportsPage;
