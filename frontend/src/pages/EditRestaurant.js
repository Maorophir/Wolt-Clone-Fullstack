import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authHeaders, getCurrentUser } from '../utils/auth';
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
    });

    // Separate state for the image file and its local preview URL
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);

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
                    if (!user || user.id !== data.ownerId) {
                        navigate('/');
                        return;
                    }

                    setFormData({
                        name: data.name || '',
                        description: data.description || '',
                        address: data.address || '',
                        category: data.category || '',
                        image: data.image || '',
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

    /** Client-side validation — returns true when the form is valid */
    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Restaurant name is required.';
        if (!formData.category.trim()) newErrors.category = 'Category is required.';
        if (!formData.address.trim()) newErrors.address = 'Address is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /** Form submission — validates, encodes image, then POSTs to /api/restaurants */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate) return;

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
                }),
            });

            if (response.ok) {
                setSuccessMessage('Restaurant updated successfully!');
                setTimeout(() => navigate('/profile'), 1500);
            } else {
                const data = await response.json.catch(() => ({}));
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

                    {/* ── Category (required) ── */}
                    <div className="ar-group">
                        <label htmlFor="ar-category" className="ar-label">
                            Category <span className="ar-required">*</span>
                        </label>
                        <input
                            type="text"
                            id="ar-category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="e.g., Italian, Sushi, Burgers"
                            disabled={isSubmitting}
                            className={`ar-input${errors.category ? ' ar-input--error' : ''}`}
                            autoComplete="off"
                        />
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