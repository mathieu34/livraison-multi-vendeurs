import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CataloguePage from './pages/CataloguePage';
import DashboardPage from './pages/DashboardPage';
import DeliveryTrackingPage from './pages/DeliveryTrackingPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/catalogue" replace />} />
            <Route path="/catalogue" element={<CataloguePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/suivi/:deliveryId" element={<DeliveryTrackingPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
