import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { login } from './authSlice.js';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';
const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, loading, error } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({
    email: 'admin@example.com',
    password: '123456'
  });

  if (token) {
    return <Navigate to={from} replace />;
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      navigate(from, { replace: true });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-slate-100">
      <section className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Pharmacy Distribution System
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to manage inventory &amp; billing.
          </p>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <footer className="mt-4 text-xs text-slate-500 text-center">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </footer>
      </section>
    </main>
  );
};

export default LoginPage;
