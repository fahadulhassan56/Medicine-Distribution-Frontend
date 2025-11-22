import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
const RegisterPage = lazy(() => import('./features/auth/RegisterPage.jsx'));
const DashboardPage = lazy(() => import('./features/dashboard/DashboardPage.jsx'));
const ProductsPage = lazy(() => import('./features/products/ProductsPage.jsx'));
const SuppliersPage = lazy(() => import('./features/suppliers/SuppliersPage.jsx'));
const CustomersPage = lazy(() => import('./features/customers/CustomersPage.jsx'));
const PurchasesPage = lazy(() => import('./features/purchases/PurchasesPage.jsx'));
const SalesPage = lazy(() => import('./features/sales/SalesPage.jsx'));
const PaymentsPage = lazy(() => import('./features/payments/PaymentsPage.jsx'));
const ReturnsPage = lazy(() => import('./features/returns/ReturnsPage.jsx'));
const StockPage = lazy(() => import('./features/stock/StockPage.jsx'));
const ReportsPage = lazy(() => import('./features/reports/ReportsPage.jsx'));
const InvoicesPage = lazy(() => import('./features/invoices/InvoicesPage.jsx'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage.jsx'));

const App = () => {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-sm text-slate-600">Loading…</div>
        </main>
      }
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/purchases" element={<PurchasesPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
