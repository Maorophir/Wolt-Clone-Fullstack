import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';
import './Login.css';

export default function Register() {
    const {
        formData,
        imagePreview,
        errors,
        isLoading,
        successMessage,
        locating,
        handleInputChange,
        handleToggleChange,
        handleImageChange,
        useMyLocation,
        submitForm
    } = useRegister();

    const displayNameRef = useRef(null);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password rule checks
    const pwd = formData.password || '';
    const hasLength = pwd.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);

    useEffect(() => {
        if (displayNameRef.current) {
            displayNameRef.current.focus();
        }
    }, []);

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <div className="auth-logo">
                    <h1 className="auth-logo-text">WoltClone</h1>
                </div>
                <h2 className="auth-title">Create an account</h2>

                {errors.submit && <div className="auth-error-box">{errors.submit}</div>}
                {successMessage && <div className="auth-success-box">{successMessage}</div>}

                <form onSubmit={submitForm} className="auth-form">

                    {/* Profile Image Upload */}
                    <div className="auth-image-group">
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '12px' }}>
                            Profile Picture (Optional)
                        </label>
                        <div className={`auth-image-preview ${!imagePreview ? 'empty' : ''}`}>
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" />
                            ) : (
                                <span>No Image</span>
                            )}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <label htmlFor="register-image-upload" className="custom-file-btn">
                                {imagePreview ? 'Change Image' : 'Choose a file'}
                            </label>
                            <input
                                id="register-image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={isLoading}
                                style={{ display: 'none' }}
                            />
                        </div>
                        {errors.image && <span className="auth-error">{errors.image}</span>}
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Display Name</label>
                        <input
                            type="text"
                            name="displayName"
                            ref={displayNameRef}
                            value={formData.displayName}
                            onChange={handleInputChange}
                            className="auth-input"
                            placeholder="How should we call you?"
                            disabled={isLoading}
                        />
                        {errors.displayName && <span className="auth-error">{errors.displayName}</span>}
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="auth-input"
                            placeholder="Choose a username"
                            disabled={isLoading}
                        />
                        {errors.username && <span className="auth-error">{errors.username}</span>}
                    </div>

                    <div className="auth-input-group" style={{ position: 'relative' }}>
                        <label className="auth-label">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                className="auth-input"
                                placeholder="Choose a password"
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
                        {passwordFocused && (
                            <div className="password-rules-dropdown">
                                <div className={`rule-item ${hasLength ? 'valid' : ''}`}>
                                    <span className="rule-dot"></span> At least 8 characters
                                </div>
                                <div className={`rule-item ${hasLetter ? 'valid' : ''}`}>
                                    <span className="rule-dot"></span> One letter
                                </div>
                                <div className={`rule-item ${hasNumber ? 'valid' : ''}`}>
                                    <span className="rule-dot"></span> One number
                                </div>
                            </div>
                        )}
                        {errors.password && <span className="auth-error">{errors.password}</span>}
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="auth-input"
                                placeholder="Type your password again"
                                disabled={isLoading}
                            />
                            <button 
                                type="button" 
                                className="password-toggle-btn" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                tabIndex="-1"
                            >
                                {showConfirmPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && <span className="auth-error">{errors.confirmPassword}</span>}
                    </div>

                    {/* Delivery location (optional) — saved as the user's first address */}
                    <div className="auth-input-group">
                        <label className="auth-label">Delivery location <span style={{ color: '#999', fontWeight: 400 }}>(optional)</span></label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="auth-input"
                            placeholder="Address (e.g., Sderot HaKibutsim 17)"
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={useMyLocation}
                            disabled={isLoading || locating}
                            className="custom-file-btn"
                            style={{ marginTop: '8px', display: 'inline-block' }}
                        >
                            {locating ? 'Locating…' : '📍 Use my current location'}
                        </button>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                            <input
                                type="number"
                                step="any"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleInputChange}
                                className="auth-input"
                                placeholder="Latitude"
                                disabled={isLoading}
                                style={{ flex: 1, minWidth: 0 }}
                            />
                            <input
                                type="number"
                                step="any"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleInputChange}
                                className="auth-input"
                                placeholder="Longitude"
                                disabled={isLoading}
                                style={{ flex: 1, minWidth: 0 }}
                            />
                        </div>
                        {errors.location && <span className="auth-error">{errors.location}</span>}
                    </div>

                    <div className="auth-toggle-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <label className="auth-toggle-label" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                            <input
                                type="checkbox"
                                name="isBusinessOwner"
                                checked={formData.isBusinessOwner}
                                onChange={handleToggleChange}
                                disabled={isLoading}
                                style={{ marginRight: '10px', width: '18px', height: '18px', accentColor: 'var(--brand)' }}
                            />
                            I am a Business Owner
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing Up...' : 'Sign Up'}
                    </button>

                    <div className="auth-divider">or</div>

                    <div className="auth-link-text">
                        <span>Already have an account? </span>
                        <Link to="/login" className="auth-link">Log in here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}