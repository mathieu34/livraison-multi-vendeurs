import { useEffect, useState } from 'react';
import { productApi } from '../services/api';

export default function CataloguePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    productApi.getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    productApi
      .getAll(selectedCategory ? { categoryId: selectedCategory } : {})
      .then((res) => setProducts(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Catalogue produits</h1>

      {/* Filtre catégorie */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1 rounded-full text-sm border ${
            selectedCategory === '' ? 'bg-primary text-white border-primary' : 'border-gray-300'
          }`}
        >
          Tous
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-sm border ${
              selectedCategory === cat.id
                ? 'bg-primary text-white border-primary'
                : 'border-gray-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
            <h2 className="font-semibold text-gray-800 truncate">{p.name}</h2>
            <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
              <span className="font-bold text-primary">{Number(p.price).toFixed(2)} €</span>
              <span className={`text-xs ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {p.stock > 0 ? `Stock : ${p.stock}` : 'Rupture'}
              </span>
            </div>
            <p className="text-xs text-gray-400">Vendeur : {p.vendor_name}</p>
          </div>
        ))}
      </div>

      {!loading && products.length === 0 && (
        <p className="text-gray-400 text-center mt-10">Aucun produit disponible.</p>
      )}
    </div>
  );
}
