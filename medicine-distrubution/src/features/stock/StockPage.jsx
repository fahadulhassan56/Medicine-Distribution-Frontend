import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';

const StockPage = () => {
  const [fullStock, setFullStock] = useState([]);
  const [nearExpiry, setNearExpiry] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [productStock, setProductStock] = useState(null);
  const [batchDetail, setBatchDetail] = useState(null);
  const [productId, setProductId] = useState('');
  const [batchId, setBatchId] = useState('');

  // Original API calls kept exactly the same
  const loadFullStock = async () => {
    try {
      const res = await axiosClient.get('/stock');
      setFullStock(res.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load stock');
    }
  };

  const loadNearExpiry = async () => {
    try {
      const res = await axiosClient.get('/stock/near-expiry');
      setNearExpiry(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadLowStock = async () => {
    try {
      const res = await axiosClient.get('/stock/low');
      setLowStock(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProductStock = async () => {
    if (!productId) return;
    try {
      const res = await axiosClient.get(`/stock/${productId}`);
      setProductStock(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load product batches');
    }
  };

  const loadBatchDetail = async () => {
    if (!batchId) return;
    try {
      const res = await axiosClient.get(`/stock/batch/${batchId}`);
      setBatchDetail(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load batch detail');
    }
  };

  useEffect(() => {
    loadFullStock();
    loadNearExpiry();
    loadLowStock();
  }, []);

  // -------------------- SAFE DISPLAY FUNCTION --------------------
  const safeCell = (value) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (Array.isArray(value)) return `${value.length} items`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <main className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Stock</h2>
        <p className="text-sm text-slate-600">
          View full stock, near-expiry and low stock items with batch details.
        </p>
      </header>

      {/* ----------------- FULL / NEAR EXPIRY / LOW STOCK ----------------- */}
      <section className="grid gap-4 md:grid-cols-3">

        {/* FULL STOCK */}
        <section className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Full Stock</h3>

          <div className="overflow-x-auto max-h-64">
            <table className="min-w-full text-xs border">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-1">Product ID</th>
                  <th className="px-2 py-1">Name</th>
                  <th className="px-2 py-1">Qty</th>
                  <th className="px-2 py-1">Batches</th>
                </tr>
              </thead>
              <tbody>
                {(fullStock?.data || fullStock).map((item, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="px-2 py-1">{safeCell(item.product_id)}</td>
                    <td className="px-2 py-1">{safeCell(item.product_name)}</td>
                    <td className="px-2 py-1">{safeCell(item.total_qty)}</td>
                    <td className="px-2 py-1">{safeCell(item.batches)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* NEAR EXPIRY */}
        <section className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Near Expiry</h3>

          <div className="overflow-x-auto max-h-64">
            <table className="min-w-full text-xs border">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-1">Product ID</th>
                  <th className="px-2 py-1">Batch</th>
                  <th className="px-2 py-1">Expiry</th>
                  <th className="px-2 py-1">Qty</th>
                </tr>
              </thead>
              <tbody>
                {(nearExpiry?.data || nearExpiry).map((item, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="px-2 py-1">{safeCell(item.product_id)}</td>
                    <td className="px-2 py-1">{safeCell(item.batch_no)}</td>
                    <td className="px-2 py-1">{safeCell(item.expiry_date)}</td>
                    <td className="px-2 py-1">{safeCell(item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* LOW STOCK */}
        <section className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Low Stock</h3>

          <div className="overflow-x-auto max-h-64">
            <table className="min-w-full text-xs border">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-1">Product ID</th>
                  <th className="px-2 py-1">Product</th>
                  <th className="px-2 py-1">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {(lowStock?.data || lowStock).map((item, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="px-2 py-1">{safeCell(item.product_id)}</td>
                    <td className="px-2 py-1">{safeCell(item.product_name)}</td>
                    <td className="px-2 py-1">{safeCell(item.remaining_qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </section>

      {/* -------------------- PRODUCT BATCHES -------------------- */}
      <section className="grid gap-4 md:grid-cols-2">
        <section className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Product Batches</h3>

            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Product ID"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-24 border px-2 py-1 text-xs"
              />
              <button
                type="button"
                onClick={loadProductStock}
                className="text-xs px-3 py-1 border rounded"
              >
                Load
              </button>
            </div>
          </header>

          {productStock && (
            <>
              <div className="bg-slate-50 p-2 rounded text-xs border">
                <p><strong>Product ID:</strong> {safeCell(productStock.id || productStock.product_id)}</p>
                <p><strong>Name:</strong> {safeCell(productStock.product_name)}</p>
              </div>

              <table className="min-w-full text-xs border">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-2 py-1">Batch ID</th>
                    <th className="px-2 py-1">Batch No</th>
                    <th className="px-2 py-1">Expiry</th>
                    <th className="px-2 py-1">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {(productStock.batches || []).map((b, i) => (
                    <tr key={i} className="border-b hover:bg-slate-50">
                      <td className="px-2 py-1">{safeCell(b.id)}</td>
                      <td className="px-2 py-1">{safeCell(b.batch_no)}</td>
                      <td className="px-2 py-1">{safeCell(b.expiry_date)}</td>
                      <td className="px-2 py-1">{safeCell(b.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>

        {/* -------------------- BATCH DETAIL -------------------- */}
        <section className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Batch Detail</h3>

            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Batch ID"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="w-24 border px-2 py-1 text-xs"
              />
              <button
                type="button"
                onClick={loadBatchDetail}
                className="text-xs px-3 py-1 border rounded"
              >
                Load
              </button>
            </div>
          </header>

          {batchDetail && (
            <div className="bg-slate-50 p-3 rounded border text-xs space-y-1">
              <p><strong>Batch ID:</strong> {safeCell(batchDetail.id)}</p>
              <p><strong>Product ID:</strong> {safeCell(batchDetail.product_id)}</p>
              <p><strong>Batch No:</strong> {safeCell(batchDetail.batch_no)}</p>
              <p><strong>Expiry:</strong> {safeCell(batchDetail.expiry_date)}</p>
              <p><strong>Qty Remaining:</strong> {safeCell(batchDetail.remaining_qty)}</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default StockPage;
