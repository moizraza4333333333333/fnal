import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './admin.css';

const API_URL = process.env.REACT_APP_API_URL || '';

function AdminProducts() {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // --- Add New Product ---
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newThumb, setNewThumb] = useState('');
    const [newGallery, setNewGallery] = useState(['']);

    // --- Edit Product ---
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editThumb, setEditThumb] = useState('');
    const [editGallery, setEditGallery] = useState(['']);

    const loadProducts = useCallback(() => {
        setLoading(true);
        fetch(`${API_URL}/api/products`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) setProducts(data.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    const optimizeImageBeforeUpload = (file) => {
        if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
            return Promise.resolve(file);
        }

        return new Promise((resolve) => {
            const image = new Image();
            const objectUrl = URL.createObjectURL(file);

            image.onload = () => {
                const maxSize = 1600;
                const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
                const width = Math.round(image.width * scale);
                const height = Math.round(image.height * scale);
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                URL.revokeObjectURL(objectUrl);

                canvas.toBlob((blob) => {
                    if (!blob) return resolve(file);
                    const optimizedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
                        type: 'image/webp',
                        lastModified: Date.now()
                    });
                    resolve(optimizedFile.size < file.size ? optimizedFile : file);
                }, 'image/webp', 0.82);
            };

            image.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                resolve(file);
            };

            image.src = objectUrl;
        });
    };

    // --- Image Upload Helper ---
    const handleUpload = async (file, onUrl) => {
        try {
            setMessage('Optimizing and uploading image...');
            const uploadFile = await optimizeImageBeforeUpload(file);
            const formData = new FormData();
            formData.append('image', uploadFile);
            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json().catch(() => ({ message: 'Invalid server response' }));
            if (res.ok && data.success) {
                onUrl(data.url);
                setMessage('Image uploaded successfully');
            } else {
                const errorMessage = data.message || `Upload failed with status ${res.status}`;
                setMessage('Error: ' + errorMessage);
                alert('Upload failed: ' + errorMessage);
            }
        } catch (err) {
            setMessage('Error: ' + (err.message || 'Upload error'));
            alert('Upload error: ' + (err.message || 'Please try again'));
        }
    };

    // Build images array from thumbnail + gallery
    const buildImages = (thumb, gallery) => {
        const arr = thumb ? [thumb] : [];
        gallery.forEach(url => {
            if (url && url.trim()) arr.push(url.trim());
        });
        return arr;
    };

    // --- Save New Product ---
    const saveNewProduct = async () => {
        if (!newTitle.trim()) { setMessage('Product title is required'); return; }
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    images: buildImages(newThumb, newGallery)
                })
            });
            const data = await res.json();
            if (data.success) {
                setMessage('Product created!');
                setShowAddForm(false);
                setNewTitle('');
                setNewThumb('');
                setNewGallery(['']);
                loadProducts();
            } else {
                setMessage('Error: ' + data.message);
            }
        } catch (err) {
            setMessage('Error creating product');
        }
        setSaving(false);
    };

    // --- Start Edit ---
    const startEdit = (product) => {
        setEditingId(product._id);
        setEditTitle(product.title);
        setEditThumb(product.images[0] || '');
        const extra = product.images.slice(1);
        setEditGallery(extra.length ? extra : ['']);
        setMessage('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle('');
        setEditThumb('');
        setEditGallery(['']);
        setMessage('');
    };

    // --- Save Edit ---
    const saveEdit = async () => {
        if (!editTitle.trim()) { setMessage('Product title is required'); return; }
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch(`${API_URL}/api/products/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: editTitle.trim(),
                    images: buildImages(editThumb, editGallery)
                })
            });
            const data = await res.json();
            if (data.success) {
                setMessage('Product saved!');
                loadProducts();
                cancelEdit();
            } else {
                setMessage('Error: ' + data.message);
            }
        } catch (err) {
            setMessage('Error saving product');
        }
        setSaving(false);
    };

    // --- Delete ---
    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product permanently?')) return;
        try {
            const res = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMessage('Product deleted');
                loadProducts();
            } else {
                setMessage('Error: ' + data.message);
            }
        } catch (err) {
            setMessage('Error deleting product');
        }
    };

    // --- Upload Button Component ---
    function UploadBtn({ onUploaded, label }) {
        return (
            <label className="admin-upload-btn" title="Upload image">
                {label || '📁 Upload'}
                <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleUpload(file, onUploaded);
                        e.target.value = '';
                    }}
                />
            </label>
        );
    }

    // --- Image Preview ---
    function ImgPreview({ src }) {
        if (!src) return null;
        return (
            <img
                src={src}
                alt="preview"
                className="admin-preview-img"
                onError={(e) => { e.target.style.display = 'none'; }}
            />
        );
    }

    if (loading) {
        return (
            <div className="admin-layout">
                <Sidebar />
                <main className="admin-main">
                    <div className="admin-loading">Loading products...</div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <Sidebar />
            <main className="admin-main">
                <div className="admin-header">
                    <h1>Products</h1>
                    <button
                        className="admin-btn admin-btn-primary"
                        onClick={() => { setShowAddForm(true); setMessage(''); }}
                    >
                        + Add New Product
                    </button>
                </div>

                {message && (
                    <div className={`admin-alert ${message.includes('Error') ? 'admin-alert-error' : 'admin-alert-success'}`}>
                        {message}
                    </div>
                )}

                {/* ===== ADD NEW PRODUCT FORM ===== */}
                {showAddForm && (
                    <div className="admin-product-form">
                        <h3>New Product</h3>

                        <div className="admin-field">
                            <label>Product Title</label>
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="e.g. LEATHER WALLETS"
                            />
                        </div>

                        <div className="admin-field">
                            <label>Thumbnail Photo</label>
                            <div className="admin-img-row">
                                <ImgPreview src={newThumb} />
                                <UploadBtn onUploaded={(url) => setNewThumb(url)} label="Choose Thumbnail" />
                                {newThumb && (
                                    <button className="admin-remove-btn" onClick={() => setNewThumb('')}>×</button>
                                )}
                            </div>
                        </div>

                        <div className="admin-field">
                            <label>More Photos</label>
                            <div className="admin-gallery-grid">
                                {newGallery.map((url, i) => (
                                    <div key={i} className="admin-gallery-slot">
                                        <ImgPreview src={url} />
                                        <UploadBtn onUploaded={(u) => {
                                            const g = [...newGallery];
                                            g[i] = u;
                                            setNewGallery(g);
                                        }} label="Upload" />
                                        <button className="admin-remove-btn" onClick={() => {
                                            const g = newGallery.filter((_, index) => index !== i);
                                            setNewGallery(g.length ? g : ['']);
                                        }}>×</button>
                                    </div>
                                ))}
                            </div>
                            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => setNewGallery([...newGallery, ''])}>
                                + Add More Photo
                            </button>
                        </div>

                        <div className="admin-form-actions">
                            <button className="admin-btn admin-btn-primary" onClick={saveNewProduct} disabled={saving}>
                                {saving ? 'Creating...' : 'Create Product'}
                            </button>
                            <button className="admin-btn admin-btn-secondary" onClick={() => {
                                setShowAddForm(false);
                                setNewTitle('');
                                setNewThumb('');
                                setNewGallery(['']);
                            }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* ===== PRODUCT LIST ===== */}
                <div className="admin-product-list">
                    {products.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                            No products yet. Click "Add New Product" to create one.
                        </p>
                    )}

                    {products.map(product => (
                        <div key={product._id} className="admin-product-card">
                            {editingId === product._id ? (
                                /* ===== EDIT MODE ===== */
                                <div className="admin-product-edit">
                                    <h3>Editing: {product.title}</h3>

                                    <div className="admin-field">
                                        <label>Product Title</label>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                        />
                                    </div>

                                    <div className="admin-field">
                                        <label>Thumbnail Photo</label>
                                        <div className="admin-img-row">
                                            <ImgPreview src={editThumb} />
                                            <UploadBtn onUploaded={(url) => setEditThumb(url)} label="Change" />
                                            {editThumb && (
                                                <button className="admin-remove-btn" onClick={() => setEditThumb('')}>×</button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="admin-field">
                                        <label>More Photos</label>
                                        <div className="admin-gallery-grid">
                                            {editGallery.map((url, i) => (
                                                <div key={i} className="admin-gallery-slot">
                                                    <ImgPreview src={url} />
                                                    <UploadBtn onUploaded={(u) => {
                                                        const g = [...editGallery];
                                                        g[i] = u;
                                                        setEditGallery(g);
                                                    }} label="Upload" />
                                                    <button className="admin-remove-btn" onClick={() => {
                                                        const g = editGallery.filter((_, index) => index !== i);
                                                        setEditGallery(g.length ? g : ['']);
                                                    }}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => setEditGallery([...editGallery, ''])}>
                                            + Add More Photo
                                        </button>
                                    </div>

                                    <div className="admin-form-actions">
                                        <button className="admin-btn admin-btn-primary" onClick={saveEdit} disabled={saving}>
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button className="admin-btn admin-btn-secondary" onClick={cancelEdit}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* ===== DISPLAY MODE ===== */
                                <div className="admin-product-display">
                                    <div className="admin-product-thumbs">
                                        {product.images[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.title}
                                                className="admin-thumb-main"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <span className="admin-no-img">No thumbnail</span>
                                        )}
                                        {product.images.length > 1 && (
                                            <span className="admin-more-badge">
                                                +{product.images.length - 1} more
                                            </span>
                                        )}
                                    </div>
                                    <div className="admin-product-info">
                                        <h3>{product.title}</h3>
                                        <p>{product.images.length} photo{product.images.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="admin-product-actions">
                                        <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => startEdit(product)}>Edit</button>
                                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => deleteProduct(product._id)}>Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

function Sidebar() {
    const { user, logout } = useAuth();
    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
                <h2>Leather Gateway</h2>
                <p>Admin Panel</p>
            </div>
            <nav className="admin-nav">
                <Link to="/admin/dashboard" className="admin-nav-item">Dashboard</Link>
                <Link to="/admin/pages/home" className="admin-nav-item">Home Page</Link>
                <Link to="/admin/pages/about" className="admin-nav-item">About Page</Link>
                <Link to="/admin/pages/services" className="admin-nav-item">Services Page</Link>
                <Link to="/admin/products" className="admin-nav-item active">Product Manager</Link>
                <Link to="/admin/pages/contact" className="admin-nav-item">Contact Page</Link>
                <Link to="/admin/settings" className="admin-nav-item">Site Settings</Link>
            </nav>
            <div className="admin-sidebar-footer">
                <span>Logged in as {user?.email}</span>
                <button onClick={logout} className="admin-btn-logout">Logout</button>
            </div>
        </aside>
    );
}

export default AdminProducts;
