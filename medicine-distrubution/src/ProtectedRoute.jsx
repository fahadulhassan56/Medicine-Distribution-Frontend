import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from './store/hooks.js';
import Layout from './components/layout/Layout.jsx';

const ProtectedRoute = () => {
  const { token } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRoute;
