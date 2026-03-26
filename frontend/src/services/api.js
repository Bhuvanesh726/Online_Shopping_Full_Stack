import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    getMe: () => api.get('/auth/me'),
};

// Product API
export const productAPI = {
    getAll: (page = 0, size = 12, sortBy = 'createdAt', sortDir = 'desc') =>
        api.get(`/products?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
    getById: (id) => api.get(`/products/${id}`),
    search: (query, page = 0, size = 12) =>
        api.get(`/products/search?q=${query}&page=${page}&size=${size}`),
    filter: (params) => api.get('/products/filter', { params }),
    getNewArrivals: () => api.get('/products/new-arrivals'),
    getTopRated: () => api.get('/products/top-rated'),
    getRelated: (id) => api.get(`/products/${id}/related`),
    getBrands: () => api.get('/products/brands'),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    getMyProducts: () => api.get('/products/seller/my-products'),
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/uploads/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

};

// Category API
export const categoryAPI = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
};

// Cart API
export const cartAPI = {
    get: () => api.get('/cart'),
    add: (productId, quantity = 1) => api.post('/cart', { productId, quantity }),
    update: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
    remove: (itemId) => api.delete(`/cart/${itemId}`),
    clear: () => api.delete('/cart/clear'),
};

// Wishlist API
export const wishlistAPI = {
    get: () => api.get('/wishlist'),
    add: (productId) => api.post(`/wishlist/${productId}`),
    remove: (productId) => api.delete(`/wishlist/${productId}`),
};

// Order API
export const orderAPI = {
    checkout: (data) => api.post('/orders/checkout', data),
    getAll: () => api.get('/orders'),
    getById: (id) => api.get(`/orders/${id}`),
    verifyPayment: (sessionId) => api.get(`/orders/verify-payment?session_id=${sessionId}`),
    getSellerOrders: () => api.get('/orders/seller'),
    updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Review API
export const reviewAPI = {
    getByProduct: (productId) => api.get(`/products/${productId}/reviews`),
    create: (productId, data) => api.post(`/products/${productId}/reviews`, data),
};

// Recommendation API
export const recommendationAPI = {
    get: () => api.get('/recommendations'),
    getPublic: () => api.get('/recommendations/public'),
};

// Admin API
export const adminAPI = {
    getAllUsers: () => api.get('/users'),
    deleteUser: (id) => api.delete(`/users/${id}`),
};

export default api;

