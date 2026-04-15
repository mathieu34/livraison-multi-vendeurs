import { useAuth } from '../contexts/AuthContext';

const roleLabels = {
  client: 'Client',
  vendeur: 'Vendeur',
  livreur: 'Livreur',
  admin: 'Administrateur',
};

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
        <p className="text-sm text-gray-500">Informations du compte connecte.</p>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Nom</p>
            <p className="mt-1 font-medium text-gray-900">{user?.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="mt-1 font-medium text-gray-900">{user?.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="mt-1 font-medium text-gray-900">{roleLabels[user?.role] || user?.role || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Identifiant</p>
            <p className="mt-1 break-all font-mono text-sm text-gray-700">{user?.id || '-'}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
