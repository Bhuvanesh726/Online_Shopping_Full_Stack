import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], totalAmount: 0, totalItems: 0 });
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart({ items: [], totalAmount: 0, totalItems: 0 });
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await cartAPI.get();
            setCart(response.data.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            await cartAPI.add(productId, quantity);
            await fetchCart();
        } catch (error) {
            throw error;
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        try {
            await cartAPI.update(itemId, quantity);
            await fetchCart();
        } catch (error) {
            throw error;
        }
    };

    const removeItem = async (itemId) => {
        try {
            await cartAPI.remove(itemId);
            await fetchCart();
        } catch (error) {
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            await cartAPI.clear();
            setCart({ items: [], totalAmount: 0, totalItems: 0 });
        } catch (error) {
            throw error;
        }
    };

    return (
        <CartContext.Provider
            value={{ cart, loading, addToCart, updateQuantity, removeItem, clearCart, fetchCart }}
        >
            {children}
        </CartContext.Provider>
    );
};
