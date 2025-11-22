import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient.js';
import DataTable from '../../components/common/DataTable.jsx';

const emptyProduct = {
  product_name: '',
  generic_name: '',
  strength: '',
  form: '',
  packing: '',
  barcode: '',
  mrp: '',
  purchase_price: '',
  selling_price: '',
  is_prescription_required: false,
  is_controlled: false
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/products');
      setProducts(res.data?.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : ['mrp', 'purchase_price', 'selling_price'].includes(name)
          ? value === ''
            ? ''
            : Number(value)
          : value
    }));
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      product_name: product.product_name,
      generic_name: product.generic_name,
      strength: product.strength,
      form: product.form,
      packing: product.packing,
      barcode: product.barcode,
      mrp: product.mrp,
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      is_prescription_required: product.is_prescription_required,
      is_controlled: product.is_controlled
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await axiosClient.delete(`/products/${id}`);
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to delete product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosClient.put(`/products/${editingId}`, form);
      } else {
        await axiosClient.post('/products', form);
      }
      setForm(emptyProduct);
      setEditingId(null);
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to save product');
    }
  };

  const columns = [
    { key: 'product_name', label: 'Product' },
    { key: 'generic_name', label: 'Generic' },
    { key: 'form', label: 'Form' },
    { key: 'strength', label: 'Strength' },
    { key: 'mrp', label: 'MRP' },
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
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Products (Medicines)</h2>
          <p className="text-sm text-slate-600">
            Maintain medicine master data as per system documentation.
          </p>
        </div>
      </header>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <header className="mb-3">
          <h3 className="text-sm font-semibold text-slate-800">
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h3>
        </header>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={handleSubmit}>
          <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Product Name
              </label>
              <input
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Generic Name
              </label>
              <input
                name="generic_name"
                value={form.generic_name}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Strength
              </label>
              <input
                name="strength"
                value={form.strength}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Form</label>
            <input
              name="form"
              value={form.form}
              onChange={handleChange}
              className="w-full"
              placeholder="Tablet / Syrup / Injection"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Packing</label>
            <input
              name="packing"
              value={form.packing}
              onChange={handleChange}
              className="w-full"
              placeholder="10x10 etc."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Barcode</label>
            <input
              name="barcode"
              value={form.barcode}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">MRP</label>
            <input
              name="mrp"
              type="number"
              step="0.01"
              value={form.mrp}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Purchase Price
            </label>
            <input
              name="purchase_price"
              type="number"
              step="0.01"
              value={form.purchase_price}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Selling Price
            </label>
            <input
              name="selling_price"
              type="number"
              step="0.01"
              value={form.selling_price}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_prescription_required"
              type="checkbox"
              name="is_prescription_required"
              checked={form.is_prescription_required}
              onChange={handleChange}
            />
            <label
              htmlFor="is_prescription_required"
              className="text-xs font-medium text-slate-700"
            >
              Prescription Required
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="is_controlled"
              type="checkbox"
              name="is_controlled"
              checked={form.is_controlled}
              onChange={handleChange}
            />
            <label htmlFor="is_controlled" className="text-xs font-medium text-slate-700">
              Controlled Medicine
            </label>
          </div>

          <div className="col-span-1 md:col-span-3 flex justify-end gap-2 mt-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyProduct);
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
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </section>

      <section aria-label="Products list">
        {loading ? (
          <p className="text-sm text-slate-500">Loading products…</p>
        ) : (
          <DataTable columns={columns} data={products} />
        )}
      </section>
    </main>
  );
};

export default ProductsPage;
