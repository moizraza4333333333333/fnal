import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './admin.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function AdminDashboard() {
    const { user, token, logout } = useAuth();
    const [pages, setPages] = useState([]);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/api/pages`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setPages(data.data);
            })
            .catch(console.error);

        fetch(`${API_URL}/api/settings`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setSettings(data.data);
            })
            .catch(console.error);
    }, [token]);

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>Leather Gateway</h2>
                    <p>Admin Panel</p>
                </div>
                <nav className="admin-nav">
                    <Link to="/admin/dashboard" className="admin-nav-item active">Dashboard</Link>
                    <Link to="/admin/pages/home" className="admin-nav-item">Home Page</Link>
                    <Link to="/admin/pages/about" className="admin-nav-item">About Page</Link>
                    <Link to="/admin/pages/services" className="admin-nav-item">Services Page</Link>
                    <Link to="/admin/pages/products" className="admin-nav-item">Products Page</Link>
                    <Link to="/admin/pages/contact" className="admin-nav-item">Contact Page</Link>
                    <Link to="/admin/settings" className="admin-nav-item">Site Settings</Link>
                </nav>
                <div className="admin-sidebar-footer">
                    <span>Logged in as {user?.email}</span>
                    <button onClick={logout} className="admin-btn-logout">Logout</button>
                </div>
            </aside>

            <main className="admin-main">
                <div className="admin-header">
                    <h1>Dashboard</h1>
                </div>

                <div className="admin-stats-grid">
                    <div className="admin-stat-card">
                        <div className="admin-stat-value">{pages.length}</div>
                        <div className="admin-stat-label">Pages</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-value">{settings ? 'Configured' : 'Pending'}</div>
                        <div className="admin-stat-label">Site Settings</div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-value">Online</div>
                        <div className="admin-stat-label">Website Status</div>
                    </div>
                </div>

                <div className="admin-section">
                    <h2>Manage Pages</h2>
                    <p>Click on any page below to edit its content.</p>
                    <div className="admin-pages-grid">
                        {pages.map(page => (
                            <Link to={`/admin/pages/${page.id}`} key={page.id} className="admin-page-card">
                                <h3>{page.title}</h3>
                                <span className="admin-page-slug">/{page.slug}</span>
                                <span className="admin-page-edit">Click to Edit →</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
