import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="quotations" element={<div className="text-2xl">Quotations - Coming Soon</div>} />
          <Route path="sales" element={<div className="text-2xl">Sales - Coming Soon</div>} />
          <Route path="customers" element={<div className="text-2xl">Customers - Coming Soon</div>} />
          <Route path="products" element={<div className="text-2xl">Products - Coming Soon</div>} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<div className="text-2xl">Settings - Coming Soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
