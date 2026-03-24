import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CartPage = () => {
    const { cart, updateQuantity, removeItem, loading } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated) {
        return (
            <div className="empty-state">
                <div className="icon">🛒</div>
                <h2>Please sign in</h2>
                <p>Sign in to view your cart</p>
                <Link to="/login" className="btn btn-primary">Sign In</Link>
            </div>
        );
    }

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await updateQuantity(itemId, newQuantity);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update');
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await removeItem(itemId);
            toast.success('Item removed');
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    if (cart.items.length === 0) {
        return (
            <div className="empty-state">
                <div className="icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Add some products to get started</p>
                <Link to="/shop" className="btn btn-primary">
                    <FiShoppingBag /> Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h1 className="page-title">Shopping Cart ({cart.totalItems} items)</h1>

            <div className="cart-layout">
                <div className="cart-items">
                    {cart.items.map(item => (
                        <div key={item.id} className="cart-item">
                            <Link to={`/products/${item.productId}`} className="cart-item-image">
                                <img src={item.productImage || 'https://via.placeholder.com/120'} alt={item.productName} />
                            </Link>
                            <div className="cart-item-info">
                                <Link to={`/products/${item.productId}`} className="cart-item-name">
                                    {item.productName}
                                </Link>
                                <div className="cart-item-price">
                                    ₹{item.effectivePrice?.toFixed(2)} each
                                    {item.discountPrice && item.discountPrice > 0 && item.discountPrice < item.productPrice && (
                                        <span style={{ textDecoration: 'line-through', marginLeft: 8, color: 'var(--text-muted)' }}>
                                            ₹{item.productPrice?.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                <div className="cart-item-bottom">
                                    <div className="quantity-selector" style={{ marginBottom: 0 }}>
                                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                                            <FiMinus size={14} />
                                        </button>
                                        <input type="number" value={item.quantity} readOnly />
                                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                                            <FiPlus size={14} />
                                        </button>
                                    </div>
                                    <span className="cart-item-total">₹{item.subtotal?.toFixed(2)}</span>
                                    <button className="cart-item-remove" onClick={() => handleRemoveItem(item.id)}>
                                        <FiTrash2 size={14} /> Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <h2>Order Summary</h2>
                    <div className="cart-summary-row">
                        <span>Subtotal</span>
                        <span>₹{cart.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="cart-summary-row">
                        <span>Shipping</span>
                        <span style={{ color: 'var(--green-600)', fontWeight: 600 }}>Free</span>
                    </div>
                    <div className="cart-summary-row">
                        <span>Tax (est.)</span>
                        <span>₹{(cart.totalAmount * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="cart-summary-row total">
                        <span>Total</span>
                        <span>₹{(cart.totalAmount * 1.08).toFixed(2)}</span>
                    </div>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => navigate('/checkout')}
                    >
                        Proceed to Checkout <FiArrowRight />
                    </button>
                    <Link
                        to="/shop"
                        style={{
                            display: 'block', textAlign: 'center', marginTop: 12,
                            fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500
                        }}
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
