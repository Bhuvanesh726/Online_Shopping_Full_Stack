import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiShoppingBag } from 'react-icons/fi';
import { orderAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const OrderSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const { fetchCart } = useCart();

    useEffect(() => {
        if (sessionId) {
            verifyPayment();
        } else {
            setLoading(false);
        }
    }, [sessionId]);

    const verifyPayment = async () => {
        try {
            const response = await orderAPI.verifyPayment(sessionId);
            setOrder(response.data.data);
            fetchCart(); // Refresh cart (should be empty now)
        } catch (error) {
            console.error('Error verifying payment:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="success-page">
            <div className="success-icon">
                <FiCheckCircle />
            </div>
            <h1>Order Confirmed!</h1>
            <p>
                {order
                    ? `Your order #${order.id} has been placed successfully.`
                    : 'Thank you for your purchase!'}
            </p>

            {order && (
                <div style={{
                    background: 'var(--white)', border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: 24, maxWidth: 500,
                    width: '100%', textAlign: 'left', marginBottom: 32
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginBottom: 12, fontSize: '0.9rem'
                    }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Order ID</span>
                        <span style={{ fontWeight: 700 }}>#{order.id}</span>
                    </div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginBottom: 12, fontSize: '0.9rem'
                    }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                        <span className={`order-status ${order.status?.toLowerCase()}`}>{order.status}</span>
                    </div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginBottom: 12, fontSize: '0.9rem'
                    }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total</span>
                        <span style={{ fontWeight: 700 }}>₹{order.totalAmount?.toFixed(2)}</span>
                    </div>
                    {order.estimatedDelivery && (
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            fontSize: '0.9rem'
                        }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Est. Delivery</span>
                            <span style={{ fontWeight: 600, color: 'var(--green-600)' }}>
                                {new Date(order.estimatedDelivery).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
                <Link to="/orders" className="btn btn-primary">
                    <FiPackage /> View Orders
                </Link>
                <Link to="/shop" className="btn btn-outline">
                    <FiShoppingBag /> Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
