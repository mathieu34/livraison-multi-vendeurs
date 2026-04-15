import { useEffect, useState } from 'react';
import { productApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category_id: '',
};

export default function VendorProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productApi.getAll({ vendor_id: user.id }),
        productApi.getCategories(),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        category_id: form.category_id || null,
      };

      if (editingId) {
        await productApi.update(editingId, payload);
      } else {
        await productApi.create(payload);
      }

      resetForm();
      setLoading(true);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      stock: String(product.stock),
      category_id: product.category_id || '',
    });
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await productApi.remove(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Espace vendeur</h1>
        <p className="text-sm text-gray-500">Ajout, modification et gestion du stock des produits.</p>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? 'Modifier un produit' : 'Ajouter un produit'}
        </h2>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nom du produit"
            required
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm"
          />
          <input
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="Prix"
            type="number"
            min="0.01"
            step="0.01"
            required
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            className="min-h-28 rounded-xl border border-gray-300 px-4 py-3 text-sm md:col-span-2"
          />
          <input
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            placeholder="Stock"
            type="number"
            min="0"
            required
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm"
          />
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm"
          >
            <option value="">Sans categorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : editingId ? 'Mettre a jour' : 'Ajouter'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mes produits</h2>
          {loading && <span className="text-sm text-gray-400">Chargement...</span>}
        </div>

        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 p-4">
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">
                  {Number(product.price).toFixed(2)} EUR - Stock: {product.stock}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(product)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {!loading && products.length === 0 && (
            <p className="text-sm text-gray-500">Aucun produit pour ce vendeur.</p>
          )}
        </div>
      </section>
    </div>
  );
}
