import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';
import DataTable from '../../components/common/DataTable.jsx';

const emptySupplier = {
  name: '',
  gst_no: '',
  address: '',
  email: '',
  phone: ''
};

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptySupplier);
  const [editingId, setEditingId] = useState(null);

  const loadSuppliers = async () => {
    try {
      const res = await axiosClient.get('/suppliers');
      setSuppliers(res.data?.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load suppliers');
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleEdit = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      gst_no: s.gst_no,
      address: s.address,
      email: s.email,
      phone: s.phone
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    try {
      await axiosClient.delete(`/suppliers/${id}`);
      await loadSuppliers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete supplier');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosClient.put(`/suppliers/${editingId}`, form);
      } else {
        await axiosClient.post('/suppliers', form);
      }
      setForm(emptySupplier);
      setEditingId(null);
      await loadSuppliers();
    } catch (err) {
      console.error(err);
      alert('Failed to save supplier');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'gst_no', label: 'GST No' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
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
          <button
            type="button"
            className="text-xs text-red-600 underline"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <main className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Suppliers (Companies)</h2>
        <p className="text-sm text-slate-600">
          Manage supplier master data and GST info.
        </p>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <header className="mb-3">
          <h3 className="text-sm font-semibold text-slate-800">
            {editingId ? 'Edit Supplier' : 'Add Supplier'}
          </h3>
        </header>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">GST No</label>
            <input
              name="gst_no"
              value={form.gst_no}
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
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
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
          <div className="col-span-1 md:col-span-3 flex justify-end gap-2 mt-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptySupplier);
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
              {editingId ? 'Update Supplier' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </section>

      <section aria-label="Suppliers list">
        <DataTable columns={columns} data={suppliers} />
      </section>
    </main>
  );
};

export default SuppliersPage;
