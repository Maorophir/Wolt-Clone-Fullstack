import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setCurrentUser, authHeaders } from '../utils/auth';

export const useLogin = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = 'Username is required';
        if (!formData.password) newErrors.password = 'Password is required';
       
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitForm = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/tokens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({ submit: data.message || 'Login failed' });
            } else {
                // 1. Save the raw JWT token
                
               
                // 2. Decode the middle segment (payload) to get the userId
                // A JWT is: header.payload.signature
                const payloadBase64 = data.token.split('.')[1];
                const payloadStr = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
                const payload = JSON.parse(payloadStr);
                const userId = payload.userId;

                // 3. Fetch full user data using the new token
                const userResponse = await fetch(`/api/users/${userId}`, {
                    headers: authHeaders()
                });
                const userData = await userResponse.json();
               
                // 4. Save user profile to localStorage
                setCurrentUser({ id: userId, ...userData });
               
                // Redirect to home
                navigate('/');
            }
        } catch (error) {
            setErrors({ submit: 'Network error' });
        } finally {
            setIsLoading(false);
        }
    };

    return { formData, errors, isLoading, handleInputChange, submitForm };
};