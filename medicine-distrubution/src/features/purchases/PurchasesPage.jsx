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

  // Dropdown options
  const [suppliers, setSuppliers] = useState([]);
  const [productOptions, setProductOptions] = useState([]);

  // Pagination for purchases list
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadPurchases = async (page = 1) => {
    try {
      const res = await axiosClient.get('/purchases', {
        params: { page, limit: pagination.limit }
      });

      // {
      //   success: true,
      //   message: "Purchases fetched",
      //   data: { purchases: [...], page, limit, total, totalPages }
      // }
      const api = res.data?.data || {};
      setPurchases(api.purchases || []);
      setPagination({
        page: api.page || 1,
        limit: api.limit || 10,
        total: api.total || 0,
        totalPages: api.totalPages || 1
      });
    } catch (err) {
      console.error(err);
      alert('Failed to load purchases');
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await axiosClient.get('/suppliers', {
        params: { limit: 1000 }
      });
      const raw = res.data?.data;
      const list = Array.isArray(raw) ? raw : raw?.suppliers || [];
      setSuppliers(list);
    } catch (err) {
      console.error(err);
      alert('Failed to load suppliers');
    }
  };

  const loadProductsForDropdown = async () => {
    try {
      const res = await axiosClient.get('/products', {
        params: { page: 1, limit: 1000 }
      });
      const api = res.data?.data;
      const list = api?.products || [];
      setProductOptions(list);
    } catch (err) {
      console.error(err);
      alert('Failed to load products for items');
    }
  };

  useEffect(() => {
    loadPurchases(1);
    loadSuppliers();
    loadProductsForDropdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      await loadPurchases(pagination.page);
    } catch (err) {
      console.error(err);
      alert('Failed to create purchase');
    }
  };

  const openDetailsModal = async (row) => {
    try {
      setDetailLoading(true);
      const res = await axiosClient.get(`/purchases/${row.id}`);
      const detailData = res.data?.data || res.data;
      setSelected(detailData);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert('Failed to load purchase details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    // optional: keep selected or clear it
    // setSelected(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    loadPurchases(newPage);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'invoice_no', label: 'Invoice No' },
    { key: 'invoice_date', label: 'Invoice Date' },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (_, row) => row.supplier?.name || `ID ${row.supplier_id}`
    },
    {
      key: 'items_count',
      label: 'Items',
      render: (_, row) => (row.items ? row.items.length : 0)
    },
    { key: 'total_amount', label: 'Total Amount' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openDetailsModal(row);
          }}
          className="text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-300"
        >
          Details
        </button>
      )
    }
  ];

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
            {/* SUPPLIER DROPDOWN */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Supplier
              </label>
              <select
                name="supplier_id"
                value={purchase.supplier_id}
                onChange={handlePurchaseChange}
                required
                className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.phone ? `(${s.phone})` : ''}
                  </option>
                ))}
              </select>
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

          {/* ITEMS */}
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
                {/* PRODUCT DROPDOWN */}
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Product
                  </label>
                  <select
                    name="product_id"
                    value={item.product_id}
                    onChange={(e) => handleItemChange(idx, e)}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                    required
                  >
                    <option value="">Select product</option>
                    {productOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.product_name} {p.strength ? `(${p.strength})` : ''}
                      </option>
                    ))}
                  </select>
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
      <section aria-label="Purchases list" className="space-y-2">
        <DataTable
          columns={columns}
          data={purchases}
          // No onRowClick; we use explicit Details button
        />

        {/* Pagination controls */}
        <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
          <div>
            Page {pagination.page} of {pagination.totalPages} — Total purchases:{' '}
            {pagination.total}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-2 py-1 border border-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-2 py-1 border border-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* DETAIL MODAL */}
      {showModal && detail && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 relative">
            {/* Close button */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 text-sm"
            >
              ✕
            </button>

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
              <p className="text-xs text-slate-400 mt-1">
                ID: {detail.id} · Created:{' '}
                {detail.createdAt
                  ? new Date(detail.createdAt).toLocaleString()
                  : '—'}{' '}
                · Updated:{' '}
                {detail.updatedAt
                  ? new Date(detail.updatedAt).toLocaleString()
                  : '—'}
              </p>
            </header>

            {detailLoading && (
              <p className="text-sm text-slate-500">Loading details…</p>
            )}

            {!detailLoading && (
              <>
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
                              {item.product?.product_name ||
                                `Product #${item.product_id}`}
                            </td>
                            <td className="px-3 py-2">{item.batch_no}</td>
                            <td className="px-3 py-2">{item.expiry_date}</td>
                            <td className="px-3 py-2 text-right">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {item.free_qty}
                            </td>
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

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-3 py-1.5 text-xs rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default PurchasesPage;
