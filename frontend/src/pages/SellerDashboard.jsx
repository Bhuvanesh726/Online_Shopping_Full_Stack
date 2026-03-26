import { useState, useEffect } from 'react';
import { FiPackage, FiPlusCircle, FiDollarSign, FiTruck, FiBox, FiEdit2, FiTrash2, FiCheck, FiX, FiGrid, FiChevronDown, FiMessageSquare, FiUploadCloud, FiImage } from 'react-icons/fi';
import { productAPI, categoryAPI, orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { ChatClient, messageAPI } from '../services/messageService';
import toast from 'react-hot-toast';
import { FiSend, FiUser } from 'react-icons/fi';

const SellerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('analytics'); // Changed default to analytics
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', description: '', price: '', discountPrice: '',
        stock: '', categoryId: '', brand: '', returnPolicies: '', features: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Chat State
    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatClient, setChatClient] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'SELLER') {
            navigate('/');
            return;
        }

        // Set active tab from URL query params
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        const contactId = params.get('contactId');

        if (tab && ['analytics', 'products', 'orders', 'add', 'messages'].includes(tab)) {
            setActiveTab(tab);
        }

        if (contactId) {
            handleSelectContact({ id: parseInt(contactId) });
        }

        fetchData();

        // Initialize Chat WebSocket
        const client = new ChatClient((msg) => {
            setChatMessages(prev => [...prev, msg]);
        });
        client.connect();
        setChatClient(client);

        return () => client.disconnect();
    }, [user, location.search]);

    const fetchData = async () => {
        try {
            const [prodRes, catRes, ordRes, contactRes] = await Promise.all([
                productAPI.getMyProducts(),
                categoryAPI.getAll(),
                orderAPI.getSellerOrders(),
                messageAPI.getContacts()
            ]);
            setProducts(prodRes.data?.data || []);
            setCategories(catRes.data?.data || catRes.data || []);
            setOrders(ordRes.data?.data || []);
            setContacts(contactRes.data?.data || []);
        } catch {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectContact = async (contact) => {
        setActiveContact(contact);
        try {
            const res = await messageAPI.getConversation(contact.id);
            setChatMessages(res.data?.data || []);
        } catch {
            toast.error('Failed to load conversation');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !activeContact) return;

        const messageDto = {
            receiverId: activeContact.id,
            content: chatInput
        };

        try {
            const res = await messageAPI.sendMessage(messageDto);
            setChatMessages(prev => [...prev, res.data.data]);
            setChatInput('');
        } catch {
            toast.error('Failed to send message');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size should not exceed 10MB");
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const priceNum = parseFloat(formData.price);
            const discountPriceNum = formData.discountPrice ? parseFloat(formData.discountPrice) : null;
            const stockNum = parseInt(formData.stock);
            const catIdNum = formData.categoryId ? parseInt(formData.categoryId) : null;

            if (isNaN(priceNum) || isNaN(stockNum)) {
                toast.error('Invalid price or stock');
                return;
            }

            if (!imageFile) {
                toast.error('Product image is required');
                return;
            }

            setIsUploading(true);
            const uploadRes = await productAPI.uploadImage(imageFile);
            const uploadedImageUrl = uploadRes.data.data;

            await productAPI.create({
                ...formData,
                price: priceNum,
                discountPrice: discountPriceNum,
                stock: stockNum,
                categoryId: isNaN(catIdNum) ? null : catIdNum,
                imageUrl: uploadedImageUrl
            });
            toast.success('Product added successfully!');
            setShowAddForm(false);
            setFormData({ name: '', description: '', price: '', discountPrice: '', stock: '', categoryId: '', brand: '', returnPolicies: '', features: '' });
            setImageFile(null);
            setImagePreview(null);
            fetchData();
        } catch (error) {
            console.error('Add product error:', error);
            toast.error(error.response?.data?.message || 'Failed to add product');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this product?')) return;
        try {
            await productAPI.delete(id);
            toast.success('Product removed');
            fetchData();
        } catch {
            toast.error('Failed to remove product');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await productAPI.update(id, { status: newStatus });
            toast.success('Status updated');
            fetchData();
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleOrderStatus = async (orderId, newStatus) => {
        try {
            await orderAPI.updateStatus(orderId, newStatus);
            toast.success('Order status updated');
            fetchData();
        } catch {
            toast.error('Failed to update order status');
        }
    };

    const totalRevenue = orders.filter(o => o.status === 'PAID' || o.status === 'DELIVERED' || o.status === 'SHIPPED').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
    const pendingOrders = orders.filter(o => o.status === 'PAID' || o.status === 'PROCESSING').length;
    const returnedOrders = orders.filter(o => o.status === 'RETURNED').length;

    // Chart Data Preparation
    const categoryData = categories.map(cat => ({
        name: cat.name,
        value: products.filter(p => p.categoryId === cat.id).length
    })).filter(d => d.value > 0);

    const orderStatusData = [
        { name: 'Delivered', value: deliveredOrders, color: '#22c55e' },
        { name: 'Pending', value: pendingOrders, color: '#ef4444' },
        { name: 'Returned', value: returnedOrders, color: '#6366f1' },
    ];

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

    if (loading) return <div className="page-loading"><div className="spinner" /></div>;

    return (
        <div className="seller-dashboard">
            <div className="seller-header">
                <h1>Seller Dashboard</h1>
                <p>Welcome back, {user?.name}</p>
            </div>

            <div className="seller-stats-grid">
                <div className="seller-stat"><FiDollarSign /><div><h3>₹{totalRevenue.toFixed(0)}</h3><p>Total Revenue</p></div></div>
                <div className="seller-stat"><FiPackage /><div><h3>{products.length}</h3><p>Total Products</p></div></div>
                <div className="seller-stat"><FiTruck /><div><h3>{orders.length}</h3><p>Total Orders</p></div></div>
                <div className="seller-stat"><FiBox /><div><h3>{returnedOrders}</h3><p>Returns</p></div></div>
            </div>

            <div className="seller-tabs">
                <button className={`seller-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => navigate('/seller?tab=analytics')}><FiGrid /> Analytics</button>
                <button className={`seller-tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => navigate('/seller?tab=products')}><FiPackage /> My Products</button>
                <button className={`seller-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => navigate('/seller?tab=orders')}><FiTruck /> Orders</button>
                <button className={`seller-tab ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => navigate('/seller?tab=messages')}><FiMessageSquare /> Messages</button>
                <button className={`seller-tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => navigate('/seller?tab=add')}><FiPlusCircle /> Add Item</button>
            </div>

            {activeTab === 'analytics' && (
                <div className="seller-analytics-section">
                    <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                        <div className="analytics-card" style={{ background: 'var(--white)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: 600 }}>Product Distribution by Category</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="analytics-card" style={{ background: 'var(--white)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: 600 }}>Order Fulfillment Overview</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={orderStatusData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{fill: 'var(--gray-50)'}} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {orderStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="seller-orders-section">
                    <div className="section-header" style={{ marginBottom: '24px' }}>
                        <div>
                            <h2>Order Management</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Browse your orders by category for better workflow</p>
                        </div>
                    </div>

                    {orders.length === 0 ? (
                        <div className="empty-state"><FiPackage size={48} /><h3>No orders yet</h3></div>
                    ) : (
                        <div className="hierarchical-orders">
                            {categories.map(category => {
                                // Products in this category that have orders
                                const productsInCatWithOrders = products.filter(p => 
                                    p.categoryId === category.id && 
                                    orders.some(o => o.items.some(item => item.productId === p.id))
                                );

                                if (productsInCatWithOrders.length === 0) return null;

                                return (
                                    <details key={category.id} className="category-order-group" style={{ marginBottom: '16px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                        <summary style={{ padding: '16px 20px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', listStyle: 'none', background: 'var(--gray-100)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <FiGrid className="text-primary" />
                                                <span>{category.name}</span>
                                            </div>
                                            <FiChevronDown />
                                        </summary>
                                        <div style={{ padding: '16px 16px 1px' }}>
                                            {productsInCatWithOrders.map(product => {
                                                const productOrders = orders.filter(o => o.items.some(item => item.productId === product.id));
                                                
                                                return (
                                                    <details key={product.id} style={{ marginBottom: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                                        <summary style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--gray-50)' }}>
                                                            <img src={product.imageUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                                                            <span style={{ fontWeight: 600, flex: 1 }}>{product.name}</span>
                                                            <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem' }}>{productOrders.length} Orders</span>
                                                        </summary>
                                                        <div style={{ padding: '12px' }}>
                                                            {productOrders.map(order => (
                                                                <div key={order.id} className="seller-order-card" style={{ marginBottom: '12px', background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                                                        <div>
                                                                            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Order #{order.id}</h4>
                                                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                                                        </div>
                                                                        <div style={{ textAlign: 'right' }}>
                                                                            <span style={{ display: 'block', fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>₹{order.totalAmount?.toFixed(2)}</span>
                                                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{order.status}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px', padding: '12px', background: 'var(--blue-50)', borderRadius: 'var(--radius-sm)' }}>
                                                                        <div>
                                                                            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--blue-600)', fontWeight: 700, marginBottom: '4px' }}>Buyer Name</p>
                                                                            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{order.shippingName}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--blue-600)', fontWeight: 700, marginBottom: '4px' }}>Ship To</p>
                                                                            <p style={{ fontSize: '0.8rem' }}>{order.shippingCity}, {order.shippingState}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="tracking-timeline" style={{ position: 'relative', padding: '12px 0 24px', margin: '16px 0' }}>
                                                                        <div style={{ height: '3px', background: 'var(--gray-200)', position: 'absolute', top: '24px', left: '10%', right: '10%', zIndex: 0 }}></div>
                                                                        <div style={{ height: '3px', background: 'var(--primary)', position: 'absolute', top: '24px', left: '10%', width: order.status === 'DELIVERED' ? '80%' : (order.status === 'SHIPPED' ? '40%' : '5%'), zIndex: 1, transition: 'width 0.5s ease' }}></div>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                                                                            {['RECEIVED', 'DISPATCHED', 'DELIVERED'].map((step, i) => {
                                                                                const isActive = (i === 0) || (i === 1 && (order.status === 'SHIPPED' || order.status === 'DELIVERED')) || (i === 2 && order.status === 'DELIVERED');
                                                                                return (
                                                                                    <div key={step} style={{ textAlign: 'center', width: '60px' }}>
                                                                                        <div style={{ width: '24px', height: '24px', background: isActive ? 'var(--primary)' : 'var(--white)', border: `2px solid ${isActive ? 'var(--primary)' : 'var(--gray-300)'}`, borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                            {isActive && <FiCheck size={12} color="white" />}
                                                                                        </div>
                                                                                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step}</span>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>

                                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                                        {(order.status === 'PAID' || order.status === 'PROCESSING') && (
                                                                            <button className="btn btn-sm btn-primary" onClick={() => handleOrderStatus(order.id, 'SHIPPED')}><FiTruck /> Dispatch</button>
                                                                        )}
                                                                        {order.status === 'SHIPPED' && (
                                                                            <button className="btn btn-sm btn-primary" onClick={() => handleOrderStatus(order.id, 'DELIVERED')}><FiCheck /> Deliver</button>
                                                                        )}
                                                                        <button className="btn btn-sm btn-ghost" style={{ border: '1px solid var(--border)' }} onClick={() => navigate(`/seller?tab=messages&contactId=${order.userId}`)}>
                                                                            <FiMessageSquare /> Message Buyer
                                                                        </button>
                                                                        
                                                                        {order.status === 'RETURN_REQUESTED' ? (
                                                                            <>
                                                                                <button className="btn btn-sm btn-primary" style={{ background: '#f59e0b', color: 'white' }} onClick={() => handleOrderStatus(order.id, 'RETURN_APPROVED')}>
                                                                                    <FiCheck /> Approve Return
                                                                                </button>
                                                                                <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }} onClick={() => handleOrderStatus(order.id, 'RETURN_REJECTED')}>
                                                                                    <FiX /> Reject Return
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }} onClick={() => {
                                                                                if (window.confirm("Manually cancel or force return this order?")) {
                                                                                    handleOrderStatus(order.id, 'RETURNED');
                                                                                }
                                                                            }}>
                                                                                <FiX /> Cancel/Return
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </details>
                                                );
                                            })}
                                        </div>
                                    </details>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'products' && (
                <div className="seller-products-section">
                    <h2>My Products</h2>
                    {products.length === 0 ? (
                        <div className="empty-state"><FiBox size={48} /><h3>No products yet</h3><button className="btn btn-primary" onClick={() => setActiveTab('add')}>Add Your First Product</button></div>
                    ) : (
                        <div className="seller-products-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Image</th><th>Name</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td><img src={p.imageUrl || 'https://via.placeholder.com/50'} alt={p.name} className="seller-product-thumb" /></td>
                                            <td>
                                                <div className="seller-product-name">{p.name}</div>
                                                <div className="seller-product-brand">{p.brand}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>₹{p.price?.toFixed(2)}</div>
                                                {p.discountPrice > 0 && (
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--green-600)' }}>₹{p.discountPrice?.toFixed(2)} sale</div>
                                                )}
                                            </td>
                                            <td><span className={p.stock > 0 ? 'text-green' : 'text-red'}>{p.stock}</span></td>
                                            <td>
                                                <select
                                                    className="seller-status-select"
                                                    value={p.status || 'ACTIVE'}
                                                    onChange={e => handleStatusUpdate(p.id, e.target.value)}
                                                >
                                                    <option value="ACTIVE">Active</option>
                                                    <option value="OUT_OF_STOCK">Out of Stock</option>
                                                    <option value="REMOVED">Removed</option>
                                                </select>
                                            </td>
                                            <td>
                                                <button className="btn-icon sm" title="Delete" onClick={() => handleDelete(p.id)}><FiTrash2 size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'add' && (
                <div className="seller-add-section">
                    <h2>Add New Product</h2>
                    <form className="seller-add-form" onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Product Name *</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter product name" />
                            </div>
                            <div className="form-group">
                                <label>Brand</label>
                                <input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="Brand name" />
                            </div>
                            <div className="form-group">
                                <label>Price (₹) *</label>
                                <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
                            </div>
                            <div className="form-group">
                                <label>Discount Price (₹)</label>
                                <input type="number" step="0.01" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})} placeholder="0.00" />
                            </div>
                            <div className="form-group">
                                <label>Stock Quantity *</label>
                                <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="Available quantity" />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group full-width">
                                <label>Product Image *</label>
                                <div className="image-upload-container" style={{ position: 'relative', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', textAlign: 'center', background: 'var(--gray-50)', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                                    <input type="file" required={!imageFile} accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                                    {imagePreview ? (
                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <img src={imagePreview} alt="Preview" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }} />
                                            <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click or drag to change image</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1 }}>
                                            <FiUploadCloud size={32} color="var(--primary)" />
                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Click to upload or drag and drop</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SVG, PNG, JPG or GIF (max. 10MB)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="form-group full-width">
                                <label>Product Description</label>
                                <textarea 
                                    rows={5} 
                                    value={formData.description} 
                                    onChange={e => setFormData({...formData, description: e.target.value})} 
                                    placeholder="Provide a detailed description of your product..." 
                                    style={{ padding: '16px', fontSize: '0.95rem', lineHeight: '1.6', borderRadius: 'var(--radius-md)' }}
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Key Features & Policies (Select all that apply)</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', background: 'var(--gray-50)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                    {['Free Delivery', 'Cash on Delivery', '7 Days Return', '10 Days Replacement', '1 Year Warranty', 'Top Brand', 'Secure Transaction', '24/7 Customer Support', 'Original Product', 'Quality Checked'].map(feature => {
                                        const currentFeatures = formData.features ? formData.features.split(',').map(f => f.trim()).filter(Boolean) : [];
                                        const isSelected = currentFeatures.includes(feature);
                                        return (
                                            <label key={feature} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 14px', background: isSelected ? 'var(--primary-light)' : 'var(--white)', border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', transition: 'all 0.2s', fontSize: '0.9rem', fontWeight: isSelected ? 600 : 500, color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            currentFeatures.push(feature);
                                                        } else {
                                                            const idx = currentFeatures.indexOf(feature);
                                                            if (idx > -1) currentFeatures.splice(idx, 1);
                                                        }
                                                        setFormData({...formData, features: currentFeatures.join(', ')});
                                                    }}
                                                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                                                />
                                                {feature}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn btn-ghost" onClick={() => setActiveTab('products')}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isUploading}>
                                {isUploading ? <><span className="spinner-sm" style={{display: 'inline-block', width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '8px'}}/> Uploading...</> : <><FiPlusCircle /> Add Product</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {activeTab === 'messages' && (
                <div className="seller-messages-section chat-layout">
                    <div className="chat-sidebar">
                        <div className="sidebar-header">
                            <h3>Conversations</h3>
                        </div>
                        <div className="contact-list">
                            {contacts.length === 0 ? (
                                <p className="no-contacts">No conversations yet</p>
                            ) : (
                                contacts.map(contact => (
                                    <div 
                                        key={contact.id} 
                                        className={`contact-item ${activeContact?.id === contact.id ? 'active' : ''}`}
                                        onClick={() => handleSelectContact(contact)}
                                    >
                                        <div className="contact-avatar"><FiUser /></div>
                                        <div className="contact-info">
                                            <p className="contact-name">{contact.name}</p>
                                            <p className="contact-email">{contact.email}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="chat-main">
                        {activeContact ? (
                            <>
                                <div className="chat-header">
                                    <div className="header-info">
                                        <div className="avatar"><FiUser /></div>
                                        <div>
                                            <h4>{activeContact.name}</h4>
                                            <span>{activeContact.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="messages-list">
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} className={`message-wrapper ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                                            <div className="message-bubble">
                                                <p>{msg.content}</p>
                                                <span className="time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <form className="chat-footer" onSubmit={handleSendMessage}>
                                    <input 
                                        type="text" 
                                        placeholder="Type a message..." 
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                    />
                                    <button type="submit" disabled={!chatInput.trim()}><FiSend /></button>
                                </form>
                            </>
                        ) : (
                            <div className="chat-placeholder">
                                <FiMessageSquare size={48} />
                                <p>Select a conversation to start chatting</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;
