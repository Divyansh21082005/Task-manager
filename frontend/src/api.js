import axios from 'axios';

const API = axios.create({
    baseURL: 'https://task-manager-production-4d82.up.railway.app/api', // Hamare backend ka address
});

// Request bhejney se pehle token attach karna
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;