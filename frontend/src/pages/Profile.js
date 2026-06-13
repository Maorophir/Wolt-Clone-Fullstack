import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, setCurrentUser, authHeaders } from '../utils/auth';
import RestaurantCard from '../components/RestaurantCard';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(getCurrentUser);
   
    // Form states
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(user?.profileImage || '');
   
    const [restaurants, setRestaurants] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchUserRestaurants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, navigate]);

    const fetchUserRestaurants = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/users/${user.id}/restaurants`, {
                headers: authHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setRestaurants(data);
            }
        } catch (err) {
            console.error('Failed to fetch restaurants', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ text: 'Image must be smaller than 5 MB.', type: 'error' });
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setMessage({ text: '', type: '' });
    };

    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ text: '', type: '' });

        try {
            let base64Image = undefined;
            if (imageFile) {
                base64Image = await toBase64(imageFile);
            }

            const response = await fetch(`/api/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders(),
                },
                body: JSON.stringify({
                    displayName: displayName.trim(),
                    profileImage: base64Image
                })
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setCurrentUser(updatedUser);
                setUser(updatedUser);
                setMessage({ text: 'Profile updated successfully!', type: 'success' });
            } else {
                const errData = await response.json();
                setMessage({ text: errData.error || 'Failed to update profile.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Network error. Please try again.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <h1>My Profile</h1>
                    <p>Manage your account details and view your restaurants.</p>
                </div>

                {message.text && (
                    <div className={`profile-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="profile-content">
                    <section className="profile-section">
                        <h2>Personal Details</h2>
                        <form onSubmit={handleSaveProfile} className="profile-form">
                            <div className="profile-avatar-group">
                                <div className="profile-avatar-preview">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profile preview" />
                                    ) : (
                                        <span>{user.displayName ? user.displayName.charAt(0).toUpperCase : '?'}</span>
                                    )}
                                </div>
                                <div className="profile-avatar-actions">
                                    <label htmlFor="profile-image-upload" className="profile-btn-secondary">
                                        Change Avatar
                                    </label>
                                    <input
                                        id="profile-image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>

                            <div className="profile-input-group">
                                <label htmlFor="profile-name">Display Name</label>
                                <input
                                    id="profile-name"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your display name"
                                    required
                                />
                            </div>

                            <button type="submit" className="profile-btn-primary" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </section>

                    <section className="profile-section my-restaurants-section">
                        <div className="my-restaurants-header">
                            <h2>My Restaurants</h2>
                            <button className="profile-btn-secondary" onClick={() => navigate('/add-restaurant')}>
                                + Add Restaurant
                            </button>
                        </div>

                        {isLoading ? (
                            <p className="loading-text">Loading your restaurants...</p>
                        ) : restaurants.length > 0 ? (
                            <div className="profile-restaurants-grid">
                                {restaurants.map(restaurant => (
                                    <div key={restaurant.id} className="profile-restaurant-wrapper">
                                        <RestaurantCard restaurant={restaurant} />
                                        <div className="profile-restaurant-overlay">
                                            <button
                                                className="edit-restaurant-btn"
                                                onClick={() => alert('Edit restaurant page coming soon!')}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-restaurants-box">
                                <p>You haven't added any restaurants yet.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Profile;
