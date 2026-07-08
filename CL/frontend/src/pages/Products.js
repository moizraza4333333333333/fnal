import React, { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import resolveImageUrl from '../utils/resolveImageUrl';

const API_URL = process.env.REACT_APP_API_URL || '';

function Lightbox({ images, currentIndex, productTitle, onClose, onPrev, onNext }) {
    return (
        <div className="lightbox-overlay" onClick={onClose}>
            <button className="lightbox-close" onClick={onClose}>&times;</button>
            {images.length > 1 && (
                <button className="lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }}>&#10094;</button>
            )}
            <img
                className="lightbox-image"
                src={resolveImageUrl(images[currentIndex], { width: 1400 })}
                alt={`${productTitle} ${currentIndex + 1}`}
                onClick={(e) => e.stopPropagation()}
            />
            {images.length > 1 && (
                <button className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); onNext(); }}>&#10095;</button>
            )}
            <div className="lightbox-counter" onClick={(e) => e.stopPropagation()}>
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    );
}

function Products() {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openLightbox = (product, index) => {
        setCurrentProduct(product);
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setCurrentProduct(null);
    };

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/api/products`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProducts(data.data);
                } else {
                    setError(data.message || 'Failed to load products');
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Network error');
                setLoading(false);
            });
    }, []);

    const prevImage = () => {
        setCurrentIndex((prev) => (prev === 0 ? currentProduct.images.length - 1 : prev - 1));
    };

    const nextImage = () => {
        setCurrentIndex((prev) => (prev === currentProduct.images.length - 1 ? 0 : prev + 1));
    };

    return (
        <>
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <h1>Our Products</h1>
                </div>
            </section>

            {/* Loading State */}
            {loading && (
                <section className="products-page-section products-loading-section">
                    <div className="container">
                        <LoadingScreen message="Loading products..." />
                    </div>
                </section>
            )}

            {/* Error State */}
            {!loading && error && (
                <section className="products-page-section">
                    <div className="container">
                        <div className="loading-screen-error" style={{ textAlign: 'center', padding: '60px 0' }}>
                            <p style={{ marginBottom: '15px', color: '#888', fontSize: '16px' }}>Unable to load products. Please check your connection and try again.</p>
                            <button className="loading-screen-retry" onClick={() => window.location.reload()}>
                                Retry
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Products Grid */}
            {!loading && !error && products.length > 0 && (
                <section className="products-page-section">
                    <div className="container">
                        <div className="products-grid">
                            {products.map((product) => (
                                <div
                                    key={product._id}
                                    className="single-product-card"
                                    onClick={() => openLightbox(product, 0)}
                                    title="Click to view gallery"
                                >
                                    <img src={resolveImageUrl(product.images[0], { width: 520 })} alt={product.title} loading="lazy" decoding="async" />
                                    <div className="single-product-card-name">{product.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
                <section className="products-page-section">
                    <div className="container">
                        <p style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontSize: '16px' }}>
                            No products available yet. Check back soon!
                        </p>
                    </div>
                </section>
            )}

            {/* Lightbox */}
            {lightboxOpen && currentProduct && (
                <Lightbox
                    images={currentProduct.images}
                    currentIndex={currentIndex}
                    productTitle={currentProduct.title}
                    onClose={closeLightbox}
                    onPrev={prevImage}
                    onNext={nextImage}
                />
            )}

            {/* CTA */}
            <section className="cta-banner">
                <div className="container">
                    <h2>Custom Orders Welcome</h2>
                    <p>We work with you to develop products that match your exact specifications.</p>
                    <a href="/contact-us" className="btn btn-primary" style={{ background: '#fff', color: '#0d1821' }}>
                        Get a Quote
                    </a>
                </div>
            </section>
        </>
    );
}

export default Products;
