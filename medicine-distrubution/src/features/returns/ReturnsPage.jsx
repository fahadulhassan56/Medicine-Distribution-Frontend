import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';

const ReturnsPage = () => {
  const [salesReturn, setSalesReturn] = useState({
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
  });

  const [purchaseReturn, setPurchaseReturn] = useState({
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
  });

  const [salesReturnsList, setSalesReturnsList] = useState([]);
  const [purchaseReturnsList, setPurchaseReturnsList] = useState([]);

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
        [name]: ['product_id', 'batch_id', 'quantity'].includes(name)
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
        [name]: ['product_id', 'batch_id', 'quantity'].includes(name)
          ? value === '' ? '' : Number(value)
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
      await loadSalesReturns();
    } catch (err) {
      console.error(err);
      alert('Failed to save sales return');
    }
  };

  const submitPurchaseReturn = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/returns/purchase', purchaseReturn);
      alert('Purchase return saved');
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
      setSalesReturnsList(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPurchaseReturns = async () => {
    try {
      const res = await axiosClient.get('/returns/purchase');
      setPurchaseReturnsList(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSalesReturns();
    loadPurchaseReturns();
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
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Sales ID</label>
                <input
                  name="sales_id"
                  type="number"
                  value={salesReturn.sales_id}
                  onChange={handleSRChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Customer ID</label>
                <input
                  name="customer_id"
                  type="number"
                  value={salesReturn.customer_id}
                  onChange={handleSRChange}
                  required
                  className="w-full"
                />
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
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Purchase ID</label>
                <input
                  name="purchase_id"
                  type="number"
                  value={purchaseReturn.purchase_id}
                  onChange={handlePRChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Supplier ID</label>
                <input
                  name="supplier_id"
                  type="number"
                  value={purchaseReturn.supplier_id}
                  onChange={handlePRChange}
                  required
                  className="w-full"
                />
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
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <header className="mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Sales Returns</h3>
          </header>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Sales ID</th>
                  <th className="px-3 py-2 text-left">Customer</th>
                  <th className="px-3 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {salesReturnsList.length > 0 ? (
                  salesReturnsList.map((sr) => (
                    <tr key={sr.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2">{sr.id}</td>
                      <td className="px-3 py-2">{sr.sales_id}</td>
                      <td className="px-3 py-2">{sr.customer_id}</td>
                      <td className="px-3 py-2">{sr.notes || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-center text-slate-500">
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
          <header className="mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Purchase Returns</h3>
          </header>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm bg-white border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Purchase ID</th>
                  <th className="px-3 py-2 text-left">Supplier</th>
                  <th className="px-3 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {purchaseReturnsList.length > 0 ? (
                  purchaseReturnsList.map((pr) => (
                    <tr key={pr.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2">{pr.id}</td>
                      <td className="px-3 py-2">{pr.purchase_id}</td>
                      <td className="px-3 py-2">{pr.supplier_id}</td>
                      <td className="px-3 py-2">{pr.notes || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-center text-slate-500">
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
