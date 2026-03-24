import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState(searchParams.get('token') || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await authAPI.resetPassword({ token, newPassword });
            toast.success('Password reset successfully!');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Reset Password</h1>
                <p className="auth-subtitle">Enter your new password below</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="token">Reset Token</label>
                        <input
                            id="token"
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste your reset token"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
                <p className="auth-link">
                    <Link to="/login">Back to Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
