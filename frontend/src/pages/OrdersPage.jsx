import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiTruck, FiMapPin, FiDownload } from 'react-icons/fi';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) fetchOrders();
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        try {
            const response = await orderAPI.getAll();
            setOrders(response.data.data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadInvoice = (order) => {
        const gstRate = 0.18;
        const preGstAmount = order.totalAmount / (1 + gstRate);
        const gstAmount = order.totalAmount - preGstAmount;

        let invoiceHtml = `
        <html><head><meta charset="UTF-8"><title>Invoice #${order.id}</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
            .invoice-title { font-size: 32px; font-weight: 700; color: #6366f1; }
            .invoice-meta { text-align: right; }
            .invoice-meta p { margin: 4px 0; font-size: 14px; }
            .section { margin: 20px 0; }
            .section h3 { color: #6366f1; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background: #f3f4f6; padding: 10px; text-align: left; font-size: 13px; text-transform: uppercase; }
            td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
            .totals { text-align: right; margin-top: 20px; }
            .totals p { margin: 6px 0; font-size: 14px; }
            .totals .grand-total { font-size: 20px; font-weight: 700; color: #6366f1; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        </style></head><body>
        <div class="invoice-header">
            <div><div class="invoice-title">INVOICE</div><p>ShopEase Online Shopping</p></div>
            <div class="invoice-meta">
                <p><strong>Invoice #:</strong> INV-${order.id}</p>
                <p><strong>Date:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
                <p><strong>Status:</strong> ${order.status}</p>
            </div>
        </div>
        <div class="section"><h3>Shipping Details</h3>
            <p><strong>${order.shippingName || ''}</strong></p>
            <p>${order.shippingAddress || ''}, ${order.shippingCity || ''}, ${order.shippingState || ''} - ${order.shippingZip || ''}</p>
            <p>Phone: ${order.shippingPhone || ''}</p>
        </div>
        <div class="section"><h3>Order Items</h3>
            <table>
                <thead><tr><th>#</th><th>Product</th><th>Seller</th><th>GST No.</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                <tbody>`;

        order.items?.forEach((item, i) => {
            invoiceHtml += `<tr>
                <td>${i + 1}</td>
                <td>${item.productName}</td>
                <td>${item.sellerName || 'ShopEase Store'}</td>
                <td>${item.sellerGstNumber || 'N/A'}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price?.toFixed(2)}</td>
                <td>₹${item.subtotal?.toFixed(2)}</td>
            </tr>`;
        });

        invoiceHtml += `</tbody></table></div>
        <div class="totals">
            <p>Pre-GST Amount: <strong>₹${preGstAmount.toFixed(2)}</strong></p>
            <p>GST (18%): <strong>₹${gstAmount.toFixed(2)}</strong></p>
            <p class="grand-total">Total: ₹${order.totalAmount?.toFixed(2)}</p>
        </div>
        <div class="footer"><p>Thank you for shopping with ShopEase!</p><p>For support: shopeaseshoppingapp@gmail.com</p></div>
        </body></html>`;

        const blob = new Blob([invoiceHtml], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'SHIPPED': return <FiTruck />;
            case 'DELIVERED': return <FiPackage />;
            default: return <FiPackage />;
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="empty-state">
                <div className="icon">📦</div>
                <h2>Please sign in</h2>
                <p>Sign in to view your orders</p>
                <Link to="/login" className="btn btn-primary">Sign In</Link>
            </div>
        );
    }

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="orders-page">
            <h1 className="page-title">My Orders</h1>

            {orders.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">📦</div>
                    <h2>No orders yet</h2>
                    <p>Start shopping to see your orders here</p>
                    <Link to="/shop" className="btn btn-primary">Browse Products</Link>
                </div>
            ) : (
                orders.map(order => (
                    <div key={order.id} className="order-card">
                        <div className="order-card-header">
                            <div>
                                <span className="order-id">Order #{order.id}</span>
                                <span className="order-date" style={{ marginLeft: 16 }}>
                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className={`order-status ${order.status?.toLowerCase()}`}>
                                    {getStatusIcon(order.status)} {order.status}
                                </span>
                            </div>
                        </div>

                        {/* Order tracking bar */}
                        <div className="order-tracking">
                            {['PENDING','PAID','PROCESSING','SHIPPED','DELIVERED'].map((step, i) => {
                                const statusOrder = ['PENDING','PAID','PROCESSING','SHIPPED','DELIVERED'];
                                const currentIdx = statusOrder.indexOf(order.status);
                                const isCompleted = i <= currentIdx;
                                return (
                                    <div key={step} className={`tracking-step ${isCompleted ? 'completed' : ''}`}>
                                        <div className="tracking-dot" />
                                        <span>{step.charAt(0) + step.slice(1).toLowerCase()}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="order-card-body">
                            {order.items?.map(item => (
                                <div key={item.id} className="order-item">
                                    <div className="order-item-image">
                                        <img src={item.productImage || 'https://via.placeholder.com/64'} alt={item.productName} />
                                    </div>
                                    <div className="order-item-info">
                                        <Link to={`/products/${item.productId}`} className="order-item-name">
                                            {item.productName}
                                        </Link>
                                        <span className="order-item-qty">Qty: {item.quantity}</span>
                                        {item.sellerName && <span className="order-item-seller">Sold by: {item.sellerName}</span>}
                                    </div>
                                    <span className="order-item-price">₹{item.subtotal?.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="order-card-footer">
                            <div>
                                {order.shippingAddress && (
                                    <span style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        fontSize: '0.85rem', color: 'var(--text-secondary)'
                                    }}>
                                        <FiMapPin size={14} />
                                        {order.shippingCity}, {order.shippingState}
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                {order.trackingNumber && (
                                    <span style={{
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        fontSize: '0.85rem', color: 'var(--blue-600)'
                                    }}>
                                        <FiTruck size={14} /> {order.trackingNumber}
                                    </span>
                                )}
                                <span className="order-total">Total: ₹{order.totalAmount?.toFixed(2)}</span>
                                {(order.status === 'PAID' || order.status === 'DELIVERED' || order.status === 'SHIPPED') && (
                                    <button className="btn btn-sm btn-outline" onClick={() => downloadInvoice(order)}>
                                        <FiDownload size={14} /> Invoice
                                    </button>
                                )}
                                {order.status === 'DELIVERED' && (
                                    <button 
                                        className="btn btn-sm btn-outline" 
                                        style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
                                        onClick={async () => {
                                            if (window.confirm('Are you sure you want to request a return for this order? (Only valid for items with a 7-day return policy)')) {
                                                try {
                                                    await orderAPI.updateStatus(order.id, 'RETURN_REQUESTED');
                                                    fetchOrders();
                                                } catch(e) {}
                                            }
                                        }}
                                    >
                                        Return Order
                                    </button>
                                )}
                                {order.status === 'RETURN_REQUESTED' && (
                                    <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600 }}>Return Requested</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default OrdersPage;
