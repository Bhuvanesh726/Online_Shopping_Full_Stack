import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { wishlistAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) fetchWishlist();
    }, [isAuthenticated]);

    const fetchWishlist = async () => {
        try {
            const response = await wishlistAPI.get();
            setWishlist(response.data.data || []);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="empty-state">
                <div className="icon">❤️</div>
                <h2>Please sign in</h2>
                <p>Sign in to view your wishlist</p>
                <Link to="/login" className="btn btn-primary">Sign In</Link>
            </div>
        );
    }

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="wishlist-page">
            <h1 className="page-title">
                <FiHeart style={{ marginRight: 8, verticalAlign: 'middle' }} />
                My Wishlist ({wishlist.length})
            </h1>

            {wishlist.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">❤️</div>
                    <h2>Your wishlist is empty</h2>
                    <p>Save products you love for later</p>
                    <Link to="/shop" className="btn btn-primary">Browse Products</Link>
                </div>
            ) : (
                <div className="products-grid">
                    {wishlist.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onWishlistChange={fetchWishlist}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
