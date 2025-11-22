import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';

const PaymentsPage = () => {
  const [customerPayment, setCustomerPayment] = useState({
    customer_id: '',
    amount: '',
    payment_date: '',
    payment_method: 'cash',
    notes: ''
  });

  const [supplierPayment, setSupplierPayment] = useState({
    supplier_id: '',
    amount: '',
    payment_date: '',
    payment_mode: 'bank_transfer',
    notes: ''
  });

  const [customerLedgerId, setCustomerLedgerId] = useState('');
  const [supplierLedgerId, setSupplierLedgerId] = useState('');
  const [customerLedger, setCustomerLedger] = useState(null);
  const [supplierLedger, setSupplierLedger] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const handleCustomerPaymentChange = (e) => {
    const { name, value } = e.target;
    setCustomerPayment((p) => ({
      ...p,
      [name]: name === 'amount' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSupplierPaymentChange = (e) => {
    const { name, value } = e.target;
    setSupplierPayment((p) => ({
      ...p,
      [name]: name === 'amount' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const submitCustomerPayment = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/payments/customer', customerPayment);
      alert('Customer payment recorded');
    } catch (err) {
      console.error(err);
      alert('Failed to record customer payment');
    }
  };

  const submitSupplierPayment = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/payments/supplier', supplierPayment);
      alert('Supplier payment recorded');
    } catch (err) {
      console.error(err);
      alert('Failed to record supplier payment');
    }
  };

  const loadCustomerLedger = async () => {
    if (!customerLedgerId) return;
    try {
      const res = await axiosClient.get(`/payments/customer/${customerLedgerId}`);
      setCustomerLedger(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load customer ledger');
    }
  };

  const loadSupplierLedger = async () => {
    if (!supplierLedgerId) return;
    try {
      const res = await axiosClient.get(`/payments/supplier/${supplierLedgerId}`);
      setSupplierLedger(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load supplier ledger');
    }
  };

  const loadHistory = async () => {
    try {
      const res = await axiosClient.get('/payments/history');
      setPaymentHistory(res.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load payment history');
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // ------------------------- LEDGER RENDERER -------------------------

  const renderLedger = (ledger) => {
    if (!ledger || typeof ledger !== "object") return null;

    const person = ledger.customer || ledger.supplier;

    return (
      <div className="space-y-3 text-xs">

        {/* PERSON DETAILS CARD */}
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
        {ledger.opening_balance !== undefined && (
          <div className="bg-white border rounded p-3">
            <strong>Opening Balance:</strong> Rs. {ledger.opening_balance}
          </div>
        )}

        {/* TRANSACTIONS TABLE */}
        {Array.isArray(ledger.transactions) && ledger.transactions.length > 0 && (
          <div className="overflow-x-auto">
            <h4 className="font-semibold text-slate-700 mb-1">Transactions</h4>
            <table className="min-w-full text-xs border rounded">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="px-2 py-1 border-b text-left">Type</th>
                  <th className="px-2 py-1 border-b text-left">Amount</th>
                  <th className="px-2 py-1 border-b text-left">Date</th>
                  <th className="px-2 py-1 border-b text-left">Notes</th>
                </tr>
              </thead>

              <tbody>
                {ledger.transactions.map((t, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="px-2 py-1">{t.type}</td>
                    <td className="px-2 py-1">{t.amount}</td>
                    <td className="px-2 py-1">{t.payment_date}</td>
                    <td className="px-2 py-1">{t.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CLOSING BALANCE */}
        {ledger.closing_balance !== undefined && (
          <div className="bg-white border rounded p-3">
            <strong>Closing Balance:</strong> Rs. {ledger.closing_balance}
          </div>
        )}
      </div>
    );
  };

  // ------------------------- PAYMENT HISTORY TABLE -------------------------

  const renderPaymentHistory = () => {
    if (!Array.isArray(paymentHistory) || paymentHistory.length === 0)
      return <p className="text-xs text-slate-500">No payment history found.</p>;

    return (
      <div className="overflow-x-auto max-h-80 text-xs">
        <table className="min-w-full border rounded">
          <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
            <tr>
              <th className="px-2 py-1 border-b text-left">Type</th>
              <th className="px-2 py-1 border-b text-left">ID</th>
              <th className="px-2 py-1 border-b text-left">Amount</th>
              <th className="px-2 py-1 border-b text-left">Date</th>
              <th className="px-2 py-1 border-b text-left">Method</th>
              <th className="px-2 py-1 border-b text-left">Notes</th>
            </tr>
          </thead>

          <tbody>
            {paymentHistory.map((p, idx) => (
              <tr key={idx} className="border-b hover:bg-slate-50">
                <td className="px-2 py-1">{p.type || '—'}</td>
                <td className="px-2 py-1">{p.customer_id || p.supplier_id || '—'}</td>
                <td className="px-2 py-1">{p.amount || '—'}</td>
                <td className="px-2 py-1">{p.payment_date || '—'}</td>
                <td className="px-2 py-1">
                  {p.payment_method || p.payment_mode || '—'}
                </td>
                <td className="px-2 py-1">
                  {p.notes ? <span>{p.notes}</span> : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ----------------------------- PAGE UI -----------------------------

  return (
    <main className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Payments</h2>
        <p className="text-sm text-slate-600">
          Manage customer receipts, supplier payments and ledgers.
        </p>
      </header>

      {/* PAYMENT FORMS */}
      <section className="grid gap-4 md:grid-cols-2">
        
        {/* CUSTOMER PAYMENT */}
        <section className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Customer Payment</h3>

          <form className="space-y-3" onSubmit={submitCustomerPayment}>
            <div>
              <label className="text-xs font-medium">Customer ID</label>
              <input
                type="number"
                name="customer_id"
                value={customerPayment.customer_id}
                onChange={handleCustomerPaymentChange}
                required
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Amount</label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  value={customerPayment.amount}
                  onChange={handleCustomerPaymentChange}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs font-medium">Payment Date</label>
                <input
                  type="date"
                  name="payment_date"
                  value={customerPayment.payment_date}
                  onChange={handleCustomerPaymentChange}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium">Payment Method</label>
              <select
                name="payment_method"
                value={customerPayment.payment_method}
                onChange={handleCustomerPaymentChange}
                className="w-full"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium">Notes</label>
              <textarea
                name="notes"
                value={customerPayment.notes}
                onChange={handleCustomerPaymentChange}
                rows={2}
                className="w-full"
              />
            </div>

            <div className="flex justify-end">
              <button className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                Save Receipt
              </button>
            </div>
          </form>
        </section>

        {/* SUPPLIER PAYMENT */}
        <section className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Supplier Payment</h3>

          <form className="space-y-3" onSubmit={submitSupplierPayment}>
            <div>
              <label className="text-xs font-medium">Supplier ID</label>
              <input
                type="number"
                name="supplier_id"
                value={supplierPayment.supplier_id}
                onChange={handleSupplierPaymentChange}
                required
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Amount</label>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  value={supplierPayment.amount}
                  onChange={handleSupplierPaymentChange}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs font-medium">Payment Date</label>
                <input
                  type="date"
                  name="payment_date"
                  value={supplierPayment.payment_date}
                  onChange={handleSupplierPaymentChange}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium">Payment Mode</label>
              <select
                name="payment_mode"
                value={supplierPayment.payment_mode}
                onChange={handleSupplierPaymentChange}
                className="w-full"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium">Notes</label>
              <textarea
                name="notes"
                value={supplierPayment.notes}
                onChange={handleSupplierPaymentChange}
                rows={2}
                className="w-full"
              />
            </div>

            <div className="flex justify-end">
              <button className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                Save Payment
              </button>
            </div>
          </form>
        </section>
      </section>

      {/* LEDGERS */}
      <section className="grid gap-4 md:grid-cols-2">
        
        {/* CUSTOMER LEDGER */}
        <section className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Customer Ledger</h3>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Customer ID"
                value={customerLedgerId}
                onChange={(e) => setCustomerLedgerId(e.target.value)}
                className="w-24 border px-2 py-1 text-xs"
              />
              <button
                type="button"
                onClick={loadCustomerLedger}
                className="text-xs px-3 py-1 border rounded-md"
              >
                Load
              </button>
            </div>
          </header>

          {customerLedger && renderLedger(customerLedger)}
        </section>

        {/* SUPPLIER LEDGER */}
        <section className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Supplier Ledger</h3>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Supplier ID"
                value={supplierLedgerId}
                onChange={(e) => setSupplierLedgerId(e.target.value)}
                className="w-24 border px-2 py-1 text-xs"
              />
              <button
                type="button"
                onClick={loadSupplierLedger}
                className="text-xs px-3 py-1 border rounded-md"
              >
                Load
              </button>
            </div>
          </header>

          {supplierLedger && renderLedger(supplierLedger)}
        </section>
      </section>

      {/* PAYMENT HISTORY */}
      <section className="bg-white rounded-xl shadow-sm border p-4">
        <header className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-800">Payments History</h3>
          <button
            type="button"
            onClick={loadHistory}
            className="text-xs px-3 py-1 border rounded-md"
          >
            Refresh
          </button>
        </header>

        {renderPaymentHistory()}
      </section>
    </main>
  );
};

export default PaymentsPage;
