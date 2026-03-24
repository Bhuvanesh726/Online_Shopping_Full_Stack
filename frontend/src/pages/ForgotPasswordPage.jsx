import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authAPI.forgotPassword(email);
            setSent(true);
            toast.success('Reset link sent! Check your inbox.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Forgot Password</h1>
                <p className="auth-subtitle">
                    {sent
                        ? 'Check your inbox for the reset link'
                        : 'Enter your email to receive a secure reset link'}
                </p>

                {!sent ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: 'var(--green-50)', border: '2px solid var(--green-200)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <FiMail size={32} style={{ color: 'var(--green-600)' }} />
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: '0.95rem' }}>
                            We sent a password reset link to:
                        </p>
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
                            {email}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                            The link expires in 1 hour. Check your spam folder if you don't see it.
                        </p>
                        <button
                            className="btn btn-ghost"
                            style={{ border: '1px solid var(--border)', width: '100%' }}
                            onClick={() => { setSent(false); setEmail(''); }}
                        >
                            <FiArrowLeft /> Try a different email
                        </button>
                    </div>
                )}

                <p className="auth-link">
                    Remember your password? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
