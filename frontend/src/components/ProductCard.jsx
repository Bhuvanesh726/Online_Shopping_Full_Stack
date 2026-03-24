import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { wishlistAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onWishlistChange }) => {
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const hasDiscount = product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    const renderStars = (rating) => {
        const stars = [];
        const r = parseFloat(rating) || 0;
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FiStar
                    key={i}
                    size={14}
                    fill={i <= r ? '#f59e0b' : 'none'}
                    color="#f59e0b"
                />
            );
        }
        return stars;
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            await addToCart(product.id, 1);
            toast.success('Added to cart');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        }
    };

    const handleToggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            if (product.inWishlist) {
                await wishlistAPI.remove(product.id);
                toast.success('Removed from wishlist');
            } else {
                await wishlistAPI.add(product.id);
                toast.success('Added to wishlist');
            }
            if (onWishlistChange) onWishlistChange();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update wishlist');
        }
    };

    return (
        <Link to={`/products/${product.id}`} className="product-card" id={`product-${product.id}`}>
            <div className="product-card-image">
                <img
                    src={product.imageUrl || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    loading="lazy"
                />
                {hasDiscount && (
                    <span className="product-card-badge">-{discountPercent}%</span>
                )}
                <div className="product-card-actions">
                    <button
                        onClick={handleToggleWishlist}
                        className={product.inWishlist ? 'wishlisted' : ''}
                        title={product.inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <FiHeart size={16} fill={product.inWishlist ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={handleAddToCart} title="Add to cart">
                        <FiShoppingCart size={16} />
                    </button>
                </div>
            </div>
            <div className="product-card-body">
                {product.categoryName && (
                    <div className="product-card-category">{product.categoryName}</div>
                )}
                <h3 className="product-card-name">{product.name}</h3>
                <div className="product-card-rating">
                    <span className="stars">{renderStars(product.rating)}</span>
                    <span>({product.reviewCount || 0})</span>
                </div>
                <div className="product-card-price">
                    <span className="current">
                        ₹{hasDiscount ? product.discountPrice?.toFixed(2) : product.price?.toFixed(2)}
                    </span>
                    {hasDiscount && (
                        <>
                            <span className="original">₹{product.price?.toFixed(2)}</span>
                            <span className="discount">-{discountPercent}%</span>
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
