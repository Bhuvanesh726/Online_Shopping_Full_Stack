import { useState, useEffect } from 'react';
import { FiUsers, FiShoppingBag, FiTrash2, FiSearch, FiShield } from 'react-icons/fi';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('consumers');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [user]);

    const fetchUsers = async () => {
        try {
            const res = await adminAPI.getAllUsers();
            setUsers(res.data);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await adminAPI.deleteUser(id);
            toast.success(`Deleted "${name}" successfully`);
            fetchUsers();
        } catch {
            toast.error('Failed to delete user');
        }
    };

    const consumers = users.filter(u => u.role === 'BUYER');
    const sellers = users.filter(u => u.role === 'SELLER');

    const filteredList = (activeTab === 'consumers' ? consumers : sellers).filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="page-loading"><div className="spinner" /></div>;

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <div className="admin-header-content">
                    <div className="admin-icon"><FiShield size={28} /></div>
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>Manage consumers and sellers</p>
                    </div>
                </div>
            </div>

            <div className="admin-stats">
                <div className="admin-stat-card">
                    <FiUsers size={24} />
                    <div>
                        <h3>{consumers.length}</h3>
                        <p>Total Consumers</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <FiShoppingBag size={24} />
                    <div>
                        <h3>{sellers.length}</h3>
                        <p>Total Sellers</p>
                    </div>
                </div>
            </div>

            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'consumers' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('consumers'); setSearchTerm(''); }}
                >
                    <FiUsers /> Consumers ({consumers.length})
                </button>
                <button
                    className={`admin-tab ${activeTab === 'sellers' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('sellers'); setSearchTerm(''); }}
                >
                    <FiShoppingBag /> Sellers ({sellers.length})
                </button>
            </div>

            <div className="admin-search">
                <FiSearch className="admin-search-icon" />
                <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="admin-user-list">
                {filteredList.length === 0 ? (
                    <div className="empty-state">
                        <FiUsers size={48} />
                        <h3>No {activeTab} found</h3>
                    </div>
                ) : (
                    filteredList.map(u => (
                        <div key={u.id} className="admin-user-card">
                            <div className="admin-user-avatar">
                                {u.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="admin-user-info">
                                <h4>{u.name}</h4>
                                <p>{u.email}</p>
                                {u.role === 'SELLER' && u.gstNumber && (
                                    <span className="admin-user-gst">GST: {u.gstNumber}</span>
                                )}
                                {u.role === 'SELLER' && u.companyName && (
                                    <span className="admin-user-company">{u.companyName}</span>
                                )}
                                {u.phone && <span className="admin-user-phone">📞 {u.phone}</span>}
                            </div>
                            <div className="admin-user-meta">
                                <span className={`admin-role-badge ${u.role?.toLowerCase()}`}>
                                    {u.role}
                                </span>
                                <span className="admin-user-date">
                                    Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <button
                                className="admin-delete-btn"
                                onClick={() => handleDelete(u.id, u.name)}
                                title="Delete user"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
