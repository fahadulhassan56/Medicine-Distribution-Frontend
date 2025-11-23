// src/features/sales/SalesPage.jsx
import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';
import DataTable from '../../components/common/DataTable.jsx';
import { usePopup } from '../../components/ui/PopupContext.jsx';

const defaultSale = {
  customer_id: '',
  invoice_date: '',
  discount: 0,
  items: [
    {
      product_id: '',
      quantity: '',
      price: ''
    }
  ]
};

const SalesPage = () => {
  const { showPopup } = usePopup();
  const [sales, setSales] = useState([]);
  const [sale, setSale] = useState(defaultSale);
  const [selected, setSelected] = useState(null);

  // Dropdown lists
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const loadSales = async () => {
    try {
      const res = await axiosClient.get('/sales');
      setSales(res.data?.data || []);
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Sales Load Failed',
        message: 'Failed to load sales. Please try again.'
      });
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await axiosClient.get('/customers');
      setCustomers(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await axiosClient.get('/products');
      setProducts(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSales();
    loadCustomers();
    loadProducts();
  }, []);

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
    setSale((s) => ({ ...s, items: s.items.filter((_, i) => i !== idx) }));
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

      const payload = {
        customer_id: Number(sale.customer_id),
        invoice_date: sale.invoice_date,
        discount: Number(sale.discount) || 0,
        items: cleanedItems
      };

      await axiosClient.post('/sales', payload);
      setSale(defaultSale);
      await loadSales();
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Sale Creation Failed',
        message: 'Failed to create sale. Please try again.'
      });
    }
  };

  const handleSelectSale = async (row) => {
    try {
      const res = await axiosClient.get(`/sales/${row.id}`);
      setSelected(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 Expanded table columns to show more fields from your sample
  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (_, row) => row.customer?.name || `ID ${row.customer_id}`
    },
    {
      key: 'customer_phone',
      label: 'Phone',
      render: (_, row) => row.customer?.phone || '—'
    },
    {
      key: 'invoice_date',
      label: 'Invoice Date'
    },
    {
      key: 'net_total',
      label: 'Net Total',
      render: (_, row) => row.net_total ?? row.total_amount
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (_, row) =>
        row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'
    }
  ];

  const detail = selected || null;

  return (
    <main className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Sales</h2>
        <p className="text-sm text-slate-600">
          Create sales invoices and track stock movement.
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
                className="w-full"
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
                className="w-full"
              />
            </div>

            {/* DISCOUNT */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Discount
              </label>
              <input
                name="discount"
                type="number"
                step="0.01"
                value={sale.discount}
                onChange={handleSaleChange}
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
                    className="w-full"
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
                    className="w-full"
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
                    className="w-full"
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
      <section aria-label="Sales list">
        <DataTable columns={columns} data={sales} onRowClick={handleSelectSale} />
      </section>

      {/* SALE DETAIL CARD */}
      {detail && (
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <header className="border-b pb-3">
            <h3 className="text-lg font-semibold text-slate-900">
              Sale Invoice #{detail.id}
            </h3>
            <p className="text-sm text-slate-500">
              Customer:{' '}
              <span className="font-medium">
                {detail.customer?.name || `ID ${detail.customer_id}`}
              </span>
            </p>
          </header>

          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs uppercase text-slate-500 font-semibold">
                Invoice Date
              </h4>
              <p className="text-sm font-medium">{detail.invoice_date}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs uppercase text-slate-500 font-semibold">
                Customer ID
              </h4>
              <p className="text-sm font-medium">{detail.customer_id}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs uppercase text-slate-500 font-semibold">
                Total Amount
              </h4>
              <p className="text-sm font-medium text-green-600">
                Rs. {detail.net_total ?? detail.total_amount}
              </p>
            </div>
          </div>

          {/* CUSTOMER DETAILS */}
          {detail.customer && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-700">Customer Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Name</p>
                  <p className="text-sm font-medium">{detail.customer.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Phone</p>
                  <p className="text-sm font-medium">{detail.customer.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">License No</p>
                  <p className="text-sm font-medium">
                    {detail.customer.license_no || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Address</p>
                  <p className="text-sm font-medium">{detail.customer.address}</p>
                </div>
              </div>
            </section>
          )}

          {/* ITEMS TABLE */}
          <section>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Sold Items</h4>

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
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">Rs. {item.price}</td>
                      <td className="px-3 py-2 text-right">
                        Rs. {item.quantity * item.price}
                      </td>
                    </tr>
                  ))}

                  {(!detail.items || detail.items.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-slate-500">
                        No items for this sale.
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

export default SalesPage;
