import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Real components imported from PRS-158 branch
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import RestaurantMenu from './pages/RestaurantMenu';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
import OrdersPage from './pages/OrdersPage';

// Login and Register screens are still placeholders
const Login = () => <div style={{ padding: '2rem' }}><h2>Login Page</h2></div>;
const Register = () => <div style={{ padding: '2rem' }}><h2>Register Page</h2></div>;

const App = () => {
  return (
    <ThemeProvider>
      {/* CartProvider wraps the Router to make cart state globally accessible */}
      <CartProvider>
        <Router>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Maintained dynamic URL parameters from main branch architecture */}
              <Route path="/restaurant/:id" element={<RestaurantMenu />} />
              <Route path="/search/:query" element={<SearchResults />} />

              {/* Integrated order and checkout routes from PRS-158 */}
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
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
};

export default App;