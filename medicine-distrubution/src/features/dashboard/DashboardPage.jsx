import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';

const DashboardCard = ({ title, value, subtitle }) => (
  <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
    <header className="mb-1">
      <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {title}
      </h3>
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

      const api = res.data?.data ?? {};

      // Set API data directly (no manual mapping needed)
      setSummary(api);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
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

          <DashboardCard title="Total Sales" value={summary.totalSales ?? '-'} />
          <DashboardCard title="Total Purchases" value={summary.totalPurchases ?? '-'} />
          <DashboardCard title="Today's Revenue" value={summary.todaysRevenue ?? '-'} />
          <DashboardCard title="Stock Valuation" value={summary.stockValuation ?? '-'} />
          <DashboardCard title="Low Stock Items" value={summary.lowStockCount ?? '-'} />
          <DashboardCard title="Near Expiry Batches" value={summary.nearExpiryCount ?? '-'} />
          <DashboardCard title="Outstanding Customer Balance" value={summary.outstandingCustomerBalance ?? '-'} />
          <DashboardCard title="Outstanding Supplier Balance" value={summary.outstandingSupplierBalance ?? '-'} />
          <DashboardCard title="Total Products" value={summary.totalProducts ?? '-'} />
          <DashboardCard title="Total Customers" value={summary.totalCustomers ?? '-'} />
          <DashboardCard title="Total Suppliers" value={summary.totalSuppliers ?? '-'} />
          
          {/* Optionally show list or count of lowStockProducts */}
          <DashboardCard 
            title="Low Stock Products" 
            value={summary.lowStockProducts?.length ?? '-'} 
            subtitle={summary.lowStockProducts?.length ? 'See details below' : ''} 
          />

          {/* Show timestamp */}
          <DashboardCard 
            title="As Of" 
            value={summary.asOf ? new Date(summary.asOf).toLocaleString() : '-'} 
          />
        </section>
      )}
    </main>
  );
};

export default DashboardPage;
