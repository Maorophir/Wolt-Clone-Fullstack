import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import WoltInput from './WoltInput';
import { useRegister } from './useRegister';
import './Login.css';

export default function Register() {
    const {
        formData,
        imagePreview,
        errors,
        isLoading,
        successMessage,
        handleInputChange,
        handleImageChange,
        submitForm
    } = useRegister();

    const displayNameRef = useRef(null);

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
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={isLoading}
                            className="auth-image-input"
                        />
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
                    
                    <div className="auth-input-group">
                        <label className="auth-label">Password</label>
                        <input 
                            type="password" 
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="auth-input" 
                            placeholder="Min 8 characters, letters & numbers"
                            disabled={isLoading}
                        />
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