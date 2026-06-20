import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authHeaders, getCurrentUser } from '../utils/auth';
import './ManageMenu.css';

const ManageMenu = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Form state
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'General',
        isAvailable: true,
        image: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const fetchProducts = useCallback(async () => {
        try {
            const res = await fetch(`/api/restaurants/${id}/products`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (err) {
            console.error('Failed to fetch products', err);
        }
    }, [id]);

    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            try {
                // Fetch restaurant info to check ownership
                const resRestaurant = await fetch(`/api/restaurants/${id}`);
                if (!resRestaurant.ok) {
                    navigate('/');
                    return;
                }
                const resData = await resRestaurant.json();
                
                const user = getCurrentUser();
                if (!user || (user.id !== resData.ownerId && !user.isAdmin)) {
                    navigate('/');
                    return;
                }
                setRestaurant(resData);

                // Fetch menu products
                await fetchProducts();
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuthAndFetchData();
    }, [id, navigate, fetchProducts]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
    };

    const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'General',
            isAvailable: true,
            image: ''
        });
        setImageFile(null);
        setImagePreview(null);
    };

    const handleEditClick = (product) => {
        setEditingProduct(product.id);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category || 'General',
            isAvailable: product.isAvailable !== false,
            image: product.image || ''
        });
        setImageFile(null);
        setImagePreview(product.image || null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this dish?')) return;
        try {
            const res = await fetch(`/api/restaurants/${id}/products/${productId}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            if (res.ok) {
                setMessage({ text: 'Dish deleted successfully', type: 'success' });
                await fetchProducts();
            } else {
                setMessage({ text: 'Failed to delete dish', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Network error', type: 'error' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setIsSubmitting(true);

        try {
            let imageValue = '';
            if (imageFile) {
                imageValue = await toBase64(imageFile);
            }

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                category: formData.category.trim() || 'General',
                isAvailable: formData.isAvailable,
                image: imageValue || formData.image || undefined
            };

            const url = editingProduct 
                ? `/api/restaurants/${id}/products/${editingProduct}`
                : `/api/restaurants/${id}/products`;
            
            const method = editingProduct ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders()
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setMessage({ text: editingProduct ? 'Dish updated successfully!' : 'Dish created successfully!', type: 'success' });
                resetForm();
                await fetchProducts();
            } else {
                const data = await res.json().catch(() => ({}));
                setMessage({ text: data.error || 'Failed to save dish.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Network error. Please try again.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="mm-loading">Loading...</div>;
    if (!restaurant) return null;

    return (
        <div className="mm-wrapper">
            <div className="mm-header">
                <h1>Manage Menu: {restaurant.name}</h1>
                <button 
                    onClick={() => navigate(-1)} 
                    className="mm-back-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
                >
                    ← Go Back
                </button>
            </div>

            {message.text && (
                <div className={`mm-alert mm-alert--${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="mm-layout">
                {/* Product Form */}
                <div className="mm-form-section">
                    <h2>{editingProduct ? 'Edit Dish' : 'Add New Dish'}</h2>
                    <form className="mm-form" onSubmit={handleSubmit}>
                        <div className="mm-form-group">
                            <label>Dish Name *</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="mm-form-group">
                            <label>Price *</label>
                            <input 
                                type="number" 
                                name="price"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="mm-form-group">
                            <label>Category *</label>
                            <input 
                                type="text" 
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                placeholder="e.g. Starters, Mains, Drinks"
                                required
                            />
                        </div>

                        <div className="mm-form-group">
                            <label>Description</label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>

                        <div className="mm-form-group mm-checkbox">
                            <label>
                                <input 
                                    type="checkbox" 
                                    name="isAvailable"
                                    checked={formData.isAvailable}
                                    onChange={handleInputChange}
                                />
                                Available for order
                            </label>
                        </div>

                        <div className="mm-form-group">
                            <label>Dish Image</label>
                            <div className="mm-image-upload">
                                {imagePreview && (
                                    <img src={imagePreview} alt="Preview" className="mm-image-preview" />
                                )}
                                <label className="mm-image-btn">
                                    {imagePreview ? 'Change Image' : 'Upload Image'}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="mm-image-input-hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="mm-form-actions">
                            {editingProduct && (
                                <button type="button" className="mm-btn mm-btn--cancel" onClick={resetForm}>
                                    Cancel Edit
                                </button>
                            )}
                            <button type="submit" className="mm-btn mm-btn--submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Add Dish')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Products List */}
                <div className="mm-list-section">
                    <h2>Current Menu ({products.length})</h2>
                    <div className="mm-product-list">
                        {products.length === 0 ? (
                            <p className="mm-empty">No dishes added yet.</p>
                        ) : (
                            products.map(product => (
                                <div key={product.id} className="mm-product-card">
                                    {product.image && (
                                        <img src={product.image} alt={product.name} className="mm-product-img" />
                                    )}
                                    <div className="mm-product-info">
                                        <h3>{product.name} {!product.isAvailable && <span className="mm-badge">Unavailable</span>}</h3>
                                        <p className="mm-product-price">₪{Number(product.price).toFixed(2)} &nbsp;&nbsp;|&nbsp;&nbsp; {product.category || 'General'}</p>
                                        {product.description && <p className="mm-product-desc">{product.description}</p>}
                                    </div>
                                    <div className="mm-product-actions">
                                        <button onClick={() => handleEditClick(product)} className="mm-action-btn mm-edit-btn">Edit</button>
                                        <button onClick={() => handleDeleteClick(product.id)} className="mm-action-btn mm-delete-btn">Delete</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageMenu;
