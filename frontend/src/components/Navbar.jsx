import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiPackage, FiLogOut, FiGrid, FiChevronDown, FiMessageSquare, FiBarChart2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { cart } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const isAdmin = user?.role === 'ADMIN';
    const isSeller = user?.role === 'SELLER';
    const isBuyer = isAuthenticated && !isAdmin && !isSeller;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        logout();
        setShowDropdown(false);
        navigate('/');
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                {/* Logo — sellers link to their dashboard, others to home */}
                <Link to={isSeller ? '/seller' : '/'} className="navbar-logo">
                    <div className="logo-icon">🛍</div>
                    <span>ShopEase</span>
                </Link>

                {/* Search bar — buyers only */}
                {isBuyer && (
                    <form className="navbar-search" onSubmit={handleSearch}>
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search for products, brands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                )}

                <div className="navbar-actions">
                    {/* ── Buyer nav links ── */}
                    {isBuyer && (
                        <>
                            <Link to="/shop" className="nav-btn">
                                <FiGrid className="icon" />
                                <span>Shop</span>
                            </Link>
                            <Link to="/messages" className="nav-btn">
                                <FiMessageSquare className="icon" />
                                <span>Messages</span>
                            </Link>
                        </>
                    )}

                    {/* ── Seller nav links ── */}
                    {isSeller && (
                        <>
                            <Link to="/seller?tab=products" className="nav-btn">
                                <FiPackage className="icon" />
                                <span>Products</span>
                            </Link>
                            <Link to="/seller?tab=orders" className="nav-btn">
                                <FiPackage className="icon" />
                                <span>Orders</span>
                            </Link>
                            <Link to="/seller?tab=analytics" className="nav-btn">
                                <FiBarChart2 className="icon" />
                                <span>Analytics</span>
                            </Link>
                            <Link to="/messages" className="nav-btn">
                                <FiMessageSquare className="icon" />
                                <span>Messages</span>
                            </Link>
                        </>
                    )}

                    {/* ── Admin nav links ── */}
                    {isAdmin && (
                        <Link to="/admin" className="nav-btn">
                            <FiGrid className="icon" />
                            <span>Admin Panel</span>
                        </Link>
                    )}

                    {isAuthenticated ? (
                        <>
                            {/* Wishlist + Cart — buyers only */}
                            {isBuyer && (
                                <>
                                    <Link to="/wishlist" className="nav-btn">
                                        <FiHeart className="icon" />
                                    </Link>
                                    <Link to="/cart" className="nav-btn">
                                        <FiShoppingCart className="icon" />
                                        {cart.totalItems > 0 && (
                                            <span className="badge">{cart.totalItems}</span>
                                        )}
                                    </Link>
                                </>
                            )}

                            {/* User avatar dropdown */}
                            <div className="nav-user-menu" ref={dropdownRef}>
                                <button
                                    className="nav-user-btn"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    <div className="nav-user-avatar">
                                        {user?.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <span className="nav-user-name">{user?.name?.split(' ')[0]}</span>
                                    <FiChevronDown size={14} />
                                </button>

                                {showDropdown && (
                                    <div className="nav-dropdown">
                                        {/* Buyer-only dropdown items */}
                                        {isBuyer && (
                                            <>
                                                <Link to="/orders" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>
                                                    <FiPackage /> My Orders
                                                </Link>
                                                <Link to="/wishlist" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>
                                                    <FiHeart /> Wishlist
                                                </Link>
                                            </>
                                        )}
                                        {/* Seller-only dropdown items */}
                                        {isSeller && (
                                            <Link to="/seller" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>
                                                <FiGrid /> Seller Dashboard
                                            </Link>
                                        )}
                                        {/* Admin-only dropdown items */}
                                        {isAdmin && (
                                            <Link to="/admin" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>
                                                <FiGrid /> Admin Dashboard
                                            </Link>
                                        )}
                                        <div className="nav-dropdown-divider" />
                                        <button className="nav-dropdown-item danger" onClick={handleLogout}>
                                            <FiLogOut /> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-btn">
                                <FiUser className="icon" />
                                Sign In
                            </Link>
                            <Link to="/register" className="nav-btn nav-btn-primary">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
