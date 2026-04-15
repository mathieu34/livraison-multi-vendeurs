import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { productApi } from '../services/api';

export default function CataloguePage() {
  const { user } = useAuth();
  const { addItem } = useCart();
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
    setError(null);
    productApi
      .getAll(selectedCategory ? { category_id: selectedCategory } : {})
      .then((res) => setProducts(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Catalogue produits</h1>
          <p className="text-sm text-gray-500">
            Catalogue public avec categories, stock et ajout au panier pour les clients.
          </p>
        </div>
      </div>

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
              selectedCategory === cat.id ? 'bg-primary text-white border-primary' : 'border-gray-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow">
            <h2 className="truncate font-semibold text-gray-800">{product.name}</h2>
            <p className="line-clamp-2 text-xs text-gray-500">{product.description}</p>
            <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="font-bold text-primary">{Number(product.price).toFixed(2)} EUR</span>
              <span className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `Stock : ${product.stock}` : 'Rupture'}
              </span>
            </div>
            <p className="text-xs text-gray-400">Vendeur : {product.vendor_name}</p>
            {user?.role === 'client' && product.stock > 0 && (
              <button
                onClick={() => addItem(product)}
                className="mt-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Ajouter au panier
              </button>
            )}
          </div>
        ))}
      </div>

      {!loading && products.length === 0 && (
        <p className="mt-10 text-center text-gray-400">Aucun produit disponible.</p>
      )}
    </div>
  );
}
