import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <h2>🛍 ShopEase</h2>
                    <p>
                        Your premium online shopping destination. Discover quality products,
                        enjoy secure payments, and experience personalized recommendations
                        powered by AI.
                    </p>
                </div>
                <div className="footer-col">
                    <h3>Shop</h3>
                    <Link to="/shop">All Products</Link>
                    <Link to="/shop?sort=new">New Arrivals</Link>
                    <Link to="/shop?sort=rated">Top Rated</Link>
                    <Link to="/shop">Best Deals</Link>
                </div>
                <div className="footer-col">
                    <h3>Account</h3>
                    <Link to="/orders">My Orders</Link>
                    <Link to="/wishlist">Wishlist</Link>
                    <Link to="/cart">Shopping Cart</Link>
                    <Link to="/login">Sign In</Link>
                </div>
                <div className="footer-col">
                    <h3>Support</h3>
                    <a href="#">Help Center</a>
                    <a href="#">Shipping Info</a>
                    <a href="#">Returns</a>
                    <a href="#">Contact Us</a>
                </div>
            </div>
            <div className="footer-bottom">
                <span>© 2026 ShopEase. All rights reserved.</span>
                <span>Secure payments powered by Razorpay</span>
            </div>
        </footer>
    );
};

export default Footer;
