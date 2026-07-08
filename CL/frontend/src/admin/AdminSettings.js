import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './admin.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function AdminSettings() {
    const { token } = useAuth();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/api/settings`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setSettings(data.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSocialChange = (index, field, value) => {
        setSettings(prev => {
            const links = [...(prev.socialLinks || [])];
            links[index] = { ...links[index], [field]: value };
            return { ...prev, socialLinks: links };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch(`${API_URL}/api/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            setMessage(data.success ? 'Settings saved!' : 'Error: ' + data.message);
        } catch (err) {
            setMessage('Error saving settings');
        }
        setSaving(false);
    };

    if (loading) return <div className="admin-layout"><main className="admin-main"><div className="admin-loading">Loading...</div></main></div>;

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>Leather Gateway</h2>
                    <p>Admin Panel</p>
                </div>
                <nav className="admin-nav">
                    <a href="/admin/dashboard" className="admin-nav-item">← Dashboard</a>
                    <a href="/admin/pages/home" className="admin-nav-item">Home Page</a>
                    <a href="/admin/pages/about" className="admin-nav-item">About Page</a>
                    <a href="/admin/pages/services" className="admin-nav-item">Services Page</a>
                    <a href="/admin/pages/products" className="admin-nav-item">Products Page</a>
                    <a href="/admin/pages/contact" className="admin-nav-item">Contact Page</a>
                    <a href="/admin/settings" className="admin-nav-item active">Site Settings</a>
                </nav>
            </aside>

            <main className="admin-main">
                <div className="admin-header">
                    <h1>Site Settings</h1>
                    <button onClick={handleSave} className="admin-btn admin-btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>

                {message && (
                    <div className={`admin-alert ${message.includes('Error') ? 'admin-alert-error' : 'admin-alert-success'}`}>
                        {message}
                    </div>
                )}

                {settings && (
                    <div className="admin-editor">
                        <div className="admin-form-group">
                            <label>Site Name</label>
                            <input value={settings.siteName} onChange={(e) => handleChange('siteName', e.target.value)} />
                        </div>
                        <div className="admin-form-group">
                            <label>Site Tagline</label>
                            <input value={settings.siteTagline} onChange={(e) => handleChange('siteTagline', e.target.value)} />
                        </div>
                        <div className="admin-form-group">
                            <label>Primary Color</label>
                            <input type="color" value={settings.primaryColor} onChange={(e) => handleChange('primaryColor', e.target.value)} />
                        </div>
                        <div className="admin-form-group">
                            <label>Secondary Color</label>
                            <input type="color" value={settings.secondaryColor} onChange={(e) => handleChange('secondaryColor', e.target.value)} />
                        </div>
                        <div className="admin-form-group">
                            <label>Dark Color</label>
                            <input type="color" value={settings.darkColor} onChange={(e) => handleChange('darkColor', e.target.value)} />
                        </div>
                        <div className="admin-form-group">
                            <label>Footer Text</label>
                            <input value={settings.footerText} onChange={(e) => handleChange('footerText', e.target.value)} />
                        </div>

                        <h3>Social Links</h3>
                        {settings.socialLinks?.map((link, i) => (
                            <div key={i} className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Platform</label>
                                    <input value={link.platform} onChange={(e) => handleSocialChange(i, 'platform', e.target.value)} />
                                </div>
                                <div className="admin-form-group">
                                    <label>URL</label>
                                    <input value={link.url} onChange={(e) => handleSocialChange(i, 'url', e.target.value)} />
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: '30px' }}>
                            <button onClick={handleSave} className="admin-btn admin-btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save All Settings'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminSettings;
