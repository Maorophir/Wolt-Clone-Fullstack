/**
 * A global wrapper function for all API calls in the application.
 * Handles JSON parsing, network errors, and can be easily extended
 * to inject JWT tokens automatically.
 */
export const apiCall = async (endpoint, options = {}) => {
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    // Future implementation: retrieve the JWT token from LocalStorage
    // const token = localStorage.getItem('jwt');
    // if (token) {
    //   defaultHeaders['Authorization'] = `Bearer ${token}`;
    // }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    // Stringify the body if it's an object (for POST/PATCH requests)
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(endpoint, config);

        // 204 (No Content) and empty 201 (Created — the resource is in the
        // Location header) responses have no JSON body to parse.
        if (response.status === 204) return null;

        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (!response.ok) {
            // Throw a structured error so components can display it to the user.
            const message = (data && (data.error || data.message)) ||
                'Something went wrong while communicating with the server';
            throw new Error(message);
        }

        return data;
    } catch (error) {
        console.error(`API Error at ${endpoint}:`, error);
        throw error;
    }
};