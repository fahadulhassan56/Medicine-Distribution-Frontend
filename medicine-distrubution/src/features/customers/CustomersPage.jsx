import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';
import DataTable from '../../components/common/DataTable.jsx';

const emptyCustomer = {
  name: '',
  license_no: '',
  address: '',
  phone: '',
  credit_limit: ''
};

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyCustomer);
  const [editingId, setEditingId] = useState(null);

  const loadCustomers = async () => {
    try {
      const res = await axiosClient.get('/customers');
      setCustomers(res.data?.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load customers');
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === 'credit_limit' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      license_no: c.license_no,
      address: c.address,
      phone: c.phone,
      credit_limit: c.credit_limit
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosClient.put(`/customers/${editingId}`, form);
      } else {
        await axiosClient.post('/customers', form);
      }
      setForm(emptyCustomer);
      setEditingId(null);
      await loadCustomers();
    } catch (err) {
      console.error(err);
      alert('Failed to save customer');
    }
  };

  const columns = [
    { key: 'name', label: 'Pharmacy' },
    { key: 'license_no', label: 'License' },
    { key: 'phone', label: 'Phone' },
    { key: 'credit_limit', label: 'Credit Limit' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          type="button"
          className="text-xs text-blue-600 underline"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(row);
          }}
        >
          Edit
        </button>
      )
    }
  ];

  return (
    <main className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Customers (Pharmacies)</h2>
        <p className="text-sm text-slate-600">
          Manage pharmacy details, license numbers and credit limits.
        </p>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <header className="mb-3">
          <h3 className="text-sm font-semibold text-slate-800">
            {editingId ? 'Edit Customer' : 'Add Customer'}
          </h3>
        </header>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Pharmacy Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              License No
            </label>
            <input
              name="license_no"
              value={form.license_no}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-700 block mb-1">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={2}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Credit Limit
            </label>
            <input
              name="credit_limit"
              type="number"
              step="0.01"
              value={form.credit_limit}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div className="col-span-1 md:col-span-3 flex justify-end gap-2 mt-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyCustomer);
                }}
                className="px-3 py-1 text-xs rounded-md border border-slate-300"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-1.5 text-xs rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              {editingId ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </section>

      <section aria-label="Customers list">
        <DataTable columns={columns} data={customers} />
      </section>
    </main>
  );
};

export default CustomersPage;
