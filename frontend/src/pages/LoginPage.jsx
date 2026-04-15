import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        const res = await authApi.login({ email: form.email, password: form.password });
        login(res.access_token, res.user);
        navigate('/catalogue');
      } else {
        await authApi.register({ name: form.name, email: form.email, password: form.password, role: form.role });
        setTab('login');
        setError('');
        alert('Compte créé ! Connecte-toi.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow p-8">
      <h1 className="text-2xl font-bold text-center mb-6">LiveMarket</h1>

      {/* Tabs */}
      <div className="flex mb-6 border-b">
        {['login', 'register'].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(''); }}
            className={`flex-1 pb-2 text-sm font-medium transition-colors ${
              tab === t ? 'border-b-2 border-primary text-primary' : 'text-gray-400'
            }`}
          >
            {t === 'login' ? 'Connexion' : 'Inscription'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {tab === 'register' && (
          <input
            name="name" value={form.name} onChange={handle} placeholder="Nom complet"
            required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}
        <input
          name="email" type="email" value={form.email} onChange={handle} placeholder="Email"
          required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          name="password" type="password" value={form.password} onChange={handle} placeholder="Mot de passe"
          required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {tab === 'register' && (
          <select
            name="role" value={form.role} onChange={handle}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="client">Client</option>
            <option value="vendeur">Vendeur</option>
            <option value="livreur">Livreur</option>
          </select>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Chargement...' : tab === 'login' ? 'Se connecter' : "S'inscrire"}
        </button>
      </form>
    </div>
  );
}
