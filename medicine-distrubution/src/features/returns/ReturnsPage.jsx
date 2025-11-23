import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';

const emptySalesItem = {
  product_id: '',
  sales_item_id: '',
  batch_id: '',
  batch_no: '',
  expiry_date: '',
  quantity: '',
  reason: ''
};

const emptyPurchaseItem = {
  product_id: '',
  purchase_item_id: '',
  batch_id: '',
  batch_no: '',
  expiry_date: '',
  quantity: '',
  reason: ''
};

const ReturnsPage = () => {
  const [salesReturn, setSalesReturn] = useState({
    sales_id: '',
    customer_id: '',
    items: [emptySalesItem],
    notes: ''
  });

  const [purchaseReturn, setPurchaseReturn] = useState({
    purchase_id: '',
    supplier_id: '',
    items: [emptyPurchaseItem],
    notes: ''
  });

  const [salesReturnsList, setSalesReturnsList] = useState([]);
  const [purchaseReturnsList, setPurchaseReturnsList] = useState([]);

  // modal states
  const [viewSalesReturn, setViewSalesReturn] = useState(null);
  const [viewPurchaseReturn, setViewPurchaseReturn] = useState(null);

  // dropdown options
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [salesOptions, setSalesOptions] = useState([]);
  const [purchaseOptions, setPurchaseOptions] = useState([]);

  /* --------------------
     HELPERS
  -------------------- */
  const findCustomerName = (id) =>
    customers.find((c) => c.id === id)?.name || null;

  const findSupplierName = (id) =>
    suppliers.find((s) => s.id === id)?.name || null;

  const findProductName = (id) => {
    const p = products.find((x) => x.id === id);
    return p?.product_name || p?.name || null;
  };

  /* --------------------
     INPUT HANDLERS
  -------------------- */
  const handleSRChange = (e) => {
    const { name, value } = e.target;
    setSalesReturn((r) => ({
      ...r,
      [name]: ['sales_id', 'customer_id'].includes(name)
        ? value === '' ? '' : Number(value)
        : value
    }));
  };

  const handlePRChange = (e) => {
    const { name, value } = e.target;
    setPurchaseReturn((r) => ({
      ...r,
      [name]: ['purchase_id', 'supplier_id'].includes(name)
        ? value === '' ? '' : Number(value)
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
        [name]: ['product_id', 'sales_item_id', 'batch_id', 'quantity'].includes(name)
          ? value === '' ? '' : Number(value)
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
        [name]: ['product_id', 'purchase_item_id', 'batch_id', 'quantity'].includes(name)
          ? value === '' ? '' : Number(value)
          : value
      };
      return { ...r, items };
    });
  };

  const addSalesItem = () => {
    setSalesReturn((r) => ({
      ...r,
      items: [...r.items, { ...emptySalesItem }]
    }));
  };

  const removeSalesItem = (idx) => {
    setSalesReturn((r) => ({
      ...r,
      items: r.items.filter((_, i) => i !== idx)
    }));
  };

  const addPurchaseItem = () => {
    setPurchaseReturn((r) => ({
      ...r,
      items: [...r.items, { ...emptyPurchaseItem }]
    }));
  };

  const removePurchaseItem = (idx) => {
    setPurchaseReturn((r) => ({
      ...r,
      items: r.items.filter((_, i) => i !== idx)
    }));
  };

  /* --------------------
     SUBMIT HANDLERS
  -------------------- */
  const submitSalesReturn = async (e) => {
    e.preventDefault();
    try {
      // Clean items: only those with product_id & positive quantity
      const cleanedItems = salesReturn.items
        .filter((it) => it.product_id && it.quantity)
        .map((it) => ({
          product_id: Number(it.product_id),
          sales_item_id: it.sales_item_id ? Number(it.sales_item_id) : undefined,
          batch_id: it.batch_id ? Number(it.batch_id) : undefined,
          batch_no: it.batch_no || undefined,
          expiry_date: it.expiry_date || undefined,
          quantity: Number(it.quantity),
          reason: it.reason || undefined
        }));

      if (cleanedItems.length === 0) {
        alert('Please add at least one valid sales return item.');
        return;
      }

      const payload = {
        sales_id: salesReturn.sales_id ? Number(salesReturn.sales_id) : undefined,
        customer_id: salesReturn.customer_id ? Number(salesReturn.customer_id) : undefined,
        notes: salesReturn.notes || undefined,
        items: cleanedItems
      };

      await axiosClient.post('/returns/sales', payload);
      alert('Sales return saved');

      setSalesReturn({
        sales_id: '',
        customer_id: '',
        items: [emptySalesItem],
        notes: ''
      });

      await loadSalesReturns();
    } catch (err) {
      console.error(err);
      alert('Failed to save sales return');
    }
  };

  const submitPurchaseReturn = async (e) => {
    e.preventDefault();
    try {
      const cleanedItems = purchaseReturn.items
        .filter((it) => it.product_id && it.quantity)
        .map((it) => ({
          product_id: Number(it.product_id),
          purchase_item_id: it.purchase_item_id ? Number(it.purchase_item_id) : undefined,
          batch_id: it.batch_id ? Number(it.batch_id) : undefined,
          batch_no: it.batch_no || undefined,
          expiry_date: it.expiry_date || undefined,
          quantity: Number(it.quantity),
          reason: it.reason || undefined
        }));

      if (cleanedItems.length === 0) {
        alert('Please add at least one valid purchase return item.');
        return;
      }

      const payload = {
        purchase_id: purchaseReturn.purchase_id
          ? Number(purchaseReturn.purchase_id)
          : undefined,
        supplier_id: purchaseReturn.supplier_id
          ? Number(purchaseReturn.supplier_id)
          : undefined,
        notes: purchaseReturn.notes || undefined,
        items: cleanedItems
      };

      await axiosClient.post('/returns/purchase', payload);
      alert('Purchase return saved');

      setPurchaseReturn({
        purchase_id: '',
        supplier_id: '',
        items: [emptyPurchaseItem],
        notes: ''
      });

      await loadPurchaseReturns();
    } catch (err) {
      console.error(err);
      alert('Failed to save purchase return');
    }
  };

  /* --------------------
     LOADERS
  -------------------- */
  const loadSalesReturns = async () => {
    try {
      const res = await axiosClient.get('/returns/sales');
      setSalesReturnsList(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPurchaseReturns = async () => {
    try {
      const res = await axiosClient.get('/returns/purchase');
      setPurchaseReturnsList(res.data?.data || []);
    } catch (err) {
      console.error(err);
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
    }
  };

  const loadProducts = async () => {
    try {
      const res = await axiosClient.get('/products', {
        params: { page: 1, limit: 1000 }
      });
      const api = res.data?.data;
      const list = Array.isArray(api) ? api : api?.products || [];
      setProducts(list);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSalesOptions = async () => {
    try {
      const res = await axiosClient.get('/sales', {
        params: { page: 1, limit: 1000 }
      });
      const api = res.data?.data;
      const list = Array.isArray(api) ? api : api?.sales || api?.rows || [];
      setSalesOptions(list);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPurchaseOptions = async () => {
    try {
      const res = await axiosClient.get('/purchases', {
        params: { page: 1, limit: 1000 }
      });
      const api = res.data?.data;
      const list = Array.isArray(api) ? api : api?.purchases || api?.rows || [];
      setPurchaseOptions(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSalesReturns();
    loadPurchaseReturns();
    loadCustomers();
    loadSuppliers();
    loadProducts();
    loadSalesOptions();
    loadPurchaseOptions();
  }, []);

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
              {/* SALES DROPDOWN */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Sale (optional)
                </label>
                <select
                  name="sales_id"
                  value={salesReturn.sales_id}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numeric = value === '' ? '' : Number(value);
                    setSalesReturn((r) => {
                      const updated = { ...r, sales_id: numeric };
                      if (numeric) {
                        const s = salesOptions.find((x) => x.id === numeric);
                        if (s?.customer_id) {
                          updated.customer_id = s.customer_id;
                        }
                      }
                      return updated;
                    });
                  }}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                >
                  <option value="">Select sale</option>
                  {salesOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {`#${s.id} • ${s.invoice_date || ''} • ${
                        s.customer?.name ||
                        findCustomerName(s.customer_id) ||
                        `Customer #${s.customer_id}`
                      }`}
                    </option>
                  ))}
                </select>
              </div>

              {/* CUSTOMER DROPDOWN */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Customer (optional)
                </label>
                <select
                  name="customer_id"
                  value={salesReturn.customer_id}
                  onChange={handleSRChange}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                >
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || `Customer #${c.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ITEMS */}
            <section className="space-y-2">
              <header className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Items
                </h4>
                <button
                  type="button"
                  onClick={addSalesItem}
                  className="text-xs text-blue-600 underline"
                >
                  Add Item
                </button>
              </header>

              {salesReturn.items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-6 gap-2 border border-slate-100 rounded-lg p-2"
                >
                  {/* PRODUCT DROPDOWN */}
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Product
                    </label>
                    <select
                      name="product_id"
                      value={item.product_id}
                      onChange={(e) => handleSRItemChange(idx, e)}
                      className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                      required
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.product_name || p.name || `Product #${p.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Sales Item ID (optional)
                    </label>
                    <input
                      name="sales_item_id"
                      type="number"
                      value={item.sales_item_id}
                      onChange={(e) => handleSRItemChange(idx, e)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Batch ID (optional)
                    </label>
                    <input
                      name="batch_id"
                      type="number"
                      value={item.batch_id}
                      onChange={(e) => handleSRItemChange(idx, e)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Batch No (optional)
                    </label>
                    <input
                      name="batch_no"
                      value={item.batch_no}
                      onChange={(e) => handleSRItemChange(idx, e)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Expiry Date (optional)
                    </label>
                    <input
                      name="expiry_date"
                      type="date"
                      value={item.expiry_date}
                      onChange={(e) => handleSRItemChange(idx, e)}
                      className="w-full"
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

                  <div className="md:col-span-6">
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Reason (optional)
                    </label>
                    <input
                      name="reason"
                      value={item.reason}
                      onChange={(e) => handleSRItemChange(idx, e)}
                      className="w-full"
                    />
                  </div>

                  {salesReturn.items.length > 1 && (
                    <div className="md:col-span-6 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeSalesItem(idx)}
                        className="text-[11px] text-red-600 underline"
                      >
                        Remove Item
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </section>

            {/* NOTES */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Notes</label>
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
              {/* PURCHASE DROPDOWN */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Purchase (optional)
                </label>
                <select
                  name="purchase_id"
                  value={purchaseReturn.purchase_id}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numeric = value === '' ? '' : Number(value);
                    setPurchaseReturn((r) => {
                      const updated = { ...r, purchase_id: numeric };
                      if (numeric) {
                        const p = purchaseOptions.find((x) => x.id === numeric);
                        if (p?.supplier_id) {
                          updated.supplier_id = p.supplier_id;
                        }
                      }
                      return updated;
                    });
                  }}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                >
                  <option value="">Select purchase</option>
                  {purchaseOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {`#${p.id} • ${p.invoice_date || ''} • ${
                        p.supplier?.name ||
                        findSupplierName(p.supplier_id) ||
                        `Supplier #${p.supplier_id}`
                      }`}
                    </option>
                  ))}
                </select>
              </div>

              {/* SUPPLIER DROPDOWN */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Supplier (optional)
                </label>
                <select
                  name="supplier_id"
                  value={purchaseReturn.supplier_id}
                  onChange={handlePRChange}
                  className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name || `Supplier #${s.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ITEMS */}
            <section className="space-y-2">
              <header className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Items
                </h4>
                <button
                  type="button"
                  onClick={addPurchaseItem}
                  className="text-xs text-blue-600 underline"
                >
                  Add Item
                </button>
              </header>

              {purchaseReturn.items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-6 gap-2 border border-slate-100 rounded-lg p-2"
                >
                  {/* PRODUCT DROPDOWN */}
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Product
                    </label>
                    <select
                      name="product_id"
                      value={item.product_id}
                      onChange={(e) => handlePRItemChange(idx, e)}
                      className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                      required
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.product_name || p.name || `Product #${p.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Purchase Item ID (optional)
                    </label>
                    <input
                      name="purchase_item_id"
                      type="number"
                      value={item.purchase_item_id}
                      onChange={(e) => handlePRItemChange(idx, e)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Batch ID (optional)
                    </label>
                    <input
                      name="batch_id"
                      type="number"
                      value={item.batch_id}
                      onChange={(e) => handlePRItemChange(idx, e)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Batch No (optional)
                    </label>
                    <input
                      name="batch_no"
                      value={item.batch_no}
                      onChange={(e) => handlePRItemChange(idx, e)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Expiry Date (optional)
                    </label>
                    <input
                      name="expiry_date"
                      type="date"
                      value={item.expiry_date}
                      onChange={(e) => handlePRItemChange(idx, e)}
                      className="w-full"
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

                  <div className="md:col-span-6">
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Reason (optional)
                    </label>
                    <input
                      name="reason"
                      value={item.reason}
                      onChange={(e) => handlePRItemChange(idx, e)}
                      className="w-full"
                    />
                  </div>

                  {purchaseReturn.items.length > 1 && (
                    <div className="md:col-span-6 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removePurchaseItem(idx)}
                        className="text-[11px] text-red-600 underline"
                      >
                        Remove Item
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </section>

            {/* NOTES */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Notes</label>
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
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-2">
          <header className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Sales Returns</h3>
          </header>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Sales</th>
                  <th className="px-3 py-2 text-left">Customer</th>
                  <th className="px-3 py-2 text-left">Items</th>
                  <th className="px-3 py-2 text-left">Notes</th>
                  <th className="px-3 py-2 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {salesReturnsList.length > 0 ? (
                  salesReturnsList.map((sr) => {
                    const customerName =
                      sr.customer?.name || findCustomerName(sr.customer_id);
                    return (
                      <tr key={sr.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2">{sr.id}</td>
                        <td className="px-3 py-2">
                          {sr.sales_id ? `#${sr.sales_id}` : '—'}
                        </td>
                        <td className="px-3 py-2">
                          {customerName ||
                            (sr.customer_id ? `Customer #${sr.customer_id}` : '—')}
                        </td>
                        <td className="px-3 py-2">
                          {Array.isArray(sr.items) ? sr.items.length : 0}
                        </td>
                        <td className="px-3 py-2">{sr.notes || '—'}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => setViewSalesReturn(sr)}
                            className="text-xs text-blue-600 underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-3 text-center text-slate-500">
                      No sales returns found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* PURCHASE RETURNS LIST */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-2">
          <header className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Purchase Returns</h3>
          </header>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Purchase</th>
                  <th className="px-3 py-2 text-left">Supplier</th>
                  <th className="px-3 py-2 text-left">Items</th>
                  <th className="px-3 py-2 text-left">Notes</th>
                  <th className="px-3 py-2 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {purchaseReturnsList.length > 0 ? (
                  purchaseReturnsList.map((pr) => {
                    const supplierName =
                      pr.supplier?.name || findSupplierName(pr.supplier_id);
                    return (
                      <tr key={pr.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2">{pr.id}</td>
                        <td className="px-3 py-2">
                          {pr.purchase_id ? `#${pr.purchase_id}` : '—'}
                        </td>
                        <td className="px-3 py-2">
                          {supplierName ||
                            (pr.supplier_id ? `Supplier #${pr.supplier_id}` : '—')}
                        </td>
                        <td className="px-3 py-2">
                          {Array.isArray(pr.items) ? pr.items.length : 0}
                        </td>
                        <td className="px-3 py-2">{pr.notes || '—'}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => setViewPurchaseReturn(pr)}
                            className="text-xs text-blue-600 underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-3 text-center text-slate-500">
                      No purchase returns found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {/* ---------------------- MODALS ---------------------- */}

      {/* Sales Return Detail Modal */}
      {viewSalesReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto p-4 space-y-4">
            <header className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Sales Return #{viewSalesReturn.id}
                </h3>
                <p className="text-xs text-slate-600">
                  Sales:{' '}
                  {viewSalesReturn.sales_id ? `#${viewSalesReturn.sales_id}` : '—'}{' '}
                  • Customer:{' '}
                  {viewSalesReturn.customer?.name ||
                    findCustomerName(viewSalesReturn.customer_id) ||
                    (viewSalesReturn.customer_id
                      ? `Customer #${viewSalesReturn.customer_id}`
                      : '—')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewSalesReturn(null)}
                className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
              >
                Close
              </button>
            </header>

            {/* Notes */}
            <section className="text-xs">
              <p className="font-semibold text-slate-700 mb-1">Notes</p>
              <p className="text-slate-600">
                {viewSalesReturn.notes || '—'}
              </p>
            </section>

            {/* Items */}
            <section>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">
                Items
              </h4>
              <div className="overflow-x-auto text-xs">
                <table className="min-w-full border rounded">
                  <thead className="bg-slate-100 text-[11px] uppercase text-slate-600">
                    <tr>
                      <th className="px-2 py-1 text-left">Product</th>
                      <th className="px-2 py-1 text-left">Sales Item</th>
                      <th className="px-2 py-1 text-left">Batch ID</th>
                      <th className="px-2 py-1 text-left">Batch No</th>
                      <th className="px-2 py-1 text-left">Expiry</th>
                      <th className="px-2 py-1 text-left">Qty</th>
                      <th className="px-2 py-1 text-left">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {Array.isArray(viewSalesReturn.items) &&
                    viewSalesReturn.items.length > 0 ? (
                      viewSalesReturn.items.map((it) => (
                        <tr key={it.id}>
                          <td className="px-2 py-1">
                            {findProductName(it.product_id) || it.product_id}
                          </td>
                          <td className="px-2 py-1">
                            {it.sales_item_id || '—'}
                          </td>
                          <td className="px-2 py-1">
                            {it.batch_id || '—'}
                          </td>
                          <td className="px-2 py-1">
                            {it.batch_no || '—'}
                          </td>
                          <td className="px-2 py-1">
                            {it.expiry_date || '—'}
                          </td>
                          <td className="px-2 py-1">
                            {it.quantity}
                          </td>
                          <td className="px-2 py-1">
                            {it.reason || '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-2 py-3 text-center text-slate-500"
                        >
                          No items.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Purchase Return Detail Modal */}
      {viewPurchaseReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto p-4 space-y-4">
            <header className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Purchase Return #{viewPurchaseReturn.id}
                </h3>
                <p className="text-xs text-slate-600">
                  Purchase:{' '}
                  {viewPurchaseReturn.purchase_id
                    ? `#${viewPurchaseReturn.purchase_id}`
                    : '—'}{' '}
                  • Supplier:{' '}
                  {viewPurchaseReturn.supplier?.name ||
                    findSupplierName(viewPurchaseReturn.supplier_id) ||
                    (viewPurchaseReturn.supplier_id
                      ? `Supplier #${viewPurchaseReturn.supplier_id}`
                      : '—')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewPurchaseReturn(null)}
                className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-100"
              >
                Close
              </button>
            </header>

            {/* Notes */}
            <section className="text-xs">
              <p className="font-semibold text-slate-700 mb-1">Notes</p>
              <p className="text-slate-600">
                {viewPurchaseReturn.notes || '—'}
              </p>
            </section>

            {/* Items */}
            <section>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">
                Items
              </h4>
              <div className="overflow-x-auto text-xs">
                <table className="min-w-full border rounded">
                  <thead className="bg-slate-100 text-[11px] uppercase text-slate-600">
                    <tr>
                      <th className="px-2 py-1 text-left">Product</th>
                      <th className="px-2 py-1 text-left">Purchase Item</th>
                      <th className="px-2 py-1 text-left">Batch ID</th>
                      <th className="px-2 py-1 text-left">Batch No</th>
                      <th className="px-2 py-1 text-left">Expiry</th>
                      <th className="px-2 py-1 text-left">Qty</th>
                      <th className="px-2 py-1 text-left">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {Array.isArray(viewPurchaseReturn.items) &&
                    viewPurchaseReturn.items.length > 0 ? (
                      viewPurchaseReturn.items.map((it) => (
                        <tr key={it.id}>
                          <td className="px-2 py-1">
                            {findProductName(it.product_id) || it.product_id}
                          </td>
                          <td className="px-2 py-1">
                            {it.purchase_item_id || '—'}
                          </td>
                          <td className="px-2 py-1">
                            {it.batch_id || '—'}
                          </td>
                          <td className="px-2 py-1">
                            {it.batch_no || '—'}
                          </td>
                          <td className="px-2 py-1">
                            {it.expiry_date || '—'}
                          </td>
                          <td className="px-2 py-1">
                            {it.quantity}
                          </td>
                          <td className="px-2 py-1">
                            {it.reason || '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-2 py-3 text-center text-slate-500"
                        >
                          No items.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      )}
    </main>
  );
};

export default ReturnsPage;
