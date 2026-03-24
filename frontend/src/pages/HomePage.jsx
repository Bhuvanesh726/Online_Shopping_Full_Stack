import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiStar, FiZap } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { productAPI, categoryAPI, recommendationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const [newArrivals, setNewArrivals] = useState([]);
    const [topRated, setTopRated] = useState([]);
    const [categories, setCategories] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && user?.role === 'ADMIN') {
            navigate('/admin');
            return;
        }
        fetchData();
    }, [isAuthenticated, user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [arrivals, rated, cats] = await Promise.all([
                productAPI.getNewArrivals(),
                productAPI.getTopRated(),
                categoryAPI.getAll(),
            ]);
            setNewArrivals(arrivals.data.data || []);
            setTopRated(rated.data.data || []);
            setCategories(cats.data.data || []);

            if (isAuthenticated) {
                try {
                    const recs = await recommendationAPI.get();
                    setRecommendations(recs.data.data || []);
                } catch {
                    const publicRecs = await recommendationAPI.getPublic();
                    setRecommendations(publicRecs.data.data || []);
                }
            } else {
                try {
                    const publicRecs = await recommendationAPI.getPublic();
                    setRecommendations(publicRecs.data.data || []);
                } catch { /* ignore */ }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <FiZap size={14} /> AI-Powered Shopping Experience
                        </div>
                        <h1>
                            Discover Your<br />
                            <span className="highlight">Perfect Style</span>
                        </h1>
                        <p>
                            Explore thousands of curated products with personalized recommendations,
                            secure Razorpay payments, and seamless delivery tracking.
                        </p>
                        <div className="hero-actions">
                            <Link to="/shop" className="btn btn-primary btn-lg">
                                Shop Now <FiArrowRight />
                            </Link>
                            <Link to="/register" className="btn btn-outline btn-lg">
                                Join Free
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <h3>10K+</h3>
                                <p>Products</p>
                            </div>
                            <div className="hero-stat">
                                <h3>50K+</h3>
                                <p>Happy Customers</p>
                            </div>
                            <div className="hero-stat">
                                <h3>99%</h3>
                                <p>Satisfaction</p>
                            </div>
                        </div>
                    </div>
                    <div className="hero-image">
                        <div className="hero-image-grid">
                            <div className="hero-img-card">
                                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400" alt="Fashion" />
                            </div>
                            <div className="hero-img-card">
                                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" alt="Tech" />
                            </div>
                            <div className="hero-img-card">
                                <img src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400" alt="Beauty" />
                            </div>
                            <div className="hero-img-card">
                                <img src="https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400" alt="Home" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Strip */}
            <section style={{
                background: 'var(--white)',
                borderBottom: '1px solid var(--border)',
                padding: '24px'
            }}>
                <div style={{
                    maxWidth: 1280,
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-around',
                    flexWrap: 'wrap',
                    gap: 24
                }}>
                    {[
                        { icon: <FiTruck />, title: 'Free Shipping', desc: 'On orders over ₹500' },
                        { icon: <FiShield />, title: 'Secure Payments', desc: 'Powered by Razorpay' },
                        { icon: <FiStar />, title: 'AI Recommendations', desc: 'Personalized for you' },
                        { icon: <FiZap />, title: 'Fast Delivery', desc: 'Track your orders' },
                    ].map((f, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            fontSize: '0.9rem'
                        }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 'var(--radius-md)',
                                background: i % 2 === 0 ? 'var(--green-50)' : 'var(--blue-50)',
                                color: i % 2 === 0 ? 'var(--green-600)' : 'var(--blue-600)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem'
                            }}>{f.icon}</div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{f.title}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{f.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Categories */}
            <section className="section">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Shop by Category</h2>
                        <p className="section-subtitle">Browse our curated collection of products</p>
                    </div>
                    <Link to="/shop" className="section-link">
                        View All <FiArrowRight />
                    </Link>
                </div>
                <div className="categories-grid">
                    {categories.map(cat => (
                        <Link
                            key={cat.id}
                            to={`/shop?category=${cat.id}`}
                            className="category-card"
                        >
                            <img src={cat.imageUrl || 'https://via.placeholder.com/200'} alt={cat.name} />
                            <h3>{cat.name}</h3>
                            <p>{cat.description}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* AI Recommendations */}
            {recommendations.length > 0 && (
                <section className="section" style={{ background: 'var(--gray-50)', padding: '72px 24px' }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                        <div className="section-header">
                            <div>
                                <h2 className="section-title">
                                    <span style={{ marginRight: 8 }}>✨</span>
                                    {isAuthenticated ? 'Recommended for You' : 'Popular Products'}
                                </h2>
                                <p className="section-subtitle">
                                    {isAuthenticated
                                        ? 'AI-powered picks based on your preferences'
                                        : 'Trending products our customers love'}
                                </p>
                            </div>
                            <Link to="/shop" className="section-link">
                                View All <FiArrowRight />
                            </Link>
                        </div>
                        <div className="products-grid">
                            {recommendations.slice(0, 4).map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* New Arrivals */}
            <section className="section">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">New Arrivals</h2>
                        <p className="section-subtitle">Fresh additions to our collection</p>
                    </div>
                    <Link to="/shop?sort=new" className="section-link">
                        View All <FiArrowRight />
                    </Link>
                </div>
                <div className="products-grid">
                    {newArrivals.slice(0, 4).map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* Top Rated */}
            <section className="section" style={{ paddingTop: 0 }}>
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Top Rated</h2>
                        <p className="section-subtitle">Our highest-rated products</p>
                    </div>
                    <Link to="/shop?sort=rated" className="section-link">
                        View All <FiArrowRight />
                    </Link>
                </div>
                <div className="products-grid">
                    {topRated.slice(0, 4).map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>
        </>
    );
};

export default HomePage;
