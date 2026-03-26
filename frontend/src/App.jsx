import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MessagesPage from './pages/MessagesPage';
import './index.css';

// Redirect sellers/admins away from buyer-only pages
const BuyerRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'SELLER') return <Navigate to="/seller" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return children;
};

// Home page routes based on role
const HomeRoute = () => {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user?.role === 'SELLER') return <Navigate to="/seller" replace />;
  if (isAuthenticated && user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <HomePage />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: 'Inter, sans-serif',
                borderRadius: '10px',
                padding: '12px 20px',
              },
              success: {
                style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
              },
              error: {
                style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
              },
            }}
          />
          <Navbar />
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomeRoute />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Buyer-only routes — sellers get auto-redirected to /seller */}
              <Route path="/shop" element={<BuyerRoute><ShopPage /></BuyerRoute>} />
              <Route path="/products/:id" element={<BuyerRoute><ProductDetailPage /></BuyerRoute>} />
              <Route path="/cart" element={<BuyerRoute><CartPage /></BuyerRoute>} />
              <Route path="/checkout" element={<BuyerRoute><CheckoutPage /></BuyerRoute>} />
              <Route path="/order-success" element={<BuyerRoute><OrderSuccessPage /></BuyerRoute>} />
              <Route path="/orders" element={<BuyerRoute><OrdersPage /></BuyerRoute>} />
              <Route path="/wishlist" element={<BuyerRoute><WishlistPage /></BuyerRoute>} />

              {/* Role-specific dashboards */}
              <Route path="/seller" element={<SellerDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />

              {/* Shared routes */}
              <Route path="/messages" element={<MessagesPage />} />
            </Routes>
          </main>
          <Footer />
          <SpeedInsights />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
