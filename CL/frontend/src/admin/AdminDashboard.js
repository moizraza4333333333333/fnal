import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './admin.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function AdminDashboard() {
    const { user, token, logout } = useAuth();
    const [pages, setPages] = useState([]);
    const [settings, setSettings] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageFilter, setMessageFilter] = useState('unread');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const loadMessages = useCallback(() => {
        fetch(`${API_URL}/api/contact?status=${messageFilter}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setMessages(data.data);
            })
            .catch(console.error);
    }, [messageFilter, token]);

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

    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    const markMessageAsRead = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/contact/${id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) loadMessages();
        } catch (error) {
            console.error(error);
        }
    };

    const removeMessage = async (id) => {
        if (!window.confirm('Remove this contact message?')) return;
        try {
            const res = await fetch(`${API_URL}/api/contact/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) loadMessages();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="admin-layout">
            <div
                className={`admin-sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <h2>Leather Gateway</h2>
                    <p>Admin Panel</p>
                </div>
                <nav className="admin-nav">
                    <Link to="/admin/dashboard" className="admin-nav-item active" onClick={() => setSidebarOpen(false)}>Dashboard</Link>
                    <Link to="/admin/pages/home" className="admin-nav-item" onClick={() => setSidebarOpen(false)}>Home Page</Link>
                    <Link to="/admin/pages/about" className="admin-nav-item" onClick={() => setSidebarOpen(false)}>About Page</Link>
                    <Link to="/admin/pages/services" className="admin-nav-item" onClick={() => setSidebarOpen(false)}>Services Page</Link>
                    <Link to="/admin/pages/products" className="admin-nav-item" onClick={() => setSidebarOpen(false)}>Products Page</Link>
                    <Link to="/admin/pages/contact" className="admin-nav-item" onClick={() => setSidebarOpen(false)}>Contact Page</Link>
                    <Link to="/admin/settings" className="admin-nav-item" onClick={() => setSidebarOpen(false)}>Site Settings</Link>
                </nav>
                <div className="admin-sidebar-footer">
                    <span>Logged in as {user?.email}</span>
                    <button onClick={logout} className="admin-btn-logout">Logout</button>
                </div>
            </aside>

            <main className="admin-main">
                <div className="admin-header">
                    <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open menu">☰</button>
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
                        <div className="admin-stat-value">{messages.length}</div>
                        <div className="admin-stat-label">Visible Messages</div>
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
                                <span className="admin-page-edit">Click to Edit</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="admin-section">
                    <div className="admin-section-head">
                        <div>
                            <h2>Contact Messages</h2>
                            <p>View unread, read, or all messages received from the public contact form.</p>
                        </div>
                        <div className="admin-filter-tabs">
                            <button className={messageFilter === 'unread' ? 'active' : ''} onClick={() => setMessageFilter('unread')}>Unread</button>
                            <button className={messageFilter === 'read' ? 'active' : ''} onClick={() => setMessageFilter('read')}>Read</button>
                            <button className={messageFilter === 'all' ? 'active' : ''} onClick={() => setMessageFilter('all')}>All</button>
                        </div>
                    </div>
                    {messages.length === 0 ? (
                        <div className="admin-empty-card">No contact messages in this view.</div>
                    ) : (
                        <div className="admin-messages-list">
                            {messages.map(message => (
                                <div className={`admin-message-card ${message.is_read ? 'is-read' : 'is-unread'}`} key={message.id}>
                                    <div className="admin-message-head">
                                        <div>
                                            <h3>{message.name}</h3>
                                            <span>{new Date(message.created_at).toLocaleString()}</span>
                                        </div>
                                        <span className={`admin-message-status ${message.is_read ? 'read' : 'unread'}`}>
                                            {message.is_read ? 'Read' : 'Unread'}
                                        </span>
                                    </div>
                                    <div className="admin-message-links">
                                        <a href={`mailto:${message.email}`}>{message.email}</a>
                                        {message.phone && (
                                            <a href={`https://wa.me/${message.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                                {message.phone}
                                            </a>
                                        )}
                                    </div>
                                    <p>{message.message}</p>
                                    <div className="admin-message-actions">
                                        {!message.is_read && (
                                            <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => markMessageAsRead(message.id)}>
                                                Mark as Read
                                            </button>
                                        )}
                                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => removeMessage(message.id)}>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
