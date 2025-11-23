import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient.js';
import './RegisterPage.css';
const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      // POST /auth/register
      const response = await axiosClient.post('/auth/register', form);

      // backend returns:
      // { success: true, message: "User registered", data: {...} }

      if (response.data?.success) {
        setSuccessMsg('Registration successful! You can now log in.');
        setTimeout(() => {
          navigate('/login');
        }, 800);
      } else {
        setError('Registration failed. Try again.');
      }

    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-slate-100">
      <section className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Create an Account
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Register a new user for the Pharmacy Distribution System.
          </p>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="block text-sm font-medium text-slate-700 mb-1"
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full"
              placeholder="Admin User"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-700 mb-1"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-700 mb-1"
              htmlFor="password"
            >
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
              placeholder="••••••"
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-700 mb-1"
              htmlFor="role"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full"
            >
              {/* Use same role values as backend expects */}
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-2">
              {error}
            </p>
          )}

          {successMsg && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md p-2">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {loading ? 'Registering…' : 'Register'}
          </button>
        </form>

        <footer className="mt-4 text-xs text-slate-500 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </footer>
      </section>
    </main>
  );
};

export default RegisterPage;
