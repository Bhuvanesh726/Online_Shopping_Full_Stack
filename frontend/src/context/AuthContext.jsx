import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
                setIsAuthenticated(true);
            } catch (e) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await authAPI.login({ email, password });
        const { data } = response.data;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        setIsAuthenticated(true);
        return data;
    };

    const register = async (name, email, password, role = 'BUYER', gstNumber = '', companyName = '') => {
        const response = await authAPI.register({ name, email, password, role, gstNumber, companyName });
        const { data } = response.data;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        setIsAuthenticated(true);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, isAuthenticated, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};
