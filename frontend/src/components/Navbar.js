import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import CartButton from './CartButton';
import { useTheme } from '../context/ThemeContext';
import { getCurrentUser, clearCurrentUser, isAuthenticated } from '../utils/auth';
import './Navbar.css';

const initialsOf = (user) => {
    const source = (user?.name || user?.email || '?').trim();
    const parts = source.split(/\s+/);
    const letters = parts.length > 1
        ? parts[0][0] + parts[parts.length - 1][0]
        : source.slice(0, 2);
    return letters.toUpperCase();
};

/**
 * PRS-158 — Top navigation bar, present on every screen.
 *
 * Holds the brand, the search box, the theme toggle, the cart entry point, and
 * the user area (name + log out when authenticated, otherwise a log-in link).
 * Logging out clears the session and returns to the login screen.
 */
const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const loggedIn = isAuthenticated();
    const user = getCurrentUser();

    const handleLogout = () => {
        clearCurrentUser();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar__brand">Wolt<span>Clone</span></Link>

            <SearchBar />

            <div className="navbar__actions">
                <button
                    type="button"
                    className="navbar__icon-btn"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    title="Toggle theme"
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>

                {loggedIn && <Link to="/orders" className="navbar__link">My orders</Link>}

                <CartButton />

                {loggedIn ? (
                    <div className="navbar__user">
                        <span className="navbar__avatar" aria-hidden="true">{initialsOf(user)}</span>
                        <span className="navbar__username">{user?.name || user?.email}</span>
                        <button type="button" className="navbar__logout" onClick={handleLogout}>
                            Log out
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="navbar__login">Log in</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
