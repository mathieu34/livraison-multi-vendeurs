import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CataloguePage from './pages/CataloguePage';
import DashboardPage from './pages/DashboardPage';
import DeliveryTrackingPage from './pages/DeliveryTrackingPage';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import VendorProductsPage from './pages/VendorProductsPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/catalogue" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/catalogue" element={<CataloguePage />} />
            <Route
              path="/commandes"
              element={
                <ProtectedRoute roles={['client', 'admin']}>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendeur"
              element={
                <ProtectedRoute roles={['vendeur', 'admin']}>
                  <VendorProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={['livreur', 'admin']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profil"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/suivi/:deliveryId" element={<DeliveryTrackingPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
