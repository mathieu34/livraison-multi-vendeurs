import { useEffect, useState } from 'react';
import { deliveryApi, productApi } from '../services/api';

const STATUS_LABELS = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  assignee:   { label: 'Assignée',   color: 'bg-blue-100 text-blue-800' },
  en_cours:   { label: 'En cours',   color: 'bg-indigo-100 text-indigo-800' },
  livree:     { label: 'Livrée',     color: 'bg-green-100 text-green-800' },
  annulee:    { label: 'Annulée',    color: 'bg-red-100 text-red-800' },
};

export default function DashboardPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    deliveryApi
      .getMyDeliveries()
      .then((res) => setDeliveries(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await deliveryApi.updateStatus(id, newStatus);
      setDeliveries((prev) => prev.map((d) => (d.id === id ? res.data : d)));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard Livreur</h1>

      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && deliveries.length === 0 && (
        <p className="text-gray-400 text-center mt-10">Aucune livraison assignée.</p>
      )}

      <div className="space-y-3">
        {deliveries.map((d) => {
          const s = STATUS_LABELS[d.status] || {};
          return (
            <div key={d.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-800 text-sm truncate max-w-xs">{d.address}</p>
                <p className="text-xs text-gray-400 mt-0.5">Commande #{d.order_id?.slice(0, 8)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                  {s.label}
                </span>
                {d.status === 'assignee' && (
                  <button
                    onClick={() => handleStatusChange(d.id, 'en_cours')}
                    className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
                  >
                    Démarrer
                  </button>
                )}
                {d.status === 'en_cours' && (
                  <button
                    onClick={() => handleStatusChange(d.id, 'livree')}
                    className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                  >
                    Marquer livrée
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
