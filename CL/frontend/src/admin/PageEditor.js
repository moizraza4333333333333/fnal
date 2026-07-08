import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './admin.css';
import resolveImageUrl from '../utils/resolveImageUrl';

const API_URL = process.env.REACT_APP_API_URL || '';

function PageEditor() {
    const { pageId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetch(`${API_URL}/api/pages/${pageId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPage(data.data);
                    setFormData(data.data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [pageId, token]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayItemChange = (arrayField, index, key, value) => {
        setFormData(prev => {
            const updated = { ...prev };
            const arr = [...(updated[arrayField] || [])];
            arr[index] = { ...arr[index], [key]: value };
            updated[arrayField] = arr;
            return updated;
        });
    };

    const handleArrayAdd = (arrayField, template) => {
        setFormData(prev => {
            const updated = { ...prev };
            const arr = [...(updated[arrayField] || []), { ...template }];
            updated[arrayField] = arr;
            return updated;
        });
    };

    const handleArrayRemove = (arrayField, index) => {
        setFormData(prev => {
            const updated = { ...prev };
            updated[arrayField] = (updated[arrayField] || []).filter((_, i) => i !== index);
            return updated;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch(`${API_URL}/api/pages/${pageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setMessage('Page saved successfully!');
            } else {
                setMessage('Error saving page: ' + data.message);
            }
        } catch (err) {
            setMessage('Error saving page');
        }
        setSaving(false);
    };

    if (loading) return <div className="admin-main"><div className="admin-loading">Loading...</div></div>;
    if (!page) return <div className="admin-main"><div className="admin-loading">Page not found</div></div>;

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>Leather Gateway</h2>
                    <p>Admin Panel</p>
                </div>
                <nav className="admin-nav">
                    <a href="/admin/dashboard" className="admin-nav-item">← Dashboard</a>
                    <a href="/admin/pages/home" className={`admin-nav-item ${pageId === 'home' ? 'active' : ''}`}>Home Page</a>
                    <a href="/admin/pages/about" className={`admin-nav-item ${pageId === 'about' ? 'active' : ''}`}>About Page</a>
                    <a href="/admin/pages/services" className={`admin-nav-item ${pageId === 'services' ? 'active' : ''}`}>Services Page</a>
                    <a href="/admin/pages/products" className={`admin-nav-item ${pageId === 'products' ? 'active' : ''}`}>Products Page</a>
                    <a href="/admin/pages/contact" className={`admin-nav-item ${pageId === 'contact' ? 'active' : ''}`}>Contact Page</a>
                    <a href="/admin/settings" className="admin-nav-item">Site Settings</a>
                </nav>
            </aside>

            <main className="admin-main">
                <div className="admin-header">
                    <h1>Editing: {formData.title || page.title}</h1>
                    <button onClick={handleSave} className="admin-btn admin-btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {message && (
                    <div className={`admin-alert ${message.includes('Error') ? 'admin-alert-error' : 'admin-alert-success'}`}>
                        {message}
                    </div>
                )}

                <div className="admin-editor">
                    {/* Title Field */}
                    <div className="admin-form-group">
                        <label>Page Title</label>
                        <input
                            type="text"
                            value={formData.title || ''}
                            onChange={(e) => handleChange('title', e.target.value)}
                        />
                    </div>

                    {/* Hero Fields */}
                    {formData.heroHeading !== undefined && (
                        <div className="admin-form-group">
                            <label>Hero Heading</label>
                            <input
                                type="text"
                                value={formData.heroHeading || ''}
                                onChange={(e) => handleChange('heroHeading', e.target.value)}
                            />
                        </div>
                    )}
                    {formData.heroText !== undefined && (
                        <div className="admin-form-group">
                            <label>Hero Text</label>
                            <textarea
                                rows="3"
                                value={formData.heroText || ''}
                                onChange={(e) => handleChange('heroText', e.target.value)}
                            />
                        </div>
                    )}

                    {/* Services/Products Section Items (Generic Array Editor) */}
                    {formData.sections && formData.sections.map((section, si) => (
                        <div key={si} className="admin-section-block">
                            <h3>Section {si + 1}: {section.type || 'Content'}</h3>

                            {section.title !== undefined && (
                                <div className="admin-form-group">
                                    <label>Section Title</label>
                                    <input value={section.title} onChange={(e) => {
                                        const newSections = [...formData.sections];
                                        newSections[si] = { ...newSections[si], title: e.target.value };
                                        handleChange('sections', newSections);
                                    }} />
                                </div>
                            )}

                            {section.desc !== undefined && (
                                <div className="admin-form-group">
                                    <label>Section Description</label>
                                    <textarea rows="2" value={section.desc} onChange={(e) => {
                                        const newSections = [...formData.sections];
                                        newSections[si] = { ...newSections[si], desc: e.target.value };
                                        handleChange('sections', newSections);
                                    }} />
                                </div>
                            )}

                            {/* Story Section: Image URL + Paragraphs */}
                            {section.type === 'story' && (
                                <>
                                    <div className="admin-form-group">
                                        <label>Image URL</label>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input
                                                value={section.image || ''}
                                                onChange={(e) => {
                                                    const newSections = [...formData.sections];
                                                    newSections[si] = { ...newSections[si], image: e.target.value };
                                                    handleChange('sections', newSections);
                                                }}
                                                style={{ flex: 1 }}
                                            />
                                            <ImageUploadButton
                                                onUpload={(url) => {
                                                    const newSections = [...formData.sections];
                                                    newSections[si] = { ...newSections[si], image: url };
                                                    handleChange('sections', newSections);
                                                }}
                                            />
                                            {section.image && (
                                                <img
                                                    src={resolveImageUrl(section.image)}
                                                    alt="Preview"
                                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="admin-form-group">
                                        <label>Paragraphs</label>
                                        {section.paragraphs?.map((para, pi) => (
                                            <div key={pi} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                                                <textarea
                                                    rows="3"
                                                    value={para}
                                                    onChange={(e) => {
                                                        const newSections = [...formData.sections];
                                                        const newParas = [...(newSections[si].paragraphs || [])];
                                                        newParas[pi] = e.target.value;
                                                        newSections[si] = { ...newSections[si], paragraphs: newParas };
                                                        handleChange('sections', newSections);
                                                    }}
                                                    style={{ flex: 1 }}
                                                />
                                                <button
                                                    className="admin-btn admin-btn-danger"
                                                    onClick={() => {
                                                        const newSections = [...formData.sections];
                                                        newSections[si].paragraphs = section.paragraphs.filter((_, idx) => idx !== pi);
                                                        handleChange('sections', newSections);
                                                    }}
                                                    style={{ padding: '4px 10px', fontSize: '14px' }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            className="admin-btn admin-btn-secondary"
                                            onClick={() => {
                                                const newSections = [...formData.sections];
                                                const newParas = [...(newSections[si].paragraphs || []), ''];
                                                newSections[si] = { ...newSections[si], paragraphs: newParas };
                                                handleChange('sections', newSections);
                                            }}
                                        >
                                            + Add Paragraph
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* CTA Banner Section: Button Text + Button Link */}
                            {section.type === 'cta_banner' && (
                                <>
                                    <div className="admin-form-group">
                                        <label>Button Text</label>
                                        <input
                                            value={section.buttonText || ''}
                                            onChange={(e) => {
                                                const newSections = [...formData.sections];
                                                newSections[si] = { ...newSections[si], buttonText: e.target.value };
                                                handleChange('sections', newSections);
                                            }}
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Button Link</label>
                                        <input
                                            value={section.buttonLink || ''}
                                            onChange={(e) => {
                                                const newSections = [...formData.sections];
                                                newSections[si] = { ...newSections[si], buttonLink: e.target.value };
                                                handleChange('sections', newSections);
                                            }}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Products Showcase Section: extra desc */}
                            {section.type === 'products_showcase' && (
                                <div className="admin-form-group">
                                    <label>Section Description</label>
                                    <textarea
                                        rows="2"
                                        value={section.desc || ''}
                                        onChange={(e) => {
                                            const newSections = [...formData.sections];
                                            newSections[si] = { ...newSections[si], desc: e.target.value };
                                            handleChange('sections', newSections);
                                        }}
                                    />
                                </div>
                            )}

                            {/* Values Section: description */}
                            {section.type === 'values' && (
                                <div className="admin-form-group">
                                    <label>Section Description</label>
                                    <textarea
                                        rows="2"
                                        value={section.desc || ''}
                                        onChange={(e) => {
                                            const newSections = [...formData.sections];
                                            newSections[si] = { ...newSections[si], desc: e.target.value };
                                            handleChange('sections', newSections);
                                        }}
                                    />
                                </div>
                            )}

                            {section.items && section.items.map((item, ii) => (
                                <div key={ii} className="admin-item-block">
                                    <h4>Item {ii + 1}</h4>
                                    {item.icon !== undefined && (
                                        <div className="admin-form-group">
                                            <label>Icon URL</label>
                                            <input value={item.icon} onChange={(e) => {
                                                const newSections = [...formData.sections];
                                                newSections[si].items[ii] = { ...newSections[si].items[ii], icon: e.target.value };
                                                handleChange('sections', newSections);
                                            }} />
                                        </div>
                                    )}
                                    {item.image !== undefined && (
                                        <div className="admin-form-group">
                                            <label>Image URL</label>
                                            <input value={item.image} onChange={(e) => {
                                                const newSections = [...formData.sections];
                                                newSections[si].items[ii] = { ...newSections[si].items[ii], image: e.target.value };
                                                handleChange('sections', newSections);
                                            }} />
                                        </div>
                                    )}
                                    <div className="admin-form-group">
                                        <label>Title</label>
                                        <input value={item.title} onChange={(e) => {
                                            const newSections = [...formData.sections];
                                            newSections[si].items[ii] = { ...newSections[si].items[ii], title: e.target.value };
                                            handleChange('sections', newSections);
                                        }} />
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Description</label>
                                        <textarea rows="2" value={item.desc} onChange={(e) => {
                                            const newSections = [...formData.sections];
                                            newSections[si].items[ii] = { ...newSections[si].items[ii], desc: e.target.value };
                                            handleChange('sections', newSections);
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Service Items for Services page */}
                    {formData.serviceItems && formData.serviceItems.map((item, i) => (
                        <div key={i} className="admin-section-block">
                            <h3>
                                Service {item.number || (i + 1)}
                                <button
                                    className="admin-btn admin-btn-danger"
                                    onClick={() => handleArrayRemove('serviceItems', i)}
                                    style={{ float: 'right', padding: '2px 10px', fontSize: '14px' }}
                                >
                                    × Remove
                                </button>
                            </h3>
                            <div className="admin-form-group">
                                <label>Number</label>
                                <input value={item.number} onChange={(e) => handleArrayItemChange('serviceItems', i, 'number', e.target.value)} />
                            </div>
                            <div className="admin-form-group">
                                <label>Title</label>
                                <input value={item.title} onChange={(e) => handleArrayItemChange('serviceItems', i, 'title', e.target.value)} />
                            </div>
                            <div className="admin-form-group">
                                <label>Description</label>
                                <textarea rows="3" value={item.desc} onChange={(e) => handleArrayItemChange('serviceItems', i, 'desc', e.target.value)} />
                            </div>
                        </div>
                    ))}
                    {formData.serviceItems && (
                        <div style={{ marginTop: '15px' }}>
                            <button
                                className="admin-btn admin-btn-secondary"
                                onClick={() => handleArrayAdd('serviceItems', { number: '', title: '', desc: '' })}
                            >
                                + Add Service
                            </button>
                        </div>
                    )}

                    {/* Products Items */}
                    {formData.items && !formData.sections && formData.items.map((item, i) => (
                        <div key={i} className="admin-section-block">
                            <h3>
                                Item {i + 1}
                                <button
                                    className="admin-btn admin-btn-danger"
                                    onClick={() => handleArrayRemove('items', i)}
                                    style={{ float: 'right', padding: '2px 10px', fontSize: '14px' }}
                                >
                                    × Remove
                                </button>
                            </h3>
                            <div className="admin-form-group">
                                <label>Image URL</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        value={item.image}
                                        onChange={(e) => handleArrayItemChange('items', i, 'image', e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <ImageUploadButton
                                        onUpload={(url) => handleArrayItemChange('items', i, 'image', url)}
                                    />
                                    {item.image && (
                                        <img
                                            src={resolveImageUrl(item.image)}
                                            alt="Preview"
                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="admin-form-group">
                                <label>Title</label>
                                <input value={item.title} onChange={(e) => handleArrayItemChange('items', i, 'title', e.target.value)} />
                            </div>
                            <div className="admin-form-group">
                                <label>Description</label>
                                <textarea rows="2" value={item.desc} onChange={(e) => handleArrayItemChange('items', i, 'desc', e.target.value)} />
                            </div>
                        </div>
                    ))}
                    {formData.items && !formData.sections && (
                        <div style={{ marginTop: '15px' }}>
                            <button
                                className="admin-btn admin-btn-secondary"
                                onClick={() => handleArrayAdd('items', { image: '', title: '', desc: '' })}
                            >
                                + Add Product
                            </button>
                        </div>
                    )}

                    {/* Contact Fields */}
                    {formData.phone !== undefined && (
                        <div className="admin-form-group">
                            <label>Phone</label>
                            <input value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                        </div>
                    )}
                    {formData.email !== undefined && (
                        <div className="admin-form-group">
                            <label>Email</label>
                            <input value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
                        </div>
                    )}
                    {formData.address !== undefined && (
                        <div className="admin-form-group">
                            <label>Address</label>
                            <input value={formData.address} onChange={(e) => handleChange('address', e.target.value)} />
                        </div>
                    )}

                    {/* Flow Items & Service Items for Services */}
                    {formData.flowItems && (
                        <div className="admin-section-block">
                            <h3>Process Flow Steps</h3>
                            {formData.flowItems.map((item, i) => (
                                <div key={i} className="admin-form-group" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input value={item} onChange={(e) => {
                                        const newFlow = [...formData.flowItems];
                                        newFlow[i] = e.target.value;
                                        handleChange('flowItems', newFlow);
                                    }} style={{ flex: 1 }} />
                                    {i > 0 && (
                                        <button className="admin-btn admin-btn-danger" onClick={() => {
                                            const newFlow = formData.flowItems.filter((_, idx) => idx !== i);
                                            handleChange('flowItems', newFlow);
                                        }}>×</button>
                                    )}
                                </div>
                            ))}
                            <button className="admin-btn admin-btn-secondary" onClick={() => handleArrayAdd('flowItems', '')}>Add Step</button>
                        </div>
                    )}

                    <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                        <button onClick={handleSave} className="admin-btn admin-btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save All Changes'}
                        </button>
                        <button onClick={() => navigate('/admin/dashboard')} className="admin-btn admin-btn-secondary">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Image Upload Button Component
function ImageUploadButton({ onUpload }) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                onUpload(data.url);
            } else {
                alert('Upload failed: ' + data.message);
            }
        } catch (err) {
            alert('Upload error');
        }
        setUploading(false);
        e.target.value = '';
    };

    return (
        <label className="admin-btn admin-btn-secondary" style={{ cursor: 'pointer', marginBottom: 0, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            {uploading ? 'Uploading...' : '📁 Upload Image'}
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={uploading}
            />
        </label>
    );
}

export default PageEditor;
