import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { deliveryApi } from '../services/api';

const STEPS = [
  { key: 'en_attente', label: 'Commande reçue' },
  { key: 'assignee',   label: 'Livreur assigné' },
  { key: 'en_cours',   label: 'En cours de livraison' },
  { key: 'livree',     label: 'Livrée' },
];

export default function DeliveryTrackingPage() {
  const { deliveryId } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = () =>
      deliveryApi
        .track(deliveryId)
        .then((res) => setDelivery(res.data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));

    fetch();

    // Rafraîchissement toutes les 10s (polling — remplacer par WebSocket en bonus)
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, [deliveryId]);

  const currentStep = STEPS.findIndex((s) => s.key === delivery?.status);

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Suivi de livraison</h1>

      {loading && <p className="text-gray-500">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {delivery && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-500">Adresse de livraison</p>
            <p className="font-medium">{delivery.address}</p>
          </div>

          {delivery.livreur_name && (
            <div>
              <p className="text-sm text-gray-500">Livreur</p>
              <p className="font-medium">{delivery.livreur_name}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="relative">
            {STEPS.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={step.key} className="flex items-start gap-3 mb-4 last:mb-0">
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                      done
                        ? 'bg-primary border-primary'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {done && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${active ? 'font-semibold text-primary' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {delivery.delivered_at && (
            <p className="text-xs text-gray-400">
              Livré le {new Date(delivery.delivered_at).toLocaleString('fr-FR')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
