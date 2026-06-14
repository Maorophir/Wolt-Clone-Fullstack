import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentPosition } from '../utils/geo';

const genId = () =>
    (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `a_${Date.now()}_${Math.random().toString(36).slice(2)}`;

export const useRegister = () => {
    const [formData, setFormData] = useState({
        displayName: '',
        username: '',
        password: '',
        confirmPassword: '',
        isBusinessOwner: false,
        // Delivery location (optional): saved as the user's first address.
        label: 'Home',
        address: '',
        latitude: '',
        longitude: '',
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [locating, setLocating] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
    }, [imagePreview]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleToggleChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, image: '' }));
        }
    };

    // Fill lat/lng from the browser's geolocation (no external libraries).
    const useMyLocation = async () => {
        setLocating(true);
        setErrors(prev => ({ ...prev, location: '' }));
        try {
            const { lat, lng } = await getCurrentPosition();
            setFormData(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                location: err && err.code === 1
                    ? 'Location was blocked — enter coordinates manually.'
                    : 'Could not get your location — enter coordinates manually.',
            }));
        } finally {
            setLocating(false);
        }
    };

    const convertToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });

    const validateForm = () => {
        const newErrors = {};

        if (!formData.displayName.trim()) newErrors.displayName = 'Display name is required';

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
            newErrors.password = 'Password must contain letters and numbers';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Location is optional, but coordinates must be paired and in range.
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

    const submitForm = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            let base64Image = '';
            if (imageFile) base64Image = await convertToBase64(imageFile);

            const addresses = String(formData.latitude).trim() !== ''
                ? [{
                    id: genId(),
                    label: formData.label.trim() || 'Home',
                    address: formData.address.trim(),
                    latitude: Number(formData.latitude),
                    longitude: Number(formData.longitude),
                }]
                : undefined;

            const dataPayload = {
                displayName: formData.displayName,
                username: formData.username,
                password: formData.password,
                profileImage: base64Image,
                isBusinessOwner: formData.isBusinessOwner,
                ...(addresses ? { addresses } : {}),
            };

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataPayload),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors(prev => ({ ...prev, submit: data.message || 'Registration failed. Please try again.' }));
            } else {
                setSuccessMessage('Registration successful! Redirecting to login...');
                setFormData({
                    displayName: '', username: '', password: '', confirmPassword: '',
                    isBusinessOwner: false, label: 'Home', address: '', latitude: '', longitude: '',
                });
                setImagePreview(null);
                setImageFile(null);
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            setErrors(prev => ({ ...prev, submit: 'Network error. Please try again later.' }));
            console.error('Registration error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
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
        submitForm,
    };
};
