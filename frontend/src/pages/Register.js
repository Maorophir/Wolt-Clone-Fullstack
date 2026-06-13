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
        handleInputChange,
        handleToggleChange,
        handleImageChange,
        submitForm
    } = useRegister();

    const displayNameRef = useRef(null);
    const [passwordFocused, setPasswordFocused] = useState(false);

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
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            className="auth-input"
                            placeholder="Choose a password"
                            disabled={isLoading}
                        />
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
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="auth-input"
                            placeholder="Type your password again"
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && <span className="auth-error">{errors.confirmPassword}</span>}
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