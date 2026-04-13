import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ChatBot from './components/ChatBot';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductNewPage from './pages/ProductNewPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderListPage from './pages/OrderListPage';
import CommunityPage from './pages/CommunityPage';
import CommunityDetailPage from './pages/CommunityDetailPage';
import MyPage from './pages/MyPage/index';
import PlantEncyclopediaPage from './pages/PlantEncyclopediaPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionOptionsPage from './pages/SubscriptionOptionsPage';
import SubscriptionCheckoutPage from './pages/SubscriptionCheckoutPage';
import NoticePage from './pages/NoticePage';
// LocalTradePage removed - 지역거래 is now a community category
import LocalFestivalPage from './pages/LocalFestivalPage';
import PlantDiagnosisPage from './pages/PlantDiagnosisPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import ServicePage from './pages/ServicePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/new" element={<ProductNewPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrderListPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/:id" element={<CommunityDetailPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/plants" element={<PlantEncyclopediaPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/subscription/options" element={<SubscriptionOptionsPage />} />
            <Route path="/subscription/checkout" element={<SubscriptionCheckoutPage />} />
            <Route path="/notice" element={<NoticePage />} />
            <Route path="/local-trade" element={<Navigate to="/community" replace />} />
            <Route path="/local-festival" element={<LocalFestivalPage />} />
            <Route path="/diagnosis" element={<PlantDiagnosisPage />} />
            <Route path="/seller" element={<SellerDashboardPage />} />
            <Route path="/service" element={<ServicePage />} />
          </Routes>
        </Layout>
        <ChatBot />
      </Router>
    </AuthProvider>
  );
}

export default App;
