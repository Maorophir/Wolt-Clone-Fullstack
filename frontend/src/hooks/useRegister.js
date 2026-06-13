import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRegister = () => {
    const [formData, setFormData] = useState({
        displayName: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
   
    const navigate = useNavigate();

    // Cleanup blob URL on unmount or image change
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
       
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle image file selection
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

    // Validate form data
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
       
        fileReader.onload = () => {
            resolve(fileReader.result);
        };
       
        fileReader.onerror = (error) => {
            reject(error);
        };
    });
};

    // Handle form submission
const submitForm = async (e) => {
        e.preventDefault();
        setSuccessMessage('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            let base64Image = '';
           
            if (imageFile) {
                base64Image = await convertToBase64(imageFile);
            }

            const dataPayload = {
                displayName: formData.displayName,
                username: formData.username,
                password: formData.password,
                profileImage: base64Image
            };

            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataPayload)
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors(prev => ({
                    ...prev,
                    submit: data.message || 'Registration failed. Please try again.'
                }));
            } else {
                setSuccessMessage('Registration successful! Redirecting to login...');
               
                setFormData({
                    displayName: '',
                    username: '',
                    password: '',
                    confirmPassword: ''
                });
                setImagePreview(null);
                setImageFile(null);
               
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                submit: 'Network error. Please try again later.'
            }));
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
        handleInputChange,
        handleImageChange,
        submitForm
    };
};