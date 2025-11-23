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

  // ----------------- LOADERS (match StockService) -----------------

  // 1. Full stock (grouped by product)
  const loadFullStock = async () => {
    try {
      const res = await axiosClient.get('/stock');
      // service: success("Stock fetched", Object.values(grouped))
      setFullStock(res.data?.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load stock');
    }
  };

  // 2. Near expiry (batches with included product)
  const loadNearExpiry = async () => {
    try {
      const res = await axiosClient.get('/stock/near-expiry');
      // service: success("Near expiry stock", nearExpiry)
      setNearExpiry(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Low stock (grouped products: { product, total_quantity })
  const loadLowStock = async () => {
    try {
      const res = await axiosClient.get('/stock/low');
      // service: success("Low stock", low)
      setLowStock(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 4. All batches for a product
  const loadProductStock = async () => {
    if (!productId) return;
    try {
      const res = await axiosClient.get(`/stock/${productId}`);
      // service: success("Product batches fetched", batches)
      const batches = res.data?.data || [];
      if (!Array.isArray(batches) || batches.length === 0) {
        setProductStock(null);
        alert('No batches found for this product');
        return;
      }

      // product info from first batch (all are same product)
      const first = batches[0];
      setProductStock({
        product: first.product || null,
        product_id: first.product_id,
        batches
      });
    } catch (err) {
      console.error(err);
      alert('Failed to load product batches');
    }
  };

  // 5. Single batch detail
  const loadBatchDetail = async () => {
    if (!batchId) return;
    try {
      const res = await axiosClient.get(`/stock/batch/${batchId}`);
      // service: success("Batch detail fetched", batch)
      setBatchDetail(res.data?.data || null);
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

  // -------------------- SAFE DISPLAY HELPER --------------------
  const safeCell = (value) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (Array.isArray(value)) return `${value.length} items`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return safeCell(value);
    return d.toISOString().split('T')[0];
  };

  // -------------------- DERIVED OPTIONS --------------------
  // Products list for dropdown (only products that have stock)
  const productOptions = Array.isArray(fullStock)
    ? fullStock
        .map((grp) => grp.product)
        .filter((p) => p && p.id)
    : [];

  // All batches (across products) for batch dropdown in Batch Detail
  const allBatches = Array.isArray(fullStock)
    ? fullStock.flatMap((grp) =>
        Array.isArray(grp.batches)
          ? grp.batches.map((b) => ({
              ...b,
              product: grp.product || null
            }))
          : []
      )
    : [];

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
        {/* FULL STOCK (grouped by product) */}
        <section className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Full Stock</h3>

          <div className="overflow-x-auto max-h-64">
            <table className="min-w-full text-xs border">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-1 text-left">Product ID</th>
                  <th className="px-2 py-1 text-left">Product</th>
                  <th className="px-2 py-1 text-right">Total Qty</th>
                  <th className="px-2 py-1 text-right">Batches</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(fullStock) && fullStock.length > 0 ? (
                  fullStock.map((item, i) => {
                    const p = item.product || {};
                    return (
                      <tr key={i} className="border-b hover:bg-slate-50">
                        <td className="px-2 py-1">{safeCell(p.id)}</td>
                        <td className="px-2 py-1">
                          {p.product_name || p.name || `Product #${p.id}`}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {safeCell(item.total_quantity)}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {Array.isArray(item.batches) ? item.batches.length : 0}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-2 py-3 text-center text-slate-500"
                    >
                      No stock found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* NEAR EXPIRY (batches) */}
        <section className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">
            Near Expiry (30 days)
          </h3>

          <div className="overflow-x-auto max-h-64">
            <table className="min-w-full text-xs border">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-1 text-left">Product</th>
                  <th className="px-2 py-1 text-left">Batch</th>
                  <th className="px-2 py-1 text-left">Expiry</th>
                  <th className="px-2 py-1 text-right">Qty</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(nearExpiry) && nearExpiry.length > 0 ? (
                  nearExpiry.map((b, i) => {
                    const p = b.product || {};
                    return (
                      <tr key={i} className="border-b hover:bg-slate-50">
                        <td className="px-2 py-1">
                          {p.product_name || p.name || `Product #${b.product_id}`}
                        </td>
                        <td className="px-2 py-1">{safeCell(b.batch_no)}</td>
                        <td className="px-2 py-1">{formatDate(b.expiry_date)}</td>
                        <td className="px-2 py-1 text-right">{safeCell(b.quantity)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-2 py-3 text-center text-slate-500"
                    >
                      No near-expiry stock.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* LOW STOCK (grouped products) */}
        <section className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Low Stock</h3>

          <div className="overflow-x-auto max-h-64">
            <table className="min-w-full text-xs border">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-1 text-left">Product ID</th>
                  <th className="px-2 py-1 text-left">Product</th>
                  <th className="px-2 py-1 text-right">Total Qty</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(lowStock) && lowStock.length > 0 ? (
                  lowStock.map((item, i) => {
                    const p = item.product || {};
                    return (
                      <tr key={i} className="border-b hover:bg-slate-50">
                        <td className="px-2 py-1">{safeCell(p.id)}</td>
                        <td className="px-2 py-1">
                          {p.product_name || p.name || `Product #${p.id}`}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {safeCell(item.total_quantity)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-2 py-3 text-center text-slate-500"
                    >
                      No low-stock products.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {/* -------------------- PRODUCT BATCHES & BATCH DETAIL -------------------- */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* PRODUCT BATCHES (product name dropdown) */}
        <section className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Product Batches</h3>

            <div className="flex gap-2 items-center">
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="border px-2 py-1 text-xs rounded"
              >
                <option value="">Select product</option>
                {productOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.product_name || p.name || `Product #${p.id}`}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={loadProductStock}
                className="text-xs px-3 py-1 border rounded-md hover:bg-slate-50"
              >
                Load
              </button>
            </div>
          </header>

          {productStock && (
            <>
              <div className="bg-slate-50 p-2 rounded text-xs border space-y-1">
                <p>
                  <strong>Product ID:</strong>{' '}
                  {safeCell(productStock.product?.id || productStock.product_id)}
                </p>
                <p>
                  <strong>Name:</strong>{' '}
                  {productStock.product?.product_name ||
                    productStock.product?.name ||
                    `Product #${productStock.product?.id || productStock.product_id}`}
                </p>
              </div>

              <div className="overflow-x-auto max-h-64">
                <table className="min-w-full text-xs border">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-2 py-1 text-left">Batch ID</th>
                      <th className="px-2 py-1 text-left">Batch No</th>
                      <th className="px-2 py-1 text-left">Expiry</th>
                      <th className="px-2 py-1 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(productStock.batches) &&
                    productStock.batches.length > 0 ? (
                      productStock.batches.map((b, i) => (
                        <tr key={i} className="border-b hover:bg-slate-50">
                          <td className="px-2 py-1">{safeCell(b.id)}</td>
                          <td className="px-2 py-1">{safeCell(b.batch_no)}</td>
                          <td className="px-2 py-1">{formatDate(b.expiry_date)}</td>
                          <td className="px-2 py-1 text-right">
                            {safeCell(b.quantity)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-2 py-3 text-center text-slate-500"
                        >
                          No batches for this product.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!productStock && (
            <p className="text-xs text-slate-500">
              Select a product above to see its batches.
            </p>
          )}
        </section>

        {/* BATCH DETAIL (batch no dropdown) */}
        <section className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
          <header className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Batch Detail</h3>

            <div className="flex gap-2 items-center">
              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="border px-2 py-1 text-xs rounded"
              >
                <option value="">Select batch</option>
                {allBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {`${b.batch_no || 'No batch'} • ${
                      b.product?.product_name ||
                      b.product?.name ||
                      `Product #${b.product_id}`
                    } (ID #${b.id})`}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={loadBatchDetail}
                className="text-xs px-3 py-1 border rounded-md hover:bg-slate-50"
              >
                Load
              </button>
            </div>
          </header>

          {batchDetail ? (
            <div className="bg-slate-50 p-3 rounded border text-xs space-y-1">
              <p>
                <strong>Batch ID:</strong> {safeCell(batchDetail.id)}
              </p>
              <p>
                <strong>Product ID:</strong> {safeCell(batchDetail.product_id)}
              </p>
              <p>
                <strong>Product:</strong>{' '}
                {batchDetail.product?.product_name ||
                  batchDetail.product?.name ||
                  `Product #${batchDetail.product_id}`}
              </p>
              <p>
                <strong>Batch No:</strong> {safeCell(batchDetail.batch_no)}
              </p>
              <p>
                <strong>Expiry:</strong> {formatDate(batchDetail.expiry_date)}
              </p>
              <p>
                <strong>Quantity:</strong> {safeCell(batchDetail.quantity)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Select a batch above to see full details.
            </p>
          )}
        </section>
      </section>
    </main>
  );
};

export default StockPage;
