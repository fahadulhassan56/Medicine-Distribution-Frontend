// src/features/sales/SalesPage.jsx
import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';
import DataTable from '../../components/common/DataTable.jsx';

const defaultSale = {
  customer_id: '',
  invoice_date: '',
  discount: 0, // percentage
  items: [
    {
      product_id: '',
      quantity: '',
      price: ''
    }
  ]
};

const SalesPage = () => {
  const [sales, setSales] = useState([]);
  const [sale, setSale] = useState(defaultSale);
  const [selected, setSelected] = useState(null);

  // Dropdown lists
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Pagination for /sales
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // ---- LOADERS ----
  const loadSales = async (page = 1) => {
    try {
      const res = await axiosClient.get('/sales', {
        params: { page, limit: pagination.limit }
      });

      // Expecting something like:
      // { success, message, data: { sales: [...], page, limit, total, totalPages } }
      const api = res.data?.data || {};
      const list = Array.isArray(api) ? api : api.sales || [];

      setSales(list);
      setPagination({
        page: api.page || 1,
        limit: api.limit || pagination.limit,
        total: api.total || list.length,
        totalPages: api.totalPages || 1
      });
    } catch (err) {
      console.error(err);
      alert('Failed to load sales');
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await axiosClient.get('/customers');
      const raw = res.data?.data;
      const list = Array.isArray(raw) ? raw : raw?.customers || [];
      setCustomers(list);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await axiosClient.get('/products', {
        params: { page: 1, limit: 1000 }
      });
      // from your products API: data: { products: [...], page, ... }
      const api = res.data?.data;
      const list = Array.isArray(api) ? api : api?.products || [];
      setProducts(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSales(1);
    loadCustomers();
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- FORM HANDLERS ----
  const handleSaleChange = (e) => {
    const { name, value } = e.target;
    setSale((s) => ({
      ...s,
      [name]: ['customer_id', 'discount'].includes(name)
        ? value === ''
          ? ''
          : Number(value)
        : value
    }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    setSale((s) => {
      const items = [...s.items];
      items[index] = {
        ...items[index],
        [name]:
          ['product_id', 'quantity', 'price'].includes(name)
            ? value === ''
              ? ''
              : Number(value)
            : value
      };
      return { ...s, items };
    });
  };

  const addItem = () => {
    setSale((s) => ({
      ...s,
      items: [...s.items, { product_id: '', quantity: '', price: '' }]
    }));
  };

  const removeItem = (idx) => {
    setSale((s) => ({
      ...s,
      items: s.items.filter((_, i) => i !== idx)
    }));
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();

    try {
      const cleanedItems = sale.items
        .filter((item) => item.product_id && item.quantity && item.price)
        .map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          price: Number(item.price)
        }));

      if (cleanedItems.length === 0) {
        alert('Please add at least one item.');
        return;
      }

      const payload = {
        customer_id: Number(sale.customer_id),
        invoice_date: sale.invoice_date,
        discount: Number(sale.discount) || 0, // percentage
        items: cleanedItems
      };

      await axiosClient.post('/sales', payload);
      setSale(defaultSale);
      await loadSales(pagination.page);
    } catch (err) {
      console.error(err);
      alert('Failed to create sale');
    }
  };

  // Open modal and load full sale details
  const openDetailsModal = async (row) => {
    try {
      setDetailLoading(true);
      const res = await axiosClient.get(`/sales/${row.id}`);
      const detailData = res.data?.data || res.data;
      setSelected(detailData);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert('Failed to load sale details');
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
    loadSales(newPage);
  };

  // ---- TABLE COLUMNS ----
  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'customer',
      label: 'Customer',
      render: (_, row) => row.customer?.name || `ID ${row.customer_id}`
    },
    { key: 'invoice_date', label: 'Invoice Date' },
    {
      key: 'total',
      label: 'Gross Total',
      render: (_, row) => row.total ?? '-'
    },
    {
      key: 'net_total',
      label: 'Net Total',
      render: (_, row) => row.net_total ?? '-'
    },
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

  // Optional: compute preview totals on the form
  const formGrossTotal = sale.items.reduce(
    (sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.price) || 0),
    0
  );
  const formDiscountAmount = (formGrossTotal * (Number(sale.discount) || 0)) / 100;
  const formNetTotal = formGrossTotal - formDiscountAmount;

  return (
    <main className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Sales</h2>
        <p className="text-sm text-slate-600">
          Create sales invoices and track stock movement (FEFO-based deduction on backend).
        </p>
      </header>

      {/* CREATE SALE */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
        <header>
          <h3 className="text-sm font-semibold text-slate-800">Create Sale</h3>
        </header>

        <form className="space-y-3" onSubmit={handleCreateSale}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* CUSTOMER */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Customer
              </label>
              <select
                name="customer_id"
                value={sale.customer_id}
                onChange={handleSaleChange}
                required
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

            {/* DATE */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Invoice Date
              </label>
              <input
                name="invoice_date"
                type="date"
                value={sale.invoice_date}
                onChange={handleSaleChange}
                required
                className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
              />
            </div>

            {/* DISCOUNT (percentage) */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Discount (%)
              </label>
              <input
                name="discount"
                type="number"
                step="0.01"
                value={sale.discount}
                onChange={handleSaleChange}
                className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>

          {/* FORM TOTALS PREVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
            <div>
              <span className="font-semibold">Gross Total:</span>{' '}
              Rs. {formGrossTotal.toFixed(2)}
            </div>
            <div>
              <span className="font-semibold">Discount Amount:</span>{' '}
              Rs. {formDiscountAmount.toFixed(2)}
            </div>
            <div>
              <span className="font-semibold">Net Total:</span>{' '}
              Rs. {formNetTotal.toFixed(2)}
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

            {sale.items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-4 gap-2 border border-slate-100 rounded-lg p-2"
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
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.product_name || p.name || `Product #${p.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* QTY */}
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Quantity
                  </label>
                  <input
                    name="quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, e)}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                    required
                  />
                </div>

                {/* PRICE */}
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Price
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => handleItemChange(idx, e)}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                    required
                  />
                </div>

                {/* REMOVE */}
                {sale.items.length > 1 && (
                  <div className="flex items-end justify-end">
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
              Save Sale
            </button>
          </div>
        </form>
      </section>

      {/* SALES LIST */}
      <section aria-label="Sales list" className="space-y-2">
        <DataTable
          columns={columns}
          data={sales}
          // No onRowClick now; we use Details button
        />

        {/* Pagination */}
        <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
          <div>
            Page {pagination.page} of {pagination.totalPages} — Total sales:{' '}
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
                Sale #{detail.id}
              </h3>
              <p className="text-sm text-slate-500">
                Customer:{' '}
                <span className="font-medium">
                  {detail.customer?.name || `ID ${detail.customer_id}`}
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Created:{' '}
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-xs uppercase text-slate-500 font-semibold">
                      Invoice Date
                    </h4>
                    <p className="text-sm font-medium">{detail.invoice_date}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-xs uppercase text-slate-500 font-semibold">
                      Gross Total
                    </h4>
                    <p className="text-sm font-medium">
                      Rs. {detail.total ?? '—'}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-xs uppercase text-slate-500 font-semibold">
                      Discount (%)
                    </h4>
                    <p className="text-sm font-medium">
                      {detail.discount ?? 0}%
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-xs uppercase text-slate-500 font-semibold">
                      Net Total
                    </h4>
                    <p className="text-sm font-medium text-green-600">
                      Rs. {detail.net_total ?? '—'}
                    </p>
                  </div>
                </div>

                {/* CUSTOMER DETAILS */}
                {detail.customer && (
                  <section className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-700">
                      Customer Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Name</p>
                        <p className="text-sm font-medium">
                          {detail.customer.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Phone</p>
                        <p className="text-sm font-medium">
                          {detail.customer.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">Email</p>
                        <p className="text-sm font-medium">
                          {detail.customer.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase">
                          Address
                        </p>
                        <p className="text-sm font-medium">
                          {detail.customer.address}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* ITEMS TABLE */}
                <section>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">
                    Sold Items
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm bg-white border border-slate-200 rounded-lg">
                      <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                        <tr>
                          <th className="px-3 py-2 text-left">Product</th>
                          <th className="px-3 py-2 text-right">Qty</th>
                          <th className="px-3 py-2 text-right">Price</th>
                          <th className="px-3 py-2 text-right">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {(detail.items || []).map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2">
                              {item.product?.product_name ||
                                item.product?.name ||
                                `Product #${item.product_id}`}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-2 text-right">
                              Rs. {item.price}
                            </td>
                            <td className="px-3 py-2 text-right">
                              Rs.{' '}
                              {Number(
                                item.total ?? item.quantity * item.price
                              )}
                            </td>
                          </tr>
                        ))}

                        {(!detail.items || detail.items.length === 0) && (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-3 py-4 text-center text-slate-500"
                            >
                              No items for this sale.
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

export default SalesPage;
