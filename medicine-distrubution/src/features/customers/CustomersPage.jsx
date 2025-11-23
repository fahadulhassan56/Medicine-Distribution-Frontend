import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';
import DataTable from '../../components/common/DataTable.jsx';
import { usePopup } from '../../components/ui/PopupContext'; // 👈 popup hook

const emptyCustomer = {
  name: '',
  license_no: '',
  address: '',
  phone: '',
  credit_limit: ''
};

const CustomersPage = () => {
  const { showPopup } = usePopup(); // 👈 get showPopup from context

  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyCustomer);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/customers');
      setCustomers(res.data?.data || []);
      setCurrentPage(1); // reset to first page when data reloads
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load customers. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]:
        name === 'credit_limit'
          ? value === ''
            ? ''
            : Number(value)
          : value
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

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await axiosClient.delete(`/customers/${id}`);
      await loadCustomers();
      showPopup({
        type: 'success',
        title: 'Deleted',
        message: 'Customer has been deleted successfully.'
      });
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete customer. Please try again.'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosClient.put(`/customers/${editingId}`, form);
        showPopup({
          type: 'success',
          title: 'Customer Updated',
          message: 'Changes saved successfully.'
        });
      } else {
        await axiosClient.post('/customers', form);
        showPopup({
          type: 'success',
          title: 'Customer Added',
          message: 'New customer has been added.'
        });
      }
      setForm(emptyCustomer);
      setEditingId(null);
      await loadCustomers();
    } catch (err) {
      console.error(err);
      showPopup({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save customer. Please check the data and try again.'
      });
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

  // Pagination calculations
  const totalItems = customers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCustomers = customers.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

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
        {loading ? (
          <p className="text-sm text-slate-500">Loading customers…</p>
        ) : (
          <>
            <DataTable columns={columns} data={paginatedCustomers} />

            {totalItems > 0 && (
              <div className="flex items-center justify-between mt-3 text-xs text-slate-600">
                <span>
                  Showing {totalItems === 0 ? 0 : startIndex + 1}–
                  {Math.min(endIndex, totalItems)} of {totalItems}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={safePage === 1}
                    className="px-3 py-1 rounded-md border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span>
                    Page {safePage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={safePage === totalPages}
                    className="px-3 py-1 rounded-md border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default CustomersPage;
