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
    
    // 1. Split by whitespace for normal names (e.g., "Maor Ophir" -> "MO")
    const parts = source.split(/\s+/);
    if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    
    // 2. If no space, look for CamelCase caps (e.g., "MaorOphir" -> "MO")
    const capitals = source.match(/[A-Z]/g);
    if (capitals && capitals.length >= 2) {
        return (capitals[0] + capitals[capitals.length - 1]).toUpperCase();
    }
    
    // 3. Fallback: just take the first two letters (e.g., "maor" -> "MA")
    return source.slice(0, 2).toUpperCase();
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
                {loggedIn && user?.isBusinessOwner && (
                    <Link to="/add-restaurant" className="navbar-btn-add-restaurant">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Restaurant
                    </Link>
                )}

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
                            {/* Avatar */}
                            <div className="profile-avatar">
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt={user.displayName || user.username} />
                                ) : (
                                    <span>{initialsOf(user)}</span>
                                )}
                            </div>

                            {/* SVG chevron — centered via flex in CSS */}
                            <span className={`user-dropdown__chevron ${dropdownOpen ? 'open' : ''}`}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5"
                                    strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </span>
                        </button>

                        {dropdownOpen && (
                            <div className="user-dropdown__menu">
                                <div className="dropdown-header-container">
                                    <button
                                        className="user-dropdown__header-btn"
                                        onClick={handleProfileClick}
                                    >
                                        <div className="dropdown-header-avatar">
                                            {user?.profileImage ? (
                                                <img src={user.profileImage} alt={user.displayName || user.username} />
                                            ) : (
                                                <span>{initialsOf(user)}</span>
                                            )}
                                        </div>
                                        <div className="dropdown-header-info">
                                            <div className="dropdown-header-name">{user?.displayName || user?.username || 'User'}</div>
                                            <div className="dropdown-header-sub">Profile</div>
                                        </div>
                                        <svg className="dropdown-chevron-right" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </button>
                                </div>
                                
                                <hr className="user-dropdown__divider" />
                                
                                <button
                                    className="user-dropdown__item"
                                    onClick={handleLogout}
                                >
                                    <span className="dropdown-item-text">Log out</span>
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