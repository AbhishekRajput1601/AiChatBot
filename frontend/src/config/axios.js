import axios from 'axios';

// Provide a safe fallback so that in production (if VITE_API_URL is missing)
// requests still go to the current origin instead of 'undefined'.
const apiBase = import.meta.env.VITE_API_URL || window.location.origin;

const axiosInstance = axios.create({
    baseURL: apiBase,
    headers: () => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`
    })
});

// If headers defined as a function above isn't supported in current axios version, we set via interceptor:
axiosInstance.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
});


export default axiosInstance;   