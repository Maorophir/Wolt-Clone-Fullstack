import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef(null);
    const navigate = useNavigate();

    // Handle the search form submission
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search/${searchQuery.trim()}`);
            setSearchQuery('');
            searchInputRef.current.blur();
        }
    };

    return (
        <nav className="navbar">
            <div>
                <Link to="/" className="navbar-brand">Wolt</Link>
            </div>

            <form className="navbar-search" onSubmit={handleSearch}>
                <input
                    type="text"
                    ref={searchInputRef}
                    placeholder="Search restaurants or products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>

            <div className="navbar-actions">
                <Link to="/login" className="navbar-link">Login</Link>
                <Link to="/register" className="navbar-link">Register</Link>

                <button className="theme-toggle-btn" onClick={toggleTheme}>
                    {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;