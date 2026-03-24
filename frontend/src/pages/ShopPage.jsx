import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productAPI, categoryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ShopPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        if (isAuthenticated && user?.role === 'ADMIN') {
            navigate('/admin');
            return;
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        setPage(0);
        fetchProducts(0);
    }, [selectedCategory, sortBy, sortDir, searchQuery]);

    const fetchCategories = async () => {
        try {
            const response = await categoryAPI.getAll();
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async (pageNum = page) => {
        try {
            setLoading(true);
            let response;

            if (searchQuery) {
                response = await productAPI.search(searchQuery, pageNum, 12);
            } else if (selectedCategory) {
                response = await productAPI.filter({
                    categoryId: selectedCategory,
                    page: pageNum,
                    size: 12,
                    sortBy,
                    sortDir,
                });
            } else {
                response = await productAPI.getAll(pageNum, 12, sortBy, sortDir);
            }

            const data = response.data.data;
            setProducts(data.products || []);
            setTotalPages(data.totalPages || 0);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchProducts(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="shop-layout">
            {/* Filter Sidebar */}
            <aside className="filter-sidebar">
                <div className="filter-section">
                    <h3>Categories</h3>
                    <div
                        className={`filter-option ${!selectedCategory ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('')}
                    >
                        All Products
                    </div>
                    {categories.map(cat => (
                        <div
                            key={cat.id}
                            className={`filter-option ${selectedCategory == cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </div>
                    ))}
                </div>

                <div className="filter-section">
                    <h3>Sort By</h3>
                    {[
                        { label: 'Newest First', sortBy: 'createdAt', sortDir: 'desc' },
                        { label: 'Price: Low to High', sortBy: 'price', sortDir: 'asc' },
                        { label: 'Price: High to Low', sortBy: 'price', sortDir: 'desc' },
                        { label: 'Top Rated', sortBy: 'rating', sortDir: 'desc' },
                        { label: 'Name A-Z', sortBy: 'name', sortDir: 'asc' },
                    ].map((opt, i) => (
                        <div
                            key={i}
                            className={`filter-option ${sortBy === opt.sortBy && sortDir === opt.sortDir ? 'active' : ''}`}
                            onClick={() => { setSortBy(opt.sortBy); setSortDir(opt.sortDir); }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            </aside>

            {/* Products */}
            <div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24
                }}>
                    <h1 className="page-title" style={{ marginBottom: 0, fontSize: '1.5rem' }}>
                        {searchQuery ? `Search: "${searchQuery}"` : selectedCategory ? categories.find(c => c.id == selectedCategory)?.name || 'Products' : 'All Products'}
                    </h1>
                </div>

                {loading ? (
                    <div className="loading-spinner"><div className="spinner"></div></div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">🔍</div>
                        <h2>No products found</h2>
                        <p>Try adjusting your filters or search query</p>
                    </div>
                ) : (
                    <>
                        <div className="products-grid">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} onWishlistChange={() => fetchProducts(page)} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        className={page === i ? 'active' : ''}
                                        onClick={() => handlePageChange(i)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ShopPage;
