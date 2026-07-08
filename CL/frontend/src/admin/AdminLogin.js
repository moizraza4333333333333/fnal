import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './admin.css';

function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            if (result.success) {
                navigate('/admin/dashboard');
            } else {
                setError(result.message || 'Login failed');
            }
        } catch (err) {
            setError('Server error. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <div className="admin-login-logo">
                    <img
                        src="/images/logo.webp"
                        alt="Leather Gateway"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <h1>Leather Gateway</h1>
                    <p>Admin Panel</p>
                </div>

                {error && <div className="admin-alert admin-alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="admin-form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@leathergateway.com"
                        />
                    </div>
                    <div className="admin-form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter password"
                        />
                    </div>
                    <button type="submit" className="admin-btn admin-btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="admin-login-footer">
                    <a href="/">← Back to Website</a>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
