import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';
import { usePopup } from '../../components/ui/PopupContext'; // 👈 popup hook

const PaymentsPage = () => {
  const { showPopup } = usePopup(); // 👈 get popup helpers

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

  // dropdown data
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // pagination for history
  const [historyPage, setHistoryPage] = useState(1);
  const historyPageSize = 10;

  // ------------------------- LOADERS -------------------------

  const loadCustomers = async () => {
    try {
      const res = await axiosClient.get('/customers');
      setCustomers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load customers', err);
      showPopup({
        type: 'error',
        title: 'Load Failed',
        message: 'Unable to load customers list. Please try again.'
      });
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await axiosClient.get('/suppliers');
      setSuppliers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load suppliers', err);
      showPopup({
        type: 'error',
        title: 'Load Failed',
        message: 'Unable to load suppliers list. Please try again.'
      });
    }
  };

  const loadHistory = async () => {
    try {
      const res = await axiosClient.get('/payments/history');
      const list = res.data?.data || res.data || [];
      const normalized = Array.isArray(list) ? list : [];
      setPaymentHistory(normalized);
      setHistoryPage(1);
      showPopup({
        type: 'info',
        title: 'History Updated',
        message: 'Payment history has been refreshed.'
      });
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load payment history. Please try again.'
      });
    }
  };

  useEffect(() => {
    loadCustomers();
    loadSuppliers();
    loadHistory();
  }, []);

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
      const payload = {
        ...customerPayment,
        customer_id: customerPayment.customer_id
          ? Number(customerPayment.customer_id)
          : null
      };
      await axiosClient.post('/payments/customer', payload);
      showPopup({
        type: 'success',
        title: 'Receipt Saved',
        message: 'Customer payment has been recorded successfully.'
      });
      setCustomerPayment({
        customer_id: '',
        amount: '',
        payment_date: '',
        payment_method: 'cash',
        notes: ''
      });
      await loadHistory();
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to record customer payment. Please try again.'
      });
    }
  };

  const submitSupplierPayment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...supplierPayment,
        supplier_id: supplierPayment.supplier_id
          ? Number(supplierPayment.supplier_id)
          : null
      };
      await axiosClient.post('/payments/supplier', payload);
      showPopup({
        type: 'success',
        title: 'Payment Saved',
        message: 'Supplier payment has been recorded successfully.'
      });
      setSupplierPayment({
        supplier_id: '',
        amount: '',
        payment_date: '',
        payment_mode: 'bank_transfer',
        notes: ''
      });
      await loadHistory();
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to record supplier payment. Please try again.'
      });
    }
  };

  const loadCustomerLedger = async () => {
    if (!customerLedgerId) {
      showPopup({
        type: 'warning',
        title: 'No Customer Selected',
        message: 'Please select a customer to load ledger.'
      });
      return;
    }
    try {
      const res = await axiosClient.get(`/payments/customer/${customerLedgerId}`);
      setCustomerLedger(res.data?.data || res.data);
      showPopup({
        type: 'info',
        title: 'Customer Ledger Loaded',
        message: 'Ledger details have been loaded.'
      });
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load customer ledger. Please try again.'
      });
    }
  };

  const loadSupplierLedger = async () => {
    if (!supplierLedgerId) {
      showPopup({
        type: 'warning',
        title: 'No Supplier Selected',
        message: 'Please select a supplier to load ledger.'
      });
      return;
    }
    try {
      const res = await axiosClient.get(`/payments/supplier/${supplierLedgerId}`);
      setSupplierLedger(res.data?.data || res.data);
      showPopup({
        type: 'info',
        title: 'Supplier Ledger Loaded',
        message: 'Ledger details have been loaded.'
      });
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load supplier ledger. Please try again.'
      });
    }
  };

  // ------------------------- LEDGER RENDERER -------------------------

  const renderLedger = (ledger) => {
    if (!ledger || typeof ledger !== 'object') return null;

    const person = ledger.customer || ledger.supplier;

    return (
      <div className="space-y-3 text-xs">
        {/* PERSON DETAILS CARD */}
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

    const getCustomerName = (id) =>
      customers.find((c) => c.id === id)?.name || (id ? `Customer #${id}` : '—');
    const getSupplierName = (id) =>
      suppliers.find((s) => s.id === id)?.name || (id ? `Supplier #${id}` : '—');

    const totalItems = paymentHistory.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / historyPageSize));
    const safePage = Math.min(historyPage, totalPages);
    const startIndex = (safePage - 1) * historyPageSize;
    const endIndex = startIndex + historyPageSize;
    const pageItems = paymentHistory.slice(startIndex, endIndex);

    const handlePrev = () => {
      setHistoryPage((prev) => Math.max(1, prev - 1));
    };

    const handleNext = () => {
      setHistoryPage((prev) => Math.min(totalPages, prev + 1));
    };

    return (
      <>
        <div className="overflow-x-auto max-h-80 text-xs">
          <table className="min-w-full border rounded">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
              <tr>
                <th className="px-2 py-1 border-b text-left">Type</th>
                <th className="px-2 py-1 border-b text-left">ID</th>
                <th className="px-2 py-1 border-b text-left">Name</th>
                <th className="px-2 py-1 border-b text-left">Amount</th>
                <th className="px-2 py-1 border-b text-left">Date</th>
                <th className="px-2 py-1 border-b text-left">Method / Mode</th>
                <th className="px-2 py-1 border-b text-left">Notes</th>
              </tr>
            </thead>

            <tbody>
              {pageItems.map((p, idx) => {
                const isCustomer = !!p.customer_id;
                const id = p.customer_id || p.supplier_id || null;
                const name = isCustomer ? getCustomerName(id) : getSupplierName(id);

                return (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="px-2 py-1">
                      {p.type || (isCustomer ? 'Customer' : 'Supplier')}
                    </td>
                    <td className="px-2 py-1">{id || '—'}</td>
                    <td className="px-2 py-1">{name}</td>
                    <td className="px-2 py-1">{p.amount || '—'}</td>
                    <td className="px-2 py-1">{p.payment_date || '—'}</td>
                    <td className="px-2 py-1">
                      {p.payment_method || p.payment_mode || '—'}
                    </td>
                    <td className="px-2 py-1">{p.notes ? <span>{p.notes}</span> : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-600">
          <span>
            Showing {totalItems === 0 ? 0 : startIndex + 1}–
            {Math.min(endIndex, totalItems)} of {totalItems}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={safePage === 1}
              className="px-3 py-1 rounded-md border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span>
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={safePage === totalPages}
              className="px-3 py-1 rounded-md border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </>
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
              <label className="text-xs font-medium">Customer</label>
              <select
                name="customer_id"
                value={customerPayment.customer_id}
                onChange={handleCustomerPaymentChange}
                required
                className="w-full"
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
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
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Supplier Payment</h3>

          <form className="space-y-3" onSubmit={submitSupplierPayment}>
            <div>
              <label className="text-xs font-medium">Supplier</label>
              <select
                name="supplier_id"
                value={supplierPayment.supplier_id}
                onChange={handleSupplierPaymentChange}
                required
                className="w-full"
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone})
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
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Customer Ledger</h3>
            <div className="flex gap-2 items-center">
              <select
                value={customerLedgerId}
                onChange={(e) => setCustomerLedgerId(e.target.value)}
                className="border px-2 py-1 text-xs"
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
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

          {customerLedger && renderLedger(customerLedger)}
        </section>

        {/* SUPPLIER LEDGER */}
        <section className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Supplier Ledger</h3>
            <div className="flex gap-2 items-center">
              <select
                value={supplierLedgerId}
                onChange={(e) => setSupplierLedgerId(e.target.value)}
                className="border px-2 py-1 text-xs"
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone})
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
