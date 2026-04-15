import { useEffect, useState } from 'react';
import { deliveryApi, orderApi } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const STATUS_LABELS = {
  en_attente: 'En attente',
  payee: 'Payee',
  expediee: 'Expediee',
  livree: 'Livree',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadOrders = async () => {
    try {
      const res = user?.role === 'admin' ? await orderApi.getAll() : await orderApi.getMine();
      setOrders(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user?.role]);

  const handleCreateOrder = async () => {
    if (!items.length) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await orderApi.create({
        items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      });
      clearCart();
      setSuccess(`Commande creee: ${res.data.id}`);
      setLoading(true);
      await loadOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async (orderId, method) => {
    setError('');
    setSuccess('');
    try {
      await deliveryApi.processPayment({
        order_id: orderId,
        method,
        card_number: method === 'carte' ? '4242424242424242' : null,
      });
      setSuccess(`Paiement ${method} valide pour la commande ${orderId.slice(0, 8)}`);
      setLoading(true);
      await loadOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
        <p className="text-sm text-gray-500">
          Panier, commande multi-vendeurs et simulation de paiement.
        </p>
      </div>

      {(error || success) && (
        <div className="space-y-2">
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          {success && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>}
        </div>
      )}

      {user?.role === 'client' && (
        <section className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Panier</h2>
            <span className="text-sm text-gray-500">{items.length} produit(s)</span>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Ton panier est vide.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-4">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.price.toFixed(2)} EUR</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                      className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <p className="font-semibold">Total: {totalPrice.toFixed(2)} EUR</p>
                <button
                  onClick={handleCreateOrder}
                  disabled={submitting}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {submitting ? 'Validation...' : 'Passer la commande'}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="rounded-2xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {user?.role === 'admin' ? 'Toutes les commandes' : 'Mes commandes'}
          </h2>
          {loading && <span className="text-sm text-gray-400">Chargement...</span>}
        </div>

        {!loading && orders.length === 0 && (
          <p className="text-sm text-gray-500">Aucune commande disponible.</p>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-gray-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">Commande #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">
                    Statut: {STATUS_LABELS[order.status] || order.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{Number(order.total_amount).toFixed(2)} EUR</p>
                  {order.created_at && (
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>

              {user?.role === 'client' && order.status === 'en_attente' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => handlePayment(order.id, 'carte')}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
                  >
                    Payer par carte
                  </button>
                  <button
                    onClick={() => handlePayment(order.id, 'paypal')}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
                  >
                    Payer par PayPal
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
