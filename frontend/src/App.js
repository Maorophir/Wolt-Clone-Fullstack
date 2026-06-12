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
import Login from './pages/Login';
import Register from './pages/Register';
import AddRestaurant from './pages/AddRestaurant';
import Profile from './pages/Profile';

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
             
              <Route
                path="/add-restaurant"
                element={
                  <ProtectedRoute>
                    <AddRestaurant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Maintained dynamic URL parameters from main branch architecture */}
              <Route path="/restaurant/:id" element={<RestaurantMenu />} />
              <Route path="/search/" element={<SearchResults />} />

              {/* Integrated order and checkout routes from*/}
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