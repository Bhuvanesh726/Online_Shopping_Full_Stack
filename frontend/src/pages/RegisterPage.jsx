import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('BUYER');
    const [gstNumber, setGstNumber] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (role === 'SELLER' && !gstNumber.trim()) {
            toast.error('GST Number is required for sellers');
            return;
        }
        setLoading(true);
        try {
            await register(name, email, password, role, gstNumber, companyName);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Create Account</h1>
                <p className="auth-subtitle">Join ShopEase for a personalized experience</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required minLength={6} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">I want to</label>
                        <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="BUYER">Shop (Consumer)</option>
                            <option value="SELLER">Sell (Seller)</option>
                        </select>
                    </div>

                    {role === 'SELLER' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="companyName">Company / Store Name</label>
                                <input id="companyName" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your Store Name" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="gstNumber">GST Number *</label>
                                <input id="gstNumber" type="text" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="e.g. 22AAAAA0000A1Z5" required />
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>
                <p className="auth-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
