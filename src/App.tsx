import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ItemsPage from './pages/ItemsPage';

function PrivateRoutes() {
  const { secret } = useAuth();
  if (!secret) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Routes>
        <Route index element={<Navigate to="/orders" replace />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:uuid" element={<OrderDetailPage />} />
        <Route path="items" element={<ItemsPage />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<PrivateRoutes />} />
      </Routes>
    </AuthProvider>
  );
}
