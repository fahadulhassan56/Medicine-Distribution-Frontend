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
  const [customerLedger, setCustomerLedger] = useState([]); // array of entries
  const [supplierLedger, setSupplierLedger] = useState([]); // array of entries
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Dropdown data
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // ---------- CHANGE HANDLERS ----------

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

  // ---------- API CALLS: CREATE PAYMENTS ----------

  const submitCustomerPayment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...customerPayment,
        customer_id: Number(customerPayment.customer_id),
        amount: Number(customerPayment.amount)
      };

      await axiosClient.post('/payments/customer', payload);
      alert('Customer payment recorded');

      setCustomerPayment({
        customer_id: '',
        amount: '',
        payment_date: '',
        payment_method: 'cash',
        notes: ''
      });
      await loadHistory();
      if (customerLedgerId) {
        await loadCustomerLedger(); // refresh ledger if same customer selected
      }
    } catch (err) {
      console.error(err);
      alert('Failed to record customer payment');
    }
  };

  const submitSupplierPayment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...supplierPayment,
        supplier_id: Number(supplierPayment.supplier_id),
        amount: Number(supplierPayment.amount)
      };

      await axiosClient.post('/payments/supplier', payload);
      alert('Supplier payment recorded');

      setSupplierPayment({
        supplier_id: '',
        amount: '',
        payment_date: '',
        payment_mode: 'bank_transfer',
        notes: ''
      });
      await loadHistory();
      if (supplierLedgerId) {
        await loadSupplierLedger(); // refresh ledger
      }
    } catch (err) {
      console.error(err);
      alert('Failed to record supplier payment');
    }
  };

  // ---------- LEDGER LOADERS (array responses) ----------

  const loadCustomerLedger = async () => {
    if (!customerLedgerId) return;
    try {
      const res = await axiosClient.get(`/payments/customer/${customerLedgerId}`);
      // response: { success, message, data: [ ...entries ] }
      const entries = res.data?.data || [];
      setCustomerLedger(entries);
    } catch (err) {
      console.error(err);
      alert('Failed to load customer ledger');
    }
  };

  const loadSupplierLedger = async () => {
    if (!supplierLedgerId) return;
    try {
      const res = await axiosClient.get(`/payments/supplier/${supplierLedgerId}`);
      // response: { success, message, data: [ ...entries ] }
      const entries = res.data?.data || [];
      setSupplierLedger(entries);
    } catch (err) {
      console.error(err);
      alert('Failed to load supplier ledger');
    }
  };

  const loadHistory = async () => {
    try {
      const res = await axiosClient.get('/payments/history');
      // response: { success, message, data: [ ...history ] }
      const list = res.data?.data || [];
      setPaymentHistory(list);
    } catch (err) {
      console.error(err);
      alert('Failed to load payment history');
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await axiosClient.get('/customers', { params: { limit: 1000 } });
      const raw = res.data?.data;
      const list = Array.isArray(raw) ? raw : raw?.customers || [];
      setCustomers(list);
    } catch (err) {
      console.error(err);
      alert('Failed to load customers');
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await axiosClient.get('/suppliers', { params: { limit: 1000 } });
      const raw = res.data?.data;
      const list = Array.isArray(raw) ? raw : raw?.suppliers || [];
      setSuppliers(list);
    } catch (err) {
      console.error(err);
      alert('Failed to load suppliers');
    }
  };

  useEffect(() => {
    loadHistory();
    loadCustomers();
    loadSuppliers();
  }, []);

  // ------------------------- LEDGER RENDERERS (array-based) -------------------------

  const renderLedgerTable = (entries) => {
    if (!Array.isArray(entries) || entries.length === 0) {
      return <p className="text-xs text-slate-500">No ledger entries found.</p>;
    }

    return (
      <div className="overflow-x-auto max-h-72 text-xs">
        <table className="min-w-full border rounded">
          <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
            <tr>
              <th className="px-2 py-1 border-b text-left">ID</th>
              <th className="px-2 py-1 border-b text-left">Type</th>
              <th className="px-2 py-1 border-b text-left">Amount</th>
              <th className="px-2 py-1 border-b text-left">Mode</th>
              <th className="px-2 py-1 border-b text-left">Date</th>
              <th className="px-2 py-1 border-b text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((t) => (
              <tr key={t.id} className="border-b hover:bg-slate-50">
                <td className="px-2 py-1">{t.id}</td>
                <td className="px-2 py-1">{t.payment_type || '—'}</td>
                <td className="px-2 py-1">{t.amount}</td>
                <td className="px-2 py-1">{t.payment_mode || '—'}</td>
                <td className="px-2 py-1">
                  {t.createdAt
                    ? new Date(t.createdAt).toLocaleDateString()
                    : '—'}
                </td>
                <td className="px-2 py-1">{t.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
              <th className="px-2 py-1 border-b text-left">ID</th>
              <th className="px-2 py-1 border-b text-left">Type</th>
              <th className="px-2 py-1 border-b text-left">Party</th>
              <th className="px-2 py-1 border-b text-left">Amount</th>
              <th className="px-2 py-1 border-b text-left">Mode</th>
              <th className="px-2 py-1 border-b text-left">Date</th>
              <th className="px-2 py-1 border-b text-left">Notes</th>
            </tr>
          </thead>

          <tbody>
            {paymentHistory.map((p) => {
              const partyName =
                p.customer?.name ||
                p.supplier?.name ||
                (p.payment_type === 'customer'
                  ? `Customer #${p.customer_id}`
                  : p.payment_type === 'supplier'
                  ? `Supplier #${p.supplier_id}`
                  : '—');

              return (
                <tr key={p.id} className="border-b hover:bg-slate-50">
                  <td className="px-2 py-1">{p.id}</td>
                  <td className="px-2 py-1">{p.payment_type || '—'}</td>
                  <td className="px-2 py-1">{partyName}</td>
                  <td className="px-2 py-1">{p.amount || '—'}</td>
                  <td className="px-2 py-1">{p.payment_mode || p.payment_method || '—'}</td>
                  <td className="px-2 py-1">
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleString()
                      : p.payment_date || '—'}
                  </td>
                  <td className="px-2 py-1">{p.notes || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Helpers to show selected party name above ledger
  const selectedCustomer = customers.find(
    (c) => c.id === Number(customerLedgerId)
  );
  const selectedSupplier = suppliers.find(
    (s) => s.id === Number(supplierLedgerId)
  );

  // ----------------------------- PAGE UI -----------------------------

  return (
    <main className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Payments</h2>
        <p className="text-sm text-slate-600">
          Manage customer receipts, supplier payments, ledgers & history.
        </p>
      </header>

      {/* PAYMENT FORMS */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* CUSTOMER PAYMENT */}
        <section className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Customer Payment
          </h3>

          <form className="space-y-3" onSubmit={submitCustomerPayment}>
            <div>
              <label className="text-xs font-medium">Customer</label>
              <select
                name="customer_id"
                value={customerPayment.customer_id}
                onChange={handleCustomerPaymentChange}
                required
                className="w-full border px-2 py-1 text-sm rounded"
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
              </select>
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
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Supplier Payment
          </h3>

          <form className="space-y-3" onSubmit={submitSupplierPayment}>
            <div>
              <label className="text-xs font-medium">Supplier</label>
              <select
                name="supplier_id"
                value={supplierPayment.supplier_id}
                onChange={handleSupplierPaymentChange}
                required
                className="w-full border px-2 py-1 text-sm rounded"
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.phone ? `(${s.phone})` : ''}
                  </option>
                ))}
              </select>
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
          <header className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Customer Ledger
              </h3>
              {selectedCustomer && (
                <p className="text-[11px] text-slate-500">
                  {selectedCustomer.name}{' '}
                  {selectedCustomer.phone ? `· ${selectedCustomer.phone}` : ''}
                </p>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={customerLedgerId}
                onChange={(e) => setCustomerLedgerId(e.target.value)}
                className="border px-2 py-1 text-xs rounded"
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={loadCustomerLedger}
                className="text-xs px-3 py-1 border rounded-md"
              >
                Load
              </button>
            </div>
          </header>

          {renderLedgerTable(customerLedger)}
        </section>

        {/* SUPPLIER LEDGER */}
        <section className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
          <header className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Supplier Ledger
              </h3>
              {selectedSupplier && (
                <p className="text-[11px] text-slate-500">
                  {selectedSupplier.name}{' '}
                  {selectedSupplier.phone ? `· ${selectedSupplier.phone}` : ''}
                </p>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={supplierLedgerId}
                onChange={(e) => setSupplierLedgerId(e.target.value)}
                className="border px-2 py-1 text-xs rounded"
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.phone ? `(${s.phone})` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={loadSupplierLedger}
                className="text-xs px-3 py-1 border rounded-md"
              >
                Load
              </button>
            </div>
          </header>

          {renderLedgerTable(supplierLedger)}
        </section>
      </section>

      {/* PAYMENT HISTORY (FULL) */}
      <section className="bg-white rounded-xl shadow-sm border p-4">
        <header className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-800">
            Payments History
          </h3>
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
