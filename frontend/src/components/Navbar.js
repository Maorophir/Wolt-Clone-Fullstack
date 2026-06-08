import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import CartButton from './CartButton';
import { useTheme } from '../context/ThemeContext';
import { getCurrentUser, clearCurrentUser, isAuthenticated } from '../utils/auth';
import './Navbar.css';

/**
 * Extracts initials from user name or email for the avatar.
 */
const initialsOf = (user) => {
    const source = (user?.name || user?.email || '?').trim();
    const parts = source.split(/\s+/);
    const letters = parts.length > 1
        ? parts[0][0] + parts[parts.length - 1][0]
        : source.slice(0, 2);
    return letters.toUpperCase();
};

const Navbar = () => {
    // Using our precise ThemeContext variables from the main branch
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    
    // Auth state from the PRS-158 branch
    const loggedIn = isAuthenticated();
    const user = getCurrentUser();

    // Handles clearing the session and redirecting
    const handleLogout = () => {
        clearCurrentUser();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div>
                <Link to="/" className="navbar-brand">WoltClone</Link>
            </div>

            {/* Using the extracted SearchBar component from PRS-158 instead of inline form */}
            <SearchBar />

            <div className="navbar-actions">
                {/* Theme Toggle from main branch */}
                <button 
                    type="button" 
                    className="theme-toggle-btn" 
                    onClick={toggleTheme}
                    title="Toggle theme"
                >
                    {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>

                {loggedIn && <Link to="/orders" className="navbar-link">My orders</Link>}

                {/* Cart component from PRS-158 */}
                <CartButton />

                {/* Conditional rendering based on Auth state */}
                {loggedIn ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '1rem' }}>
                        <span style={{ background: '#00C2E8', padding: '6px 10px', borderRadius: '50%', color: '#fff', fontWeight: 'bold' }}>
                            {initialsOf(user)}
                        </span>
                        <span style={{ fontWeight: 'bold' }}>{user?.name || user?.email}</span>
                        <button type="button" onClick={handleLogout} style={{ marginLeft: '10px', cursor: 'pointer', padding: '5px 10px' }}>
                            Log out
                        </button>
                    </div>
                ) : (
                    <>
                        <Link to="/login" className="navbar-link">Login</Link>
                        <Link to="/register" className="navbar-link">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;