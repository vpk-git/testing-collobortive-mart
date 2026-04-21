/**
 * App.jsx — React Router configuration
 *
 * WHAT CHANGED IN SPRINT 3:
 * - Added imports for Checkout, OrderConfirmation, and MyOrders
 * - Added three new routes inside <ProtectedRoute> (auth required):
 *     /checkout            → Checkout page
 *     /order-confirmation  → Order success page
 *     /orders              → My orders history
 *
 * Everything else is UNCHANGED from Sprint 2.
 *
 * WHY ARE THESE ROUTES INSIDE <ProtectedRoute>?
 *   ProtectedRoute checks if there's a valid JWT token.
 *   You can't place an order or view your orders without being logged in.
 *   If an unauthenticated user tries to visit /checkout, they get
 *   redirected to /login automatically.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// ── Existing pages (UNCHANGED) ──
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Catalogue from './pages/Catalogue'
import ProductDetail from './pages/ProductDetail'
import SearchResults from './pages/SearchResults'
import CategoryPage from './pages/CategoryPage'
import Dashboard from './pages/Dashboard'
import Cart from './pages/Cart'

// ── NEW: Sprint 3 order pages ──
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import MyOrders from './pages/Myorders'

// ── Producer pages (UNCHANGED) ──
import ProducerDashboard from './pages/producer/ProducerDashboard'
import ManageProducts from './pages/producer/ManageProducts'
import CreateProduct from './pages/producer/CreateProduct'
import EditProduct from './pages/producer/EditProduct'
import UploadImages from './pages/producer/UploadImages'
import ProducerOrders from './pages/producer/ProducerOrders'

// ── Route guards (UNCHANGED) ──
import ProtectedRoute from './components/ProtectedRoute'
import ProducerRoute from './components/ProducerRoute'

// ── Chat widget (UNCHANGED) ──
import ChatWidget from './components/chat/ChatWidget'

// SmartRedirect: decides where to send the user based on their role
function SmartRedirect() {
  const { token, role } = useAuth()
  if (!token) return <Navigate to="/home" replace />
  if (role === 'PRODUCER') return <Navigate to="/producer/dashboard" replace />
  return <Navigate to="/home" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — accessible to everyone */}
        <Route path="/" element={<SmartRedirect />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/category/:slug" element={<CategoryPage />} />

        {/* Protected routes — require valid JWT (any role) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cart" element={<Cart />} />

          {/* ── NEW Sprint 3 routes ── */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/orders" element={<MyOrders />} />
        </Route>

        {/* Producer-only routes — require role === 'PRODUCER' */}
        <Route element={<ProducerRoute />}>
          <Route path="/producer/dashboard" element={<ProducerDashboard />} />
          <Route path="/producer/products" element={<ManageProducts />} />
          <Route path="/producer/products/create" element={<CreateProduct />} />
          <Route path="/producer/products/:id/edit" element={<EditProduct />} />
          <Route path="/producer/products/:id/images" element={<UploadImages />} />
          <Route path="/producer/orders" element={<ProducerOrders />} />
        </Route>

        {/* Catch-all: any unknown URL → smart redirect */}
        <Route path="*" element={<SmartRedirect />} />
      </Routes>

      {/* Chat widget floats above all pages */}
      <ChatWidget />
    </BrowserRouter>
  )
}