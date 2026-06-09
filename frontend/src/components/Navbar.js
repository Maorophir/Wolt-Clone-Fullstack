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
                <Link to="/" className="navbar-brand">
                    <span>Wolt</span>Clone
                </Link>
            </div>

            {/* Using the extracted SearchBar component from PRS-158 instead of inline form */}
            <SearchBar />

            <div className="navbar-actions">
                {/* Theme Toggle from main branch */}
                <label className="theme-switch" aria-label="Toggle theme">
                    <input
                        type="checkbox"
                        checked={isDarkMode}
                        onChange={toggleTheme}
                    />
                    <div className="switch-slider">
                        <div className="switch-thumb">
                            {isDarkMode ? '🌙' : '☀️'}
                        </div>
                    </div>
                </label>

                {loggedIn && <Link to="/orders" className="navbar-link">My orders</Link>}

                {/* Cart component from PRS-158 */}
                <CartButton />

                {/* Conditional rendering based on Auth state */}
                {loggedIn ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '1rem' }}>
                        {/* Profile Picture Circle */}
                        <div className="profile-avatar">
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt={user.displayName || user.username} />
                            ) : (
                                <span>{initialsOf(user)}</span>
                            )}
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{user?.displayName || user?.username || 'User'}</span>
                        <button type="button" onClick={handleLogout} style={{ marginLeft: '10px', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', background: '#ff4757', color: 'white', border: 'none', fontWeight: '600', fontSize: '13px' }}>
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