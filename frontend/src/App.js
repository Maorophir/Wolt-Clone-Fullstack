import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';

// Placeholders for now
const Home = () => <div style={{ padding: '2rem' }}><h2>Home Page (Restaurant Feed)</h2></div>;
const Login = () => <div style={{ padding: '2rem' }}><h2>Login Page</h2></div>;
const Register = () => <div style={{ padding: '2rem' }}><h2>Register Page</h2></div>;
const RestaurantMenu = () => <div style={{ padding: '2rem' }}><h2>Restaurant Menu</h2></div>;
const SearchResults = () => <div style={{ padding: '2rem' }}><h2>Search Results</h2></div>;

const App = () => {
    return (
        <ThemeProvider>
            <Router>
                <Navbar />
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/restaurant/:id" element={<RestaurantMenu />} />
                        <Route path="/search/:query" element={<SearchResults />} />
                    </Routes>
                </main>
            </Router>
        </ThemeProvider>
    );
};

export default App;
