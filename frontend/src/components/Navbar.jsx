import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { pathname } = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();

  const links = [
    { to: '/catalogue', label: 'Catalogue', visible: true },
    {
      to: '/commandes',
      label: user?.role === 'admin' ? 'Commandes' : `Panier (${totalItems})`,
      visible: ['client', 'admin'].includes(user?.role),
    },
    { to: '/vendeur', label: 'Vendeur', visible: ['vendeur', 'admin'].includes(user?.role) },
    { to: '/dashboard', label: 'Dashboard', visible: ['livreur', 'admin'].includes(user?.role) },
    { to: '/admin', label: 'Admin', visible: user?.role === 'admin' },
    { to: '/profil', label: 'Profil', visible: isAuthenticated },
  ].filter((link) => link.visible);

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/catalogue" className="font-bold text-lg tracking-tight">
          LiveMarket
        </Link>
        <div className="flex items-center gap-6">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-opacity hover:opacity-80 ${
                pathname.startsWith(to) ? 'underline underline-offset-4' : ''
              }`}
            >
              {label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button onClick={logout} className="text-sm font-medium hover:opacity-80">
              Deconnexion
            </button>
          ) : (
            <Link
              to="/login"
              className={`text-sm font-medium hover:opacity-80 ${
                pathname === '/login' ? 'underline underline-offset-4' : ''
              }`}
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
