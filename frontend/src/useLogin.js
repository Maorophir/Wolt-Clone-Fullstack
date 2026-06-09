import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setCurrentUser } from './utils/auth';

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
                // Fetch full user data
                const userResponse = await fetch(`/api/users/${data.userId}`);
                const userData = await userResponse.json();
                
                // Save user to localStorage
                setCurrentUser({ id: data.userId, ...userData });
                
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