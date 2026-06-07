import logo from './logo.svg';
import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Placeholder components (will be moved to their own files in the /pages directory later)
const Home = () => <div><h2>Home Page (Restaurant Feed)</h2></div>;
const Login = () => <div><h2>Login Page</h2></div>;
const Register = () => <div><h2>Register Page</h2></div>;
const RestaurantMenu = () => <div><h2>Restaurant Menu</h2></div>;

// Placeholder Navbar (will be moved to /components)
const Navbar = () => (
    <nav style={{ padding: '1rem', background: '#e0e0e0', marginBottom: '1rem' }}>
      <h3>Wolt Clone Navbar</h3>
      {/* Navigation links will go here */}
    </nav>
);

const App = () => {
  return (
      <Router>
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
          </Routes>
        </main>
      </Router>
  );
};

export default App;
