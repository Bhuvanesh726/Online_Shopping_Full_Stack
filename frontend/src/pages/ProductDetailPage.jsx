import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar, FiCheck, FiMinus, FiPlus, FiChevronRight, FiMessageSquare, FiTruck, FiShield, FiRefreshCcw, FiHeadphones, FiAward, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { productAPI, reviewAPI, wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const [productRes, reviewsRes, relatedRes] = await Promise.all([
                productAPI.getById(id),
                reviewAPI.getByProduct(id),
                productAPI.getRelated(id),
            ]);
            setProduct(productRes.data.data);
            setReviews(reviewsRes.data.data || []);
            setRelatedProducts(relatedRes.data.data || []);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Product not found');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        try {
            await addToCart(product.id, quantity);
            toast.success('Added to cart!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add');
        }
    };

    const handleToggleWishlist = async () => {
        if (!isAuthenticated) { navigate('/login'); return; }
        try {
            if (product.inWishlist) {
                await wishlistAPI.remove(product.id);
                setProduct(prev => ({ ...prev, inWishlist: false }));
                toast.success('Removed from wishlist');
            } else {
                await wishlistAPI.add(product.id);
                setProduct(prev => ({ ...prev, inWishlist: true }));
                toast.success('Added to wishlist');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) { navigate('/login'); return; }
        setSubmittingReview(true);
        try {
            await reviewAPI.create(id, reviewForm);
            toast.success('Review submitted!');
            setReviewForm({ rating: 5, comment: '' });
            fetchProduct();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const images = product ? [product.imageUrl, product.imageUrl2, product.imageUrl3].filter(Boolean) : [];
    const hasDiscount = product?.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price;
    const discountPercent = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

    const renderStars = (rating, size = 16) => {
        return Array.from({ length: 5 }, (_, i) => (
            <FiStar key={i} size={size} fill={i < rating ? '#f59e0b' : 'none'} color="#f59e0b" />
        ));
    };

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
    if (!product) return <div className="empty-state"><h2>Product not found</h2></div>;

    return (
        <div className="product-detail">
            <div className="product-detail-grid">
                {/* Gallery */}
                <div className="product-gallery">
                    <div className="product-gallery-main">
                        <img src={images[selectedImage] || product.imageUrl} alt={product.name} />
                    </div>
                    {images.length > 1 && (
                        <div className="product-gallery-thumbs">
                            {images.map((img, i) => (
                                <div
                                    key={i}
                                    className={`product-gallery-thumb ${selectedImage === i ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(i)}
                                >
                                    <img src={img} alt={`${product.name} ${i + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="product-info">
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <FiChevronRight size={14} />
                        <Link to="/shop">Shop</Link>
                        {product.categoryName && (
                            <>
                                <FiChevronRight size={14} />
                                <Link to={`/shop?category=${product.categoryId}`}>{product.categoryName}</Link>
                            </>
                        )}
                    </div>

                    <h1>{product.name}</h1>
                    {product.brand && <p className="brand">by {product.brand}</p>}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <span className="stars">{renderStars(Math.round(product.rating || 0))}</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {product.rating?.toFixed(1)} ({product.reviewCount || 0} reviews)
                        </span>
                    </div>

                    <div className="price-section">
                        <span className="price-current">
                            ₹{hasDiscount ? product.discountPrice?.toFixed(2) : product.price?.toFixed(2)}
                        </span>
                        {hasDiscount && (
                            <>
                                <span className="price-original">₹{product.price?.toFixed(2)}</span>
                                <span className="price-discount">Save {discountPercent}%</span>
                            </>
                        )}
                    </div>

                    <p className="description" style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '16px' }}>{product.description}</p>

                    {product.features && (
                        <div className="product-features-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '24px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
                            {product.features.split(',').map(f => f.trim()).filter(Boolean).map(feature => {
                                let Icon = FiCheckCircle;
                                if (feature.includes('Delivery')) Icon = FiTruck;
                                else if (feature.includes('Return') || feature.includes('Replacement')) Icon = FiRefreshCcw;
                                else if (feature.includes('Warranty') || feature.includes('Secure') || feature.includes('Guarantee')) Icon = FiShield;
                                else if (feature.includes('Support')) Icon = FiHeadphones;
                                else if (feature.includes('Brand')) Icon = FiAward;
                                else if (feature.includes('Cash') || feature.includes('COD')) Icon = FiDollarSign;
                                
                                return (
                                    <div key={feature} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '80px', gap: '10px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--blue-50)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon size={24} />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.2' }}>{feature}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className={`stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        <FiCheck size={16} />
                        {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                    </div>

                    {product.stock > 0 && (
                        <>
                            <div className="quantity-selector">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                    <FiMinus />
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                                    min="1"
                                    max={product.stock}
                                />
                                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
                                    <FiPlus />
                                </button>
                            </div>

                            <div className="product-actions">
                                <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                                    <FiShoppingCart /> Add to Cart
                                </button>
                                <button
                                    className={`btn ${product.inWishlist ? 'btn-outline' : 'btn-outline'} btn-lg`}
                                    onClick={handleToggleWishlist}
                                    style={product.inWishlist ? { color: 'var(--error)', borderColor: 'var(--error)' } : {}}
                                >
                                    <FiHeart fill={product.inWishlist ? 'currentColor' : 'none'} />
                                    {product.inWishlist ? 'Wishlisted' : 'Wishlist'}
                                </button>
                                <button
                                    className="btn btn-outline btn-lg"
                                    onClick={() => navigate(`/messages?contactId=${product.sellerId}&contactName=${encodeURIComponent(product.sellerName || 'Seller')}`)}
                                >
                                    <FiMessageSquare /> Chat with Seller
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Reviews */}
            <div className="reviews-section">
                <h2 className="section-title">Customer Reviews ({reviews.length})</h2>

                {isAuthenticated && (
                    <form onSubmit={handleSubmitReview} style={{ marginTop: 24, marginBottom: 32 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>Write a Review</h3>
                        <div className="form-group">
                            <label>Rating</label>
                            <div style={{ display: 'flex', gap: 4, cursor: 'pointer' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <FiStar
                                        key={star}
                                        size={24}
                                        fill={star <= reviewForm.rating ? '#f59e0b' : 'none'}
                                        color="#f59e0b"
                                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                        style={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Comment</label>
                            <textarea
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder="Share your experience with this product..."
                                style={{
                                    width: '100%', padding: '12px 16px', border: '1.5px solid var(--border)',
                                    borderRadius: 'var(--radius-md)', minHeight: 100, resize: 'vertical',
                                    fontFamily: 'var(--font-family)', fontSize: '0.9rem'
                                }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                )}

                {reviews.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', padding: '24px 0' }}>No reviews yet. Be the first to review!</p>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="review-user">
                                    <div className="review-avatar">{review.userName?.charAt(0)?.toUpperCase()}</div>
                                    <span className="review-name">{review.userName}</span>
                                </div>
                                <span className="review-date">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="review-stars">{renderStars(review.rating, 14)}</div>
                            <p className="review-comment">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section style={{ marginTop: 48 }}>
                    <h2 className="section-title">Related Products</h2>
                    <div className="products-grid" style={{ marginTop: 24 }}>
                        {relatedProducts.slice(0, 4).map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProductDetailPage;
