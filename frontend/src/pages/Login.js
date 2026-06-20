import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import './Login.css';

export default function Login() {
    const {
        formData,
        errors,
        isLoading,
        handleInputChange,
        submitForm
    } = useLogin();

    const usernameRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (usernameRef.current) {
            usernameRef.current.focus();
        }
    }, []);

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <div className="auth-logo">
                    <h1 className="auth-logo-text">WoltClone</h1>
                </div>
                <h2 className="auth-title">Log in to your account</h2>

                {errors.submit && <div className="auth-error-box">{errors.submit}</div>}

                <form onSubmit={submitForm} className="auth-form">
                    <div className="auth-input-group">
                        <label className="auth-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            ref={usernameRef}
                            value={formData.username}
                            onChange={handleInputChange}
                            className="auth-input"
                            placeholder="Enter your username"
                            disabled={isLoading}
                        />
                        {errors.username && <span className="auth-error">{errors.username}</span>}
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="auth-input"
                                placeholder="Enter your password"
                                disabled={isLoading}
                            />
                            <button 
                                type="button" 
                                className="password-toggle-btn" 
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                tabIndex="-1"
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                        {errors.password && <span className="auth-error">{errors.password}</span>}
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Log In'}
                    </button>

                    <div className="auth-divider">or</div>

                    <div className="auth-link-text">
                        <span>Don't have an account yet? </span>
                        <Link to="/register" className="auth-link">Sign up here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}