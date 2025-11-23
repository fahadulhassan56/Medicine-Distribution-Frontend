import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';
import { usePopup } from '../../components/ui/PopupContext'; // 👈 NEW
import DataTable from '../../components/common/DataTable.jsx';

// Format numbers
const formatNumber = (val) => {
  if (val === null || val === undefined || val === '') return '-';
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
};

// Dashboard card
const DashboardCard = ({ title, value, type = 'count', subtitle }) => {
  let display = '-';

  if (value !== null && value !== undefined && value !== '') {
    if (type === 'currency') {
      display = `Rs. ${formatNumber(value)}`;
    } else {
      display = formatNumber(value);
    }
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
      <header className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {title}
        </h3>
      </header>
      <p className="text-2xl font-semibold text-slate-900">{display}</p>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1">
          {subtitle}
        </p>
      )}
    </section>
  );
};

// Helper function to get field
const pickField = (obj, keys) => {
  if (!obj) return null;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }
  return null;
};

const DashboardPage = () => {
  const { showPopup } = usePopup(); // 👈 Popup hook

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSummary = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await axiosClient.get('/dashboard/summary');
      let backendData = res.data;

      if (backendData && typeof backendData === 'object') {
        if (backendData.data) backendData = backendData.data;
        if (backendData.summary) backendData = backendData.summary;
        if (backendData.stats) backendData = backendData.stats;
      }

      setSummary(backendData || {});
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
      setSummary(null);

      showPopup({
        type: 'error',
        title: 'Load Failed',
        message: 'Unable to load dashboard summary. Please try again.',
      }); // 👈 NEW
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  // Metrics extracted from summary
  const metrics = summary
    ? {
        totalStockValue: pickField(summary, [
          'total_stock_value',
          'total_stock',
          'stock_value',
          'stock_total',
          'total_inventory_value',
        ]),
        todaySales: pickField(summary, [
          'today_sales',
          'sales_today',
          'today_total_sales',
          'today_net_total',
          'todays_sales',
        ]),
        pendingCustomerPayments: pickField(summary, [
          'pending_customer_payments',
          'pending_customers',
          'pending_receivables',
          'customer_pending',
          'pending_customer_amount',
        ]),
        pendingPurchasePayments: pickField(summary, [
          'pending_purchase_payments',
          'pending_purchases',
          'pending_payables',
          'supplier_pending',
          'pending_supplier_amount',
        ]),
        lowStockCount: pickField(summary, [
          'low_stock_count',
          'low_stock',
          'low_stock_items',
          'low_stock_products',
        ]),
        nearExpiryCount: pickField(summary, [
          'near_expiry_count',
          'near_expiry',
          'near_expiry_batches',
          'expiring_soon_count',
        ]),
      }
    : {};

  const handleRefresh = () => {
    loadSummary();
    showPopup({
      type: 'info',
      title: 'Refreshing',
      message: 'Dashboard summary is being updated.',
    }); // 👈 Optional (you can remove)
  };

  return (
    <main className="space-y-5">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-600">
            Daily overview of stock, sales and payments.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="self-start md:self-auto px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </header>

      {/* Status */}
      {loading && (
        <p className="text-xs text-slate-500">Loading summary…</p>
      )}
      {!loading && error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      {/* Cards */}
      {summary && !loading && (
        <section className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2">
            <DashboardCard
              title="Today Sales"
              value={metrics.todaySales}
              type="currency"
              subtitle="Total invoiced sales for today"
            />
          </div>
          <DashboardCard
            title="Total Stock Value"
            value={metrics.totalStockValue}
            type="currency"
            subtitle="Approximate cost value of current stock"
          />
          <DashboardCard
            title="Pending Customer Payments"
            value={metrics.pendingCustomerPayments}
            type="currency"
            subtitle="Outstanding receivables from customers"
          />
          <DashboardCard
            title="Pending Purchase Payments"
            value={metrics.pendingPurchasePayments}
            type="currency"
            subtitle="Outstanding payables to suppliers"
          />
          <DashboardCard
            title="Low Stock Items"
            value={metrics.lowStockCount}
            type="count"
            subtitle="Products at or below minimum level"
          />
          <DashboardCard
            title="Near Expiry Batches"
            value={metrics.nearExpiryCount}
            type="count"
            subtitle="Batches expiring soon"
          />
        </section>
      )}

      {!loading && !error && !summary && (
        <p className="text-xs text-slate-500">No summary data available.</p>
      )}
    </main>
  );
};

export default DashboardPage;
