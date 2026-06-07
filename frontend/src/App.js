import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RestaurantMenu from './pages/RestaurantMenu';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
import ProtectedRoute from './components/ProtectedRoute';
import CartButton from './components/CartButton';
import { CartProvider } from './context/CartContext';

// Placeholder components (will be moved to their own files in the /pages directory later)
const Home = () => <div><h2>Home Page (Restaurant Feed)</h2></div>;
const Login = () => <div><h2>Login Page</h2></div>;
const Register = () => <div><h2>Register Page</h2></div>;

// Placeholder Navbar (will be moved to /components). PRS-160 adds the cart entry point.
const Navbar = () => (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      background: '#e0e0e0',
      marginBottom: '1rem',
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <h3 style={{ margin: 0 }}>Wolt Clone</h3>
      </Link>
      <CartButton />
    </nav>
);

const App = () => {
  return (
      <Router>
        {/* CartProvider wraps the whole app so the navbar cart badge, the menu's
            "Add to cart" button and the cart/checkout pages share one cart. */}
        <CartProvider>
          {/* The Navbar is placed OUTSIDE the Routes block.
          This ensures it remains visible on the screen regardless of which page the user is on.
        */}
          <Navbar />

          {/* The Routes block defines the dynamic area of the application.
          Only one of these Route components will be rendered at a time, based on the current URL.
        */}
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* The ':id' is a dynamic URL parameter.
              When navigating to '/restaurant/5', the RestaurantMenu component can extract the ID '5'.
            */}
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
            </Routes>
          </main>
        </CartProvider>
      </Router>
  );
};

export default App;
