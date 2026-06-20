import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authHeaders, getCurrentUser } from '../utils/auth';
import { getCurrentPosition } from '../utils/geo';
import './EditRestaurant.css';

/**
 * EditRestaurant page — allows logged-in business owners to edit their restaurant.
 */
const EditRestaurant = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Manage all form field values in a single state object (useState)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        category: '',
        image: '',  // base64 data URL or a remote URL string
        latitude: '',
        longitude: '',
    });

    // Existing categories (fetched from the server) populate the category
    // dropdown, so the choices stay data-derived — not hard-coded. The "Other"
    // option flips on a free-text input so an owner can still add a new cuisine.
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [isCustomCategory, setIsCustomCategory] = useState(false);

    // Separate state for the image file and its local preview URL
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [locating, setLocating] = useState(false);

    // UI state: validation errors and submission loading flag
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Ref attached to the first input so it gets keyboard focus immediately (useRef)
    const nameInputRef = useRef(null);

    // Fetch existing restaurant data
    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const res = await fetch(`/api/restaurants/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    // Verify ownership
                    const user = getCurrentUser();
                    if (!user || (user.id !== data.ownerId && !user.isAdmin)) {
                        navigate('/');
                        return;
                    }

                    setFormData({
                        name: data.name || '',
                        description: data.description || '',
                        address: data.address || '',
                        category: data.category || '',
                        image: data.image || '',
                        latitude: data.latitude != null ? String(data.latitude) : '',
                        longitude: data.longitude != null ? String(data.longitude) : '',
                    });
                    if (data.image) {
                        setImagePreview(data.image);
                    }
                } else {
                    navigate('/');
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchRestaurant();
    }, [id, navigate]);

    // Load the categories that already exist so the dropdown stays data-derived
    // (mirrors how the Home category bar builds its list from server data).
    useEffect(() => {
        let cancelled = false;
        fetch('/api/restaurants')
            .then(res => (res.ok ? res.json() : []))
            .then(list => {
                if (cancelled) return;
                const cats = [...new Set(
                    (Array.isArray(list) ? list : [])
                        .map(r => r.category)
                        .filter(Boolean)
                )].sort((a, b) => a.localeCompare(b));
                setCategoryOptions(cats);
            })
            .catch(() => { /* non-fatal: the user can still type a new category */ });
        return () => { cancelled = true; };
    }, []);

    // Revoke the blob URL when the component unmounts or when the image changes
    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    /** Generic text/number input change handler */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear the error for this field as soon as the user starts typing again
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    /** Category dropdown: pick an existing category, or switch to "add new" mode. */
    const handleCategorySelect = (e) => {
        const { value } = e.target;
        if (value === '__other__') {
            setIsCustomCategory(true);
            setFormData(prev => ({ ...prev, category: '' }));
        } else {
            setIsCustomCategory(false);
            setFormData(prev => ({ ...prev, category: value }));
        }
        if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
    };

    /** Image file picker handler — generates a local preview URL */
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, image: 'Image must be smaller than 5 MB.' }));
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setErrors(prev => ({ ...prev, image: '' }));
    };

    /** Converts a File object to a base64 data URL string */
    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    /** Fills latitude/longitude from the browser geolocation (no libraries). */
    const useMyLocation = async () => {
        setLocating(true);
        setErrors(prev => ({ ...prev, location: '' }));
        try {
            const { lat, lng } = await getCurrentPosition();
            setFormData(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
        } catch (err) {
            setErrors(prev => ({ ...prev, location: err && err.code === 1 ? 'Location was blocked — enter coordinates manually.' : 'Could not get your location.' }));
        } finally {
            setLocating(false);
        }
    };

    /** Client-side validation — returns true when the form is valid */
    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Restaurant name is required.';
        if (!formData.category.trim()) newErrors.category = 'Category is required.';
        if (!formData.address.trim()) newErrors.address = 'Address is required.';

        const hasLat = String(formData.latitude).trim() !== '';
        const hasLng = String(formData.longitude).trim() !== '';
        if (hasLat !== hasLng) {
            newErrors.location = 'Provide both latitude and longitude, or leave both empty.';
        } else if (hasLat) {
            const la = Number(formData.latitude);
            const lo = Number(formData.longitude);
            if (!Number.isFinite(la) || la < -90 || la > 90 || !Number.isFinite(lo) || lo < -180 || lo > 180) {
                newErrors.location = 'Latitude must be -90..90 and longitude -180..180.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /** Form submission — validates, encodes image, then POSTs to /api/restaurants */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setSuccessMessage('');

        try {
            // Resolve the image: convert the selected file to base64, or keep empty
            let imageValue = '';
            if (imageFile) {
                imageValue = await toBase64(imageFile);
            }

            // The authenticated user is automatically captured via JWT in backend authMiddleware

            const response = await fetch(`/api/restaurants/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders(),
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    address: formData.address.trim(),
                    category: formData.category.trim(),
                    image: imageValue || formData.image || undefined,
                    latitude: formData.latitude !== '' ? Number(formData.latitude) : undefined,
                    longitude: formData.longitude !== '' ? Number(formData.longitude) : undefined,
                }),
            });

            if (response.ok) {
                setSuccessMessage('Restaurant updated successfully!');
                setTimeout(() => navigate('/profile'), 1500);
            } else {
                const data = await response.json().catch(() => ({}));
                setErrors(prev => ({
                    ...prev,
                    submit: data.error || data.message || 'Failed to update restaurant. Please try again.',
                }));
            }
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                submit: 'Network error — could not reach the server.',
            }));
            console.error('Update restaurant error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="ar-wrapper">
            <div className="ar-card">

                {/* ── Page header ── */}
                <div className="ar-header">
                    <h1 className="ar-title">Edit Restaurant</h1>
                    <p className="ar-subtitle">Update your restaurant details.</p>
                </div>

                {/* ── Global error / success banners ── */}
                {errors.submit && (
                    <div className="ar-banner ar-banner--error" role="alert">
                        {errors.submit}
                    </div>
                )}
                {successMessage && (
                    <div className="ar-banner ar-banner--success" role="status">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="ar-form" noValidate>

                    {/* ── Restaurant Name (required) ── */}
                    <div className="ar-group">
                        <label htmlFor="ar-name" className="ar-label">
                            Restaurant Name <span className="ar-required">*</span>
                        </label>
                        <input
                            type="text"
                            id="ar-name"
                            name="name"
                            ref={nameInputRef}  /* useRef: auto-focus on mount */
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., The Golden Fork"
                            disabled={isSubmitting}
                            className={`ar-input${errors.name ? ' ar-input--error' : ''}`}
                            autoComplete="off"
                        />
                        {errors.name && <span className="ar-field-error">{errors.name}</span>}
                    </div>

                    {/* ── Category (required) — choose an existing one or add a new one ── */}
                    <div className="ar-group">
                        <label htmlFor="ar-category" className="ar-label">
                            Category <span className="ar-required">*</span>
                        </label>
                        <select
                            id="ar-category"
                            name="category"
                            value={isCustomCategory ? '__other__' : formData.category}
                            onChange={handleCategorySelect}
                            disabled={isSubmitting}
                            className={`ar-input ar-select${errors.category ? ' ar-input--error' : ''}`}
                        >
                            <option value="" disabled>Select a category…</option>
                            {(formData.category && !isCustomCategory && !categoryOptions.includes(formData.category)
                                ? [formData.category, ...categoryOptions]
                                : categoryOptions
                            ).map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                            <option value="__other__">+ Add a new category…</option>
                        </select>
                        {isCustomCategory && (
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="New category name, e.g., Ramen"
                                disabled={isSubmitting}
                                className={`ar-input${errors.category ? ' ar-input--error' : ''}`}
                                style={{ marginTop: '0.5rem' }}
                                autoComplete="off"
                                aria-label="New category name"
                            />
                        )}
                        {errors.category && <span className="ar-field-error">{errors.category}</span>}
                    </div>

                    {/* ── Address (required) ── */}
                    <div className="ar-group">
                        <label htmlFor="ar-address" className="ar-label">
                            Address <span className="ar-required">*</span>
                        </label>
                        <input
                            type="text"
                            id="ar-address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="e.g., 123 Main St, Tel Aviv"
                            disabled={isSubmitting}
                            className={`ar-input${errors.address ? ' ar-input--error' : ''}`}
                            autoComplete="off"
                        />
                        {errors.address && <span className="ar-field-error">{errors.address}</span>}
                    </div>

                    {/* ── Location / coordinates (optional — powers "nearby") ── */}
                    <div className="ar-group">
                        <label className="ar-label">
                            Location <span className="ar-optional">(optional — enables "nearby" search)</span>
                        </label>
                        <button
                            type="button"
                            className="ar-btn ar-btn--secondary"
                            onClick={useMyLocation}
                            disabled={isSubmitting || locating}
                            style={{ marginBottom: '0.5rem' }}
                        >
                            {locating ? 'Locating…' : '📍 Use my current location'}
                        </button>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <input
                                type="number"
                                step="any"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                                placeholder="Latitude"
                                disabled={isSubmitting}
                                className="ar-input"
                                style={{ flex: 1, minWidth: 0 }}
                                aria-label="Latitude"
                            />
                            <input
                                type="number"
                                step="any"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                placeholder="Longitude"
                                disabled={isSubmitting}
                                className="ar-input"
                                style={{ flex: 1, minWidth: 0 }}
                                aria-label="Longitude"
                            />
                        </div>
                        {errors.location && <span className="ar-field-error">{errors.location}</span>}
                    </div>

                    {/* ── Description (optional) ── */}
                    <div className="ar-group">
                        <label htmlFor="ar-description" className="ar-label">
                            Description <span className="ar-optional">(optional)</span>
                        </label>
                        <textarea
                            id="ar-description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the restaurant's cuisine, atmosphere, specialities…"
                            disabled={isSubmitting}
                            className="ar-textarea"
                            rows={3}
                        />
                    </div>



                    {/* ── Restaurant Image (optional) ── */}
                    <div className="ar-group">
                        <label className="ar-label">
                            Cover Image <span className="ar-optional">(optional, max 5 MB)</span>
                        </label>
                        <div className="ar-image-area">
                            {/* Preview circle */}
                            <div className={`ar-image-preview${!imagePreview ? ' ar-image-preview--empty' : ''}`}>
                                {imagePreview
                                    ? <img src={imagePreview} alt="Restaurant preview" />
                                    : <span className="ar-image-placeholder">🍽️</span>
                                }
                            </div>
                            <label htmlFor="ar-image" className="ar-image-btn">
                                {imagePreview ? 'Change Image' : 'Upload Image'}
                                <input
                                    type="file"
                                    id="ar-image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    disabled={isSubmitting}
                                    className="ar-image-input"
                                />
                            </label>
                        </div>
                        {errors.image && <span className="ar-field-error">{errors.image}</span>}
                    </div>

                    {/* ── Action buttons ── */}
                    <div className="ar-actions">
                        <button
                            type="button"
                            className="ar-btn ar-btn--secondary"
                            onClick={() => navigate(`/manage-menu/${id}`)}
                            disabled={isSubmitting}
                        >
                            Manage Menu
                        </button>
                        <button
                            type="button"
                            className="ar-btn ar-btn--secondary"
                            onClick={() => navigate(-1)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="ar-btn ar-btn--primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditRestaurant;