import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';
import DataTable from '../../components/common/DataTable.jsx';

const defaultPurchase = {
  supplier_id: '',
  invoice_no: '',
  invoice_date: '',
  total_amount: '',
  items: [
    {
      product_id: '',
      batch_no: '',
      expiry_date: '',
      quantity: '',
      free_qty: 0,
      cost_price: ''
    }
  ]
};

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [purchase, setPurchase] = useState(defaultPurchase);
  const [selected, setSelected] = useState(null);

  const loadPurchases = async () => {
    try {
      const res = await axiosClient.get('/purchases');
      setPurchases(res.data?.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load purchases');
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const handlePurchaseChange = (e) => {
    const { name, value } = e.target;
    setPurchase((p) => ({
      ...p,
      [name]: ['supplier_id', 'total_amount'].includes(name)
        ? value === ''
          ? ''
          : Number(value)
        : value
    }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    setPurchase((p) => {
      const items = [...p.items];
      items[index] = {
        ...items[index],
        [name]:
          ['quantity', 'free_qty', 'cost_price', 'product_id'].includes(name)
            ? value === ''
              ? ''
              : Number(value)
            : value
      };
      return { ...p, items };
    });
  };

  const addItem = () => {
    setPurchase((p) => ({
      ...p,
      items: [
        ...p.items,
        {
          product_id: '',
          batch_no: '',
          expiry_date: '',
          quantity: '',
          free_qty: 0,
          cost_price: ''
        }
      ]
    }));
  };

  const removeItem = (index) => {
    setPurchase((p) => ({
      ...p,
      items: p.items.filter((_, i) => i !== index)
    }));
  };

  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    try {
      const total =
        purchase.total_amount ||
        purchase.items.reduce(
          (sum, i) =>
            sum + (Number(i.quantity) || 0) * (Number(i.cost_price) || 0),
          0
        );

      const payload = {
        ...purchase,
        total_amount: total
      };

      await axiosClient.post('/purchases', payload);
      setPurchase(defaultPurchase);
      await loadPurchases();
    } catch (err) {
      console.error(err);
      alert('Failed to create purchase');
    }
  };

  const handleSelectPurchase = async (row) => {
    try {
      const res = await axiosClient.get(`/purchases/${row.id}`);
      // backend: { success, message, data: { ...purchase } }
      setSelected(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'invoice_no', label: 'Invoice No' },
    { key: 'invoice_date', label: 'Invoice Date' },
    { key: 'total_amount', label: 'Total Amount' }
  ];

  // normalize selected detail (whether it's wrapper or raw)
  const detail = selected || null;

  return (
    <main className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Purchases (GRN)</h2>
        <p className="text-sm text-slate-600">
          Receive stock from suppliers with batch and expiry information.
        </p>
      </header>

      {/* CREATE PURCHASE */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
        <header>
          <h3 className="text-sm font-semibold text-slate-800">Create Purchase</h3>
        </header>
        <form className="space-y-3" onSubmit={handleCreatePurchase}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Supplier ID
              </label>
              <input
                name="supplier_id"
                type="number"
                value={purchase.supplier_id}
                onChange={handlePurchaseChange}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Invoice No
              </label>
              <input
                name="invoice_no"
                value={purchase.invoice_no}
                onChange={handlePurchaseChange}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Invoice Date
              </label>
              <input
                name="invoice_date"
                type="date"
                value={purchase.invoice_date}
                onChange={handlePurchaseChange}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Total Amount (optional)
              </label>
              <input
                name="total_amount"
                type="number"
                step="0.01"
                value={purchase.total_amount}
                onChange={handlePurchaseChange}
                className="w-full"
              />
            </div>
          </div>

          <section className="space-y-2">
            <header className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Items
              </h4>
              <button
                type="button"
                onClick={addItem}
                className="text-xs text-blue-600 underline"
              >
                Add Item
              </button>
            </header>
            {purchase.items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-6 gap-2 border border-slate-100 rounded-lg p-2"
              >
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Product ID
                  </label>
                  <input
                    name="product_id"
                    type="number"
                    value={item.product_id}
                    onChange={(e) => handleItemChange(idx, e)}
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Batch No
                  </label>
                  <input
                    name="batch_no"
                    value={item.batch_no}
                    onChange={(e) => handleItemChange(idx, e)}
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Expiry Date
                  </label>
                  <input
                    name="expiry_date"
                    type="date"
                    value={item.expiry_date}
                    onChange={(e) => handleItemChange(idx, e)}
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Qty
                  </label>
                  <input
                    name="quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, e)}
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Free Qty
                  </label>
                  <input
                    name="free_qty"
                    type="number"
                    value={item.free_qty}
                    onChange={(e) => handleItemChange(idx, e)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Cost Price
                  </label>
                  <input
                    name="cost_price"
                    type="number"
                    step="0.01"
                    value={item.cost_price}
                    onChange={(e) => handleItemChange(idx, e)}
                    className="w-full"
                    required
                  />
                </div>
                {purchase.items.length > 1 && (
                  <div className="md:col-span-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-[11px] text-red-600 underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-1.5 text-xs rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              Save Purchase
            </button>
          </div>
        </form>
      </section>

      {/* LIST */}
      <section aria-label="Purchases list">
        <DataTable
          columns={columns}
          data={purchases}
          onRowClick={handleSelectPurchase}
        />
      </section>

      {/* MODERN PURCHASE DETAIL CARD */}
      {detail && (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <header className="border-b pb-3">
            <h3 className="text-lg font-semibold text-slate-900">
              Purchase Invoice #{detail.invoice_no}
            </h3>
            <p className="text-sm text-slate-500">
              Supplier:{' '}
              <span className="font-medium">
                {detail.supplier?.name || `ID ${detail.supplier_id}`}
              </span>
            </p>
          </header>

          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs uppercase text-slate-500 font-semibold">
                Invoice No
              </h4>
              <p className="text-sm font-medium">{detail.invoice_no}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs uppercase text-slate-500 font-semibold">
                Invoice Date
              </h4>
              <p className="text-sm font-medium">{detail.invoice_date}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs uppercase text-slate-500 font-semibold">
                Total Amount
              </h4>
              <p className="text-sm font-medium text-green-600">
                Rs. {detail.total_amount}
              </p>
            </div>
          </div>

          {/* SUPPLIER DETAILS */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-700">
              Supplier Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <p className="text-xs text-slate-500 uppercase">Name</p>
                <p className="text-sm font-medium">
                  {detail.supplier?.name || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Phone</p>
                <p className="text-sm font-medium">
                  {detail.supplier?.phone || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Email</p>
                <p className="text-sm font-medium">
                  {detail.supplier?.email || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">GST No</p>
                <p className="text-sm font-medium">
                  {detail.supplier?.gst_no || '—'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-slate-500 uppercase">Address</p>
                <p className="text-sm font-medium">
                  {detail.supplier?.address || '—'}
                </p>
              </div>
            </div>
          </section>

          {/* ITEMS TABLE */}
          <section>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              Purchased Items
            </h4>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm bg-white border border-slate-200 rounded-lg">
                <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-left">Batch</th>
                    <th className="px-3 py-2 text-left">Expiry</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Free</th>
                    <th className="px-3 py-2 text-right">Cost Price</th>
                    <th className="px-3 py-2 text-right">MRP</th>
                    <th className="px-3 py-2 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(detail.items || []).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2">
                        {item.product?.product_name || `Product #${item.product_id}`}
                      </td>
                      <td className="px-3 py-2">{item.batch_no}</td>
                      <td className="px-3 py-2">{item.expiry_date}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{item.free_qty}</td>
                      <td className="px-3 py-2 text-right">
                        Rs. {item.cost_price}
                      </td>
                      <td className="px-3 py-2 text-right">
                        Rs. {item.product?.mrp}
                      </td>
                      <td className="px-3 py-2 text-right">
                        Rs.{' '}
                        {Number(item.quantity || 0) *
                          Number(item.cost_price || 0)}
                      </td>
                    </tr>
                  ))}

                  {(!detail.items || detail.items.length === 0) && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-3 py-4 text-center text-slate-500"
                      >
                        No items for this purchase.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      )}
    </main>
  );
};

export default PurchasesPage;
