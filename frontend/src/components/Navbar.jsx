import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/catalogue', label: 'Catalogue' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight">LiveMarket</span>
        <div className="flex gap-6">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium hover:opacity-80 transition-opacity ${
                pathname.startsWith(to) ? 'underline underline-offset-4' : ''
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
