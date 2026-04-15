import { useEffect, useMemo, useState } from 'react';
import { deliveryApi, orderApi } from '../services/api';

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [livreurs, setLivreurs] = useState([]);
  const [form, setForm] = useState({
    order_id: '',
    livreur_id: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      const [ordersRes, livreursRes] = await Promise.all([
        orderApi.getAll(),
        deliveryApi.getAvailableLivreurs(),
      ]);
      setOrders(ordersRes.data);
      setLivreurs(livreursRes.data);
      setForm((prev) => ({
        ...prev,
        order_id: prev.order_id || ordersRes.data[0]?.id || '',
        livreur_id: prev.livreur_id || livreursRes.data[0]?.id || '',
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(
    () => ({
      orders: orders.length,
      revenue: orders.reduce((sum, order) => sum + Number(order.total_amount), 0),
      pending: orders.filter((order) => order.status === 'en_attente').length,
      paid: orders.filter((order) => order.status === 'payee').length,
    }),
    [orders]
  );

  const formatOrderLabel = (order) =>
    `Commande #${order.id.slice(0, 8)} - ${Number(order.total_amount).toFixed(2)} EUR - ${order.status}`;

  const handleAssign = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await deliveryApi.assign(form);
      setSuccess(`Livraison assignee: ${res.data.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
        <p className="text-sm text-gray-500">Vue globale des commandes et attribution des livreurs.</p>
      </div>

      {(error || success) && (
        <div className="space-y-2">
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          {success && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Commandes</p>
          <p className="mt-2 text-2xl font-bold">{stats.orders}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">CA cumule</p>
          <p className="mt-2 text-2xl font-bold">{stats.revenue.toFixed(2)} EUR</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">En attente</p>
          <p className="mt-2 text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Payees</p>
          <p className="mt-2 text-2xl font-bold">{stats.paid}</p>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Attribuer un livreur</h2>
        <form onSubmit={handleAssign} className="grid gap-4 md:grid-cols-3">
          <select
            value={form.order_id}
            onChange={(e) => setForm({ ...form, order_id: e.target.value })}
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm"
          >
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {formatOrderLabel(order)}
              </option>
            ))}
          </select>
          <select
            value={form.livreur_id}
            onChange={(e) => setForm({ ...form, livreur_id: e.target.value })}
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm"
          >
            {livreurs.map((livreur) => (
              <option key={livreur.id} value={livreur.id}>
                {livreur.name} ({livreur.active_deliveries} actives)
              </option>
            ))}
          </select>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Adresse de livraison"
            required
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm"
          />
          <div className="md:col-span-3">
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Creer la livraison
            </button>
          </div>
        </form>
        {!loading && orders.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">Aucune commande disponible pour attribution.</p>
        )}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Historique des commandes</h2>
          {loading && <span className="text-sm text-gray-400">Chargement...</span>}
        </div>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-gray-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">Commande #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">Client: {order.client_id?.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{Number(order.total_amount).toFixed(2)} EUR</p>
                  <p className="text-sm text-gray-500">{order.status}</p>
                </div>
              </div>
            </div>
          ))}
          {!loading && orders.length === 0 && <p className="text-sm text-gray-500">Aucune commande.</p>}
        </div>
      </section>
    </div>
  );
}
