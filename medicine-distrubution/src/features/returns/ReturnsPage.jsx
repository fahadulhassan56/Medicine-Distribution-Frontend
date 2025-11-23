import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';
import { usePopup } from '../../components/ui/PopupContext.jsx';

const defaultSalesReturn = {
  sales_id: '',
  customer_id: '',
  items: [
    {
      product_id: '',
      batch_id: '',
      quantity: '',
      reason: ''
    }
  ],
  notes: ''
};

const defaultPurchaseReturn = {
  purchase_id: '',
  supplier_id: '',
  items: [
    {
      product_id: '',
      batch_id: '',
      quantity: '',
      reason: ''
    }
  ],
  notes: ''
};

const ReturnsPage = () => {
  const { showPopup } = usePopup();
  const [salesReturn, setSalesReturn] = useState(defaultSalesReturn);
  const [purchaseReturn, setPurchaseReturn] = useState(defaultPurchaseReturn);

  const [salesReturnsList, setSalesReturnsList] = useState([]);
  const [purchaseReturnsList, setPurchaseReturnsList] = useState([]);

  // Lookups
  const [salesList, setSalesList] = useState([]);
  const [purchaseList, setPurchaseList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Pagination
  const [srPage, setSrPage] = useState(1);
  const [prPage, setPrPage] = useState(1);
  const pageSize = 10;

  /* --------------------
     INPUT HANDLERS
  -------------------- */
  const handleSRChange = (e) => {
    const { name, value } = e.target;
    setSalesReturn((r) => ({
      ...r,
      [name]: ['sales_id', 'customer_id'].includes(name)
        ? value === ''
          ? ''
          : Number(value)
        : value
    }));
  };

  const handlePRChange = (e) => {
    const { name, value } = e.target;
    setPurchaseReturn((r) => ({
      ...r,
      [name]: ['purchase_id', 'supplier_id'].includes(name)
        ? value === ''
          ? ''
          : Number(value)
        : value
    }));
  };

  /* --------------------
     ITEM HANDLERS
  -------------------- */
  const handleSRItemChange = (idx, e) => {
    const { name, value } = e.target;
    setSalesReturn((r) => {
      const items = [...r.items];
      items[idx] = {
        ...items[idx],
        [name]: ['product_id', 'batch_id', 'quantity'].includes(name)
          ? value === ''
            ? ''
            : Number(value)
          : value
      };
      return { ...r, items };
    });
  };

  const handlePRItemChange = (idx, e) => {
    const { name, value } = e.target;
    setPurchaseReturn((r) => {
      const items = [...r.items];
      items[idx] = {
        ...items[idx],
        [name]: ['product_id', 'batch_id', 'quantity'].includes(name)
          ? value === ''
            ? ''
            : Number(value)
          : value
      };
      return { ...r, items };
    });
  };

  /* --------------------
     SUBMIT HANDLERS
  -------------------- */
  const submitSalesReturn = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/returns/sales', salesReturn);
      alert('Sales return saved');
      setSalesReturn(defaultSalesReturn);
      await loadSalesReturns();
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Sales Return Failed',
        message: 'Failed to save sales return. Please try again.'
      });
    }
  };

  const submitPurchaseReturn = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/returns/purchase', purchaseReturn);
      alert('Purchase return saved');
      setPurchaseReturn(defaultPurchaseReturn);
      await loadPurchaseReturns();
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Purchase Return Failed',
        message: 'Failed to save purchase return. Please try again.'
      });
    }
  };

  /* --------------------
     LOADERS (LISTS)
  -------------------- */
  const loadSalesReturns = async () => {
    try {
      const res = await axiosClient.get('/returns/sales');
      const list = res.data?.data || res.data || [];
      setSalesReturnsList(Array.isArray(list) ? list : []);
      setSrPage(1);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPurchaseReturns = async () => {
    try {
      const res = await axiosClient.get('/returns/purchase');
      const list = res.data?.data || res.data || [];
      setPurchaseReturnsList(Array.isArray(list) ? list : []);
      setPrPage(1);
    } catch (err) {
      console.error(err);
    }
  };

  /* --------------------
     LOADERS (LOOKUPS)
  -------------------- */
  const loadSales = async () => {
    try {
      const res = await axiosClient.get('/sales');
      setSalesList(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPurchases = async () => {
    try {
      const res = await axiosClient.get('/purchases');
      setPurchaseList(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await axiosClient.get('/customers');
      setCustomers(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await axiosClient.get('/suppliers');
      setSuppliers(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSalesReturns();
    loadPurchaseReturns();
    loadSales();
    loadPurchases();
    loadCustomers();
    loadSuppliers();
  }, []);

  /* --------------------
     HELPERS
  -------------------- */

  const getCustomerName = (id) =>
    customers.find((c) => c.id === id)?.name || (id ? `Customer #${id}` : '—');

  const getSupplierName = (id) =>
    suppliers.find((s) => s.id === id)?.name || (id ? `Supplier #${id}` : '—');

  const getSaleLabel = (s) => {
    const base = `Sale #${s.id}`;
    if (s.customer?.name) return `${base} - ${s.customer.name}`;
    if (s.invoice_date) return `${base} (${s.invoice_date})`;
    return base;
  };

  const getPurchaseLabel = (p) => {
    const base = `Purchase #${p.id}`;
    if (p.supplier?.name) return `${base} - ${p.supplier.name}`;
    if (p.invoice_date) return `${base} (${p.invoice_date})`;
    return base;
  };

  /* --------------------
     RENDER
  -------------------- */

  return (
    <main className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Returns</h2>
        <p className="text-sm text-slate-600">
          Handle sales returns from customers and purchase returns to suppliers.
        </p>
      </header>

      {/* RETURN FORMS */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* ---------------------- SALES RETURN FORM ---------------------- */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
          <header>
            <h3 className="text-sm font-semibold text-slate-800">Sales Return</h3>
          </header>

          <form className="space-y-3" onSubmit={submitSalesReturn}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Sales ID dropdown */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Sales
                </label>
                <select
                  name="sales_id"
                  value={
                    salesReturn.sales_id === '' ? '' : String(salesReturn.sales_id)
                  }
                  onChange={handleSRChange}
                  required
                  className="w-full"
                >
                  <option value="">Select sale</option>
                  {salesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {getSaleLabel(s)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer dropdown */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Customer
                </label>
                <select
                  name="customer_id"
                  value={
                    salesReturn.customer_id === ''
                      ? ''
                      : String(salesReturn.customer_id)
                  }
                  onChange={handleSRChange}
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
            </div>

            {/* ITEMS */}
            <section className="space-y-2">
              <header>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Items
                </h4>
              </header>
              {salesReturn.items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2 border border-slate-100 rounded-lg p-2"
                >
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Product ID
                    </label>
                    <input
                      name="product_id"
                      type="number"
                      value={item.product_id}
                      onChange={(e) => handleSRItemChange(idx, e)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Batch ID
                    </label>
                    <input
                      name="batch_id"
                      type="number"
                      value={item.batch_id}
                      onChange={(e) => handleSRItemChange(idx, e)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Quantity
                    </label>
                    <input
                      name="quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleSRItemChange(idx, e)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Reason
                    </label>
                    <input
                      name="reason"
                      value={item.reason}
                      onChange={(e) => handleSRItemChange(idx, e)}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </section>

            {/* NOTES */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={salesReturn.notes}
                onChange={handleSRChange}
                rows={2}
                className="w-full"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 text-xs rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Save Sales Return
              </button>
            </div>
          </form>
        </section>

        {/* ---------------------- PURCHASE RETURN FORM ---------------------- */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
          <header>
            <h3 className="text-sm font-semibold text-slate-800">Purchase Return</h3>
          </header>

          <form className="space-y-3" onSubmit={submitPurchaseReturn}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Purchase ID dropdown */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Purchase
                </label>
                <select
                  name="purchase_id"
                  value={
                    purchaseReturn.purchase_id === ''
                      ? ''
                      : String(purchaseReturn.purchase_id)
                  }
                  onChange={handlePRChange}
                  required
                  className="w-full"
                >
                  <option value="">Select purchase</option>
                  {purchaseList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {getPurchaseLabel(p)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier dropdown */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Supplier
                </label>
                <select
                  name="supplier_id"
                  value={
                    purchaseReturn.supplier_id === ''
                      ? ''
                      : String(purchaseReturn.supplier_id)
                  }
                  onChange={handlePRChange}
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
            </div>

            {/* ITEMS */}
            <section className="space-y-2">
              <header>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Items
                </h4>
              </header>
              {purchaseReturn.items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-4 gap-2 border border-slate-100 rounded-lg p-2"
                >
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Product ID
                    </label>
                    <input
                      name="product_id"
                      type="number"
                      value={item.product_id}
                      onChange={(e) => handlePRItemChange(idx, e)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Batch ID
                    </label>
                    <input
                      name="batch_id"
                      type="number"
                      value={item.batch_id}
                      onChange={(e) => handlePRItemChange(idx, e)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Quantity
                    </label>
                    <input
                      name="quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handlePRItemChange(idx, e)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Reason
                    </label>
                    <input
                      name="reason"
                      value={item.reason}
                      onChange={(e) => handlePRItemChange(idx, e)}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </section>

            {/* NOTES */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={purchaseReturn.notes}
                onChange={handlePRChange}
                rows={2}
                className="w-full"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 text-xs rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Save Purchase Return
              </button>
            </div>
          </form>
        </section>
      </section>

      {/* ---------------------- LISTS ---------------------- */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* SALES RETURNS LIST */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Sales Returns</h3>
          </header>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Sales</th>
                  <th className="px-3 py-2 text-left">Customer</th>
                  <th className="px-3 py-2 text-left">Created At</th>
                  <th className="px-3 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {salesReturnsList.length > 0 ? (
                  (() => {
                    const totalItems = salesReturnsList.length;
                    const totalPages = Math.max(
                      1,
                      Math.ceil(totalItems / pageSize)
                    );
                    const safePage = Math.min(srPage, totalPages);
                    const startIndex = (safePage - 1) * pageSize;
                    const endIndex = startIndex + pageSize;
                    const pageItems = salesReturnsList.slice(
                      startIndex,
                      endIndex
                    );

                    return (
                      <>
                        {pageItems.map((sr) => (
                          <tr key={sr.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2">{sr.id}</td>
                            <td className="px-3 py-2">
                              {sr.sales
                                ? getSaleLabel(sr.sales)
                                : `Sale #${sr.sales_id}`}
                            </td>
                            <td className="px-3 py-2">
                              {sr.customer
                                ? sr.customer.name
                                : getCustomerName(sr.customer_id)}
                            </td>
                            <td className="px-3 py-2">
                              {sr.createdAt
                                ? new Date(sr.createdAt).toLocaleString()
                                : '—'}
                            </td>
                            <td className="px-3 py-2">{sr.notes || '—'}</td>
                          </tr>
                        ))}

                        <tr>
                          <td
                            colSpan={5}
                            className="px-3 py-2 text-[11px] text-slate-600"
                          >
                            <div className="flex items-center justify-between">
                              <span>
                                Showing{' '}
                                {totalItems === 0 ? 0 : startIndex + 1}–
                                {Math.min(endIndex, totalItems)} of {totalItems}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSrPage((prev) => Math.max(1, prev - 1))
                                  }
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
                                  onClick={() =>
                                    setSrPage((prev) =>
                                      Math.min(totalPages, prev + 1)
                                    )
                                  }
                                  disabled={safePage === totalPages}
                                  className="px-3 py-1 rounded-md border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </>
                    );
                  })()
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-3 text-center text-slate-500">
                      No sales returns found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* PURCHASE RETURNS LIST */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Purchase Returns</h3>
          </header>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Purchase</th>
                  <th className="px-3 py-2 text-left">Supplier</th>
                  <th className="px-3 py-2 text-left">Created At</th>
                  <th className="px-3 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {purchaseReturnsList.length > 0 ? (
                  (() => {
                    const totalItems = purchaseReturnsList.length;
                    const totalPages = Math.max(
                      1,
                      Math.ceil(totalItems / pageSize)
                    );
                    const safePage = Math.min(prPage, totalPages);
                    const startIndex = (safePage - 1) * pageSize;
                    const endIndex = startIndex + pageSize;
                    const pageItems = purchaseReturnsList.slice(
                      startIndex,
                      endIndex
                    );

                    return (
                      <>
                        {pageItems.map((pr) => (
                          <tr key={pr.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2">{pr.id}</td>
                            <td className="px-3 py-2">
                              {pr.purchase
                                ? getPurchaseLabel(pr.purchase)
                                : `Purchase #${pr.purchase_id}`}
                            </td>
                            <td className="px-3 py-2">
                              {pr.supplier
                                ? pr.supplier.name
                                : getSupplierName(pr.supplier_id)}
                            </td>
                            <td className="px-3 py-2">
                              {pr.createdAt
                                ? new Date(pr.createdAt).toLocaleString()
                                : '—'}
                            </td>
                            <td className="px-3 py-2">{pr.notes || '—'}</td>
                          </tr>
                        ))}

                        <tr>
                          <td
                            colSpan={5}
                            className="px-3 py-2 text-[11px] text-slate-600"
                          >
                            <div className="flex items-center justify-between">
                              <span>
                                Showing{' '}
                                {totalItems === 0 ? 0 : startIndex + 1}–
                                {Math.min(endIndex, totalItems)} of {totalItems}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPrPage((prev) => Math.max(1, prev - 1))
                                  }
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
                                  onClick={() =>
                                    setPrPage((prev) =>
                                      Math.min(totalPages, prev + 1)
                                    )
                                  }
                                  disabled={safePage === totalPages}
                                  className="px-3 py-1 rounded-md border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </>
                    );
                  })()
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-3 text-center text-slate-500">
                      No purchase returns found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
};

export default ReturnsPage;
