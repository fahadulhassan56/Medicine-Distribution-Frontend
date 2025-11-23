import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';
import { usePopup } from '../../components/ui/PopupContext.jsx';

const PAGE_SIZE = 10;

const StockPage = () => {
  const { showPopup } = usePopup();
  const [fullStock, setFullStock] = useState([]);
  const [nearExpiry, setNearExpiry] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const [products, setProducts] = useState([]);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [productStockDetail, setProductStockDetail] = useState(null);

  const [fullPage, setFullPage] = useState(1);

  // -------------------- API CALLS --------------------

  const loadFullStock = async () => {
    try {
      const res = await axiosClient.get('/stock');
      const list = res.data?.data || res.data || [];
      setFullStock(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load stock', err);
      showPopup({
        type: 'error',
        title: 'Stock Load Failed',
        message: 'Failed to load stock. Please try again.'
      });
    }
  };

  const loadNearExpiry = async () => {
    try {
      const res = await axiosClient.get('/stock/near-expiry');
      const list = res.data?.data || res.data || [];
      setNearExpiry(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load near-expiry stock', err);
    }
  };

  const loadLowStock = async () => {
    try {
      const res = await axiosClient.get('/stock/low');
      const list = res.data?.data || res.data || [];
      setLowStock(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load low stock', err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await axiosClient.get('/products');
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list)) {
        setProducts(list);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to load products (will use stock list as fallback)', err);
      setProducts([]);
    }
  };

  const loadProductStockDetail = async (id) => {
    if (!id) {
      setProductStockDetail(null);
      return;
    }
    try {
      const res = await axiosClient.get(`/stock/${id}`);
      const data = res.data?.data || res.data || null;
      setProductStockDetail(data);
    } catch (err) {
      console.error('Failed to load product stock detail', err);

      // If backend says "not found" for stock, treat as "no stock yet" instead of error popup
      const status = err?.response?.status;
      if (status === 404) {
        setProductStockDetail({
          product_id: id,
          batches: [] // no stock yet
        });
      } else {
        // For other errors, just clear detail (no alert popup)
        setProductStockDetail(null);
      }
    }
  };

  useEffect(() => {
    loadFullStock();
    loadNearExpiry();
    loadLowStock();
    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      loadProductStockDetail(selectedProductId);
    } else {
      setProductStockDetail(null);
    }
  }, [selectedProductId]);

  // -------------------- HELPERS --------------------

  const safeText = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    return value;
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString();
  };

  const fullStockList = Array.isArray(fullStock) ? fullStock : [];
  const nearExpiryList = Array.isArray(nearExpiry) ? nearExpiry : [];
  const lowStockList = Array.isArray(lowStock) ? lowStock : [];

  // Product source for dropdown: prefer /products, fallback to /stock
  const productOptions =
    products.length > 0
      ? products.map((p) => ({
          id: p.id,
          product_name: p.product_name,
          generic_name: p.generic_name
        }))
      : fullStockList.map((s) => ({
          id: s.product_id,
          product_name: s.product_name,
          generic_name: s.generic_name
        }));

  const handleProductRowClick = (id) => {
    if (!id) return;
    setSelectedProductId(String(id));
  };

  // Get master product info (name, generic) from products or full stock
  const getSelectedProductMaster = () => {
    if (!selectedProductId) return null;
    const fromProducts =
      products.find((p) => String(p.id) === String(selectedProductId)) || null;

    if (fromProducts) return fromProducts;

    const fromStock =
      fullStockList.find((s) => String(s.product_id) === String(selectedProductId)) ||
      null;

    if (fromStock) {
      return {
        id: fromStock.product_id,
        product_name: fromStock.product_name,
        generic_name: fromStock.generic_name
      };
    }

    return null;
  };

  const selectedProductMaster = getSelectedProductMaster();

  // Aggregate summary from productStockDetail.batches
  const getProductSummary = (detail) => {
    const batches = Array.isArray(detail?.batches) ? detail.batches : [];

    if (!batches.length) {
      return {
        totalQty: 0,
        soldQty: 0,
        remainingQty: 0,
        nearestExpiry: null,
        firstAdded: null
      };
    }

    let totalQty = 0;
    let soldQty = 0;
    let remainingQty = 0;
    const expiryDates = [];
    const addedDates = [];

    batches.forEach((b) => {
      const qty = Number(b.quantity ?? b.qty ?? 0) || 0;
      const sold = Number(b.sold_qty ?? b.sold_quantity ?? 0) || 0;
      const remaining =
        Number(
          b.remaining_qty ??
            b.remaining_quantity ??
            (qty - sold)
        ) || 0;

      totalQty += qty;
      soldQty += sold;
      remainingQty += remaining;

      if (b.expiry_date) expiryDates.push(b.expiry_date);
      const added = b.createdAt || b.added_at || b.created_at;
      if (added) addedDates.push(added);
    });

    const nearestExpiry =
      expiryDates.length > 0 ? expiryDates.slice().sort()[0] : null;
    const firstAdded =
      addedDates.length > 0 ? addedDates.slice().sort()[0] : null;

    return { totalQty, soldQty, remainingQty, nearestExpiry, firstAdded };
  };

  const summary = productStockDetail ? getProductSummary(productStockDetail) : null;

  const productName =
    selectedProductMaster?.product_name ||
    productStockDetail?.product_name ||
    (selectedProductId ? `Product #${selectedProductId}` : '—');

  const genericName =
    selectedProductMaster?.generic_name ||
    productStockDetail?.generic_name ||
    '—';

  // Pagination for full stock
  const fullTotalPages = Math.max(1, Math.ceil(fullStockList.length / PAGE_SIZE));
  const fullCurrentPage = Math.min(fullTotalPages, fullTotalPages ? fullTotalPages : 1, );
  const fullStartIndex = (fullCurrentPage - 1) * PAGE_SIZE;
  const fullEndIndex = fullStartIndex + PAGE_SIZE;
  const fullPageItems = fullStockList.slice(fullStartIndex, fullEndIndex);

  // -------------------- RENDER --------------------

  return (
    <main className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Stock</h2>
        <p className="text-sm text-slate-600">
          View full stock, near-expiry and low stock items, and product-wise summary.
        </p>
      </header>

      {/* ----------------- OVERVIEW TABLES ----------------- */}
      <section className="grid gap-4 md:grid-cols-3">
        {/* FULL STOCK (with pagination) */}
        <section className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Full Stock</h3>
            <span className="text-[11px] text-slate-500">
              Click a row to view details
            </span>
          </div>

          <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-2 py-1 text-left">Product</th>
                <th className="px-2 py-1 text-right">Total Qty</th>
              </tr>
            </thead>
            <tbody>
              {fullPageItems.length > 0 ? (
                fullPageItems.map((item) => (
                  <tr
                    key={item.product_id}
                    className={`border-t hover:bg-slate-50 cursor-pointer ${
                      String(item.product_id) === String(selectedProductId)
                        ? 'bg-blue-50'
                        : ''
                    }`}
                    onClick={() => setSelectedProductId(String(item.product_id))}
                  >
                    <td className="px-2 py-1">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {safeText(item.product_name)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ID: {safeText(item.product_id)}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-1 text-right">
                      {safeText(item.total_qty)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="px-2 py-2 text-center text-slate-500"
                  >
                    No stock records found.
                  </td>
                </tr>
              )}

              {fullStockList.length > PAGE_SIZE && (
                <tr>
                  <td colSpan={2} className="px-2 py-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>
                        Page {fullCurrentPage} of {fullTotalPages}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFullPage((p) => Math.max(1, p - 1))
                          }
                          className="px-2 py-0.5 border rounded disabled:opacity-40"
                          disabled={fullCurrentPage === 1}
                        >
                          Prev
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFullPage((p) =>
                              Math.min(fullTotalPages, p + 1)
                            )
                          }
                          className="px-2 py-0.5 border rounded disabled:opacity-40"
                          disabled={fullCurrentPage === fullTotalPages}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* NEAR EXPIRY */}
        <section className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Near Expiry</h3>
            <span className="text-[11px] text-slate-500">
              Click a row to view details
            </span>
          </div>

          <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-2 py-1 text-left">Product</th>
                <th className="px-2 py-1 text-left">Expiry</th>
                <th className="px-2 py-1 text-right">Qty</th>
              </tr>
            </thead>
            <tbody>
              {nearExpiryList.length > 0 ? (
                nearExpiryList.map((item, idx) => (
                  <tr
                    key={`${item.product_id}-${idx}`}
                    className={`border-t hover:bg-slate-50 cursor-pointer ${
                      String(item.product_id) === String(selectedProductId)
                        ? 'bg-blue-50'
                        : ''
                    }`}
                    onClick={() => handleProductRowClick(item.product_id)}
                  >
                    <td className="px-2 py-1">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {safeText(item.product_name)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ID: {safeText(item.product_id)}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-1">{formatDate(item.expiry_date)}</td>
                    <td className="px-2 py-1 text-right">
                      {safeText(item.quantity)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-2 py-2 text-center text-slate-500"
                  >
                    No near-expiry items.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* LOW STOCK */}
        <section className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Low Stock</h3>
            <span className="text-[11px] text-slate-500">
              Click a row to view details
            </span>
          </div>

          <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-2 py-1 text-left">Product</th>
                <th className="px-2 py-1 text-right">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {lowStockList.length > 0 ? (
                lowStockList.map((item) => (
                  <tr
                    key={item.product_id}
                    className={`border-t hover:bg-slate-50 cursor-pointer ${
                      String(item.product_id) === String(selectedProductId)
                        ? 'bg-blue-50'
                        : ''
                    }`}
                    onClick={() => handleProductRowClick(item.product_id)}
                  >
                    <td className="px-2 py-1">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {safeText(item.product_name)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ID: {safeText(item.product_id)}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-1 text-right">
                      {safeText(item.remaining_qty)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="px-2 py-2 text-center text-slate-500"
                  >
                    No low-stock items.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </section>

      {/* -------------------- PRODUCT SUMMARY -------------------- */}
      <section className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Product Stock Summary
            </h3>
            <p className="text-xs text-slate-500">
              Select a product from the dropdown or click any row above.
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-xs text-slate-600">Product:</span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="border px-2 py-1 text-xs rounded-md"
            >
              <option value="">Select product</option>
              {productOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.product_name || `Product #${p.id}`}
                </option>
              ))}
            </select>
          </div>
        </header>

        {selectedProductId && !productStockDetail && (
          <p className="text-xs text-slate-500">
            Loading stock detail for product #{selectedProductId}…
          </p>
        )}

        {productStockDetail && summary ? (
          <div className="grid gap-3 md:grid-cols-3 text-xs">
            {/* Product info */}
            <div className="bg-slate-50 border rounded-lg p-3 space-y-1">
              <p className="font-semibold text-slate-700">Product</p>
              <p>
                <span className="text-slate-500">ID:</span>{' '}
                <span className="font-medium">
                  {safeText(
                    selectedProductMaster?.id ||
                      productStockDetail.product_id ||
                      selectedProductId
                  )}
                </span>
              </p>
              <p>
                <span className="text-slate-500">Name:</span>{' '}
                <span className="font-medium">{safeText(productName)}</span>
              </p>
              <p>
                <span className="text-slate-500">Generic:</span>{' '}
                <span className="font-medium">{safeText(genericName)}</span>
              </p>
            </div>

            {/* Quantity summary */}
            <div className="bg-slate-50 border rounded-lg p-3 space-y-1">
              <p className="font-semibold text-slate-700">Quantities</p>
              <p>
                <span className="text-slate-500">Total Quantity:</span>{' '}
                <span className="font-medium">
                  {summary.totalQty}
                </span>
              </p>
              <p>
                <span className="text-slate-500">Sold Quantity:</span>{' '}
                <span className="font-medium">
                  {summary.soldQty}
                </span>
              </p>
              <p>
                <span className="text-slate-500">Remaining Items:</span>{' '}
                <span className="font-medium">
                  {summary.remainingQty}
                </span>
              </p>
            </div>

            {/* Dates summary */}
            <div className="bg-slate-50 border rounded-lg p-3 space-y-1">
              <p className="font-semibold text-slate-700">Dates</p>
              <p>
                <span className="text-slate-500">Nearest Expiry:</span>{' '}
                <span className="font-medium">
                  {formatDate(summary.nearestExpiry)}
                </span>
              </p>
              <p>
                <span className="text-slate-500">First Added:</span>{' '}
                <span className="font-medium">
                  {formatDate(summary.firstAdded)}
                </span>
              </p>
            </div>
          </div>
        ) : (
          !selectedProductId && (
            <p className="text-xs text-slate-500">
              Select a product or click a row above to see its stock summary.
            </p>
          )
        )}

        {/* If productStockDetail exists but has no batches -> show friendly message */}
        {productStockDetail &&
          Array.isArray(productStockDetail.batches) &&
          productStockDetail.batches.length === 0 && (
            <p className="text-xs text-orange-600 mt-2">
              This product does not have any stock entries yet.
            </p>
          )}
      </section>
    </main>
  );
};

export default StockPage;
