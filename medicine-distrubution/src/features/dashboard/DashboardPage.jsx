import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';

const DashboardCard = ({ title, value, subtitle }) => (
  <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
    <header className="mb-1">
      <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</h3>
    </header>
    <p className="text-2xl font-semibold text-slate-900">{value}</p>
    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
  </section>
);

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/dashboard/summary');
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <main className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-600">
          Daily summary: stock, sales, payments & alerts.
        </p>
      </header>

      {loading && <p className="text-sm text-slate-500">Loading summary…</p>}

      {summary && (
        <section className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <DashboardCard
            title="Total Stock Value"
            value={summary.total_stock_value ?? '-'}
          />
          <DashboardCard
            title="Today Sales"
            value={summary.today_sales ?? '-'}
          />
          <DashboardCard
            title="Pending Customer Payments"
            value={summary.pending_customer_payments ?? '-'}
          />
          <DashboardCard
            title="Pending Purchase Payments"
            value={summary.pending_purchase_payments ?? '-'}
          />
          <DashboardCard
            title="Low Stock Items"
            value={summary.low_stock_count ?? '-'}
          />
          <DashboardCard
            title="Near Expiry Batches"
            value={summary.near_expiry_count ?? '-'}
          />
        </section>
      )}
    </main>
  );
};

export default DashboardPage;
