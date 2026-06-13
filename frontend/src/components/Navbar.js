import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import CartButton from './CartButton';
import { useTheme } from '../context/ThemeContext';
import { getCurrentUser, clearCurrentUser, isAuthenticated } from '../utils/auth';
import siteLogo from '../assets/WoltClone_Logo.png';
import './Navbar.css';

/**
 * Extracts initials from user name or email for the avatar.
 */
const initialsOf = (user) => {
    const source = (user?.displayName || user?.username || user?.name || user?.email || '?').trim();
    const parts = source.split(/\s+/);
    const letters = parts.length > 1
        ? parts[0][0] + parts[parts.length - 1][0]
        : source.slice(0, 2);
    return letters.toUpperCase();
};

const Navbar = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const loggedIn = isAuthenticated();
    const [user, setUser] = useState(() => getCurrentUser());

    useEffect(() => {
        const handleUserUpdated = () => setUser(getCurrentUser());
        window.addEventListener('user_updated', handleUserUpdated);
        return () => window.removeEventListener('user_updated', handleUserUpdated);
    }, []);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setDropdownOpen(false);
        clearCurrentUser();
        navigate('/');
    };

    const handleProfileClick = () => {
        setDropdownOpen(false);
        navigate('/profile');
    };

    return (
        <nav className="navbar">
            <div>
                <Link to="/" className="navbar-brand">
                    <img 
                        src={siteLogo} 
                        alt="WoltClone Logo" 
                        style={{ 
                            height: '65px', 
                            margin: '-12px 0',
                            display: 'block',
                            filter: isDarkMode ? 'brightness(0) invert(1)' : 'none',
                            transition: 'filter 0.3s ease'
                        }} 
                    />
                </Link>
            </div>

            <SearchBar />

            <div className="navbar-actions">
                {/* Theme Toggle */}
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

                {loggedIn && <Link to="/orders" className="navbar-link">Your Orders</Link>}
                {loggedIn && <Link to="/add-restaurant" className="navbar-link">+ Add Restaurant</Link>}

                <CartButton />

                {/* User Dropdown or Login/Register links */}
                {loggedIn ? (
                    <div className="user-dropdown" ref={dropdownRef}>
                        <button
                            className="user-dropdown__trigger"
                            onClick={() => setDropdownOpen(prev => !prev)}
                            aria-expanded={dropdownOpen}
                            aria-label="User menu"
                        >
                            {/* SVG chevron — centered via flex in CSS */}
                            <span className={`user-dropdown__chevron ${dropdownOpen ? 'open' : ''}`}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </span>

                            {/* Avatar */}
                            <div className="profile-avatar">
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt={user.displayName || user.username} />
                                ) : (
                                    <span>{initialsOf(user)}</span>
                                )}
                            </div>
                        </button>

                        {dropdownOpen && (
                            <div className="user-dropdown__menu">
                                <div className="user-dropdown__header">
                                    <strong>{user?.displayName || user?.username || 'User'}</strong>
                                </div>
                                <hr className="user-dropdown__divider" />
                                <button
                                    className="user-dropdown__item"
                                    onClick={handleProfileClick}
                                >
                                    👤 Profile
                                </button>
                                <button
                                    className="user-dropdown__item user-dropdown__item--danger"
                                    onClick={handleLogout}
                                >
                                    🚪 Log Out
                                </button>
                            </div>
                        )}
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