import React, { useEffect, useRef } from 'react';
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
    } = useLogin;

    const usernameRef = useRef(null);

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
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="auth-input"
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
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