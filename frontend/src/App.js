import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import RestaurantMenu from './pages/RestaurantMenu';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
import OrdersPage from './pages/OrdersPage';

// Login / Register screens are owned by a separate ticket — placeholders for now.
const Login = () => <div style={{ padding: '2rem' }}><h2>Login Page</h2></div>;
const Register = () => <div style={{ padding: '2rem' }}><h2>Register Page</h2></div>;

const App = () => {
  return (
      <ThemeProvider>
        <Router>
          {/* CartProvider wraps the app so the navbar badge, the menu's "Add to
              cart" button and the cart/checkout pages share one cart. */}
          <CartProvider>
            {/* Navbar sits outside Routes so it stays visible on every page. */}
            <Navbar />

            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/restaurant/:id" element={<RestaurantMenu />} />

                {/* PRS-160 — cart & checkout. Checkout requires a logged-in user. */}
                <Route path="/cart" element={<CartPage />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />

                {/* PRS-158 — past orders. Requires a logged-in user. */}
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </CartProvider>
        </Router>
      </ThemeProvider>
  );
};

export default App;
