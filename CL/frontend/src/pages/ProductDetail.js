import React from 'react';
import { useParams, Link } from 'react-router-dom';
import usePageData from '../hooks/usePageData';
import resolveImageUrl from '../utils/resolveImageUrl';

const toSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function ProductDetail() {
    const { slug } = useParams();
    const { page, loading } = usePageData('products');

    if (loading) {
        return (
            <section className="page-header">
                <div className="container">
                    <h1>Loading...</h1>
                </div>
            </section>
        );
    }

    const items = page?.items || [];
    const product = items.find((p) => toSlug(p.title) === slug);

    if (!product) {
        return (
            <section className="page-header">
                <div className="container">
                    <h1>Product Not Found</h1>
                    <p>The product you're looking for doesn't exist.</p>
                    <Link to="/our-products" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
                        View All Products
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <>
            {/* ===== COVER HERO ===== */}
            <div
                className="product-detail-cover"
                style={{ backgroundImage: `url(${resolveImageUrl(product.image)})` }}
            >
                <div className="product-detail-cover-overlay" />
                <div className="container">
                    <div className="product-detail-cover-content">
                        <Link to="/our-products" className="product-detail-back">← Back to Products</Link>
                        <h1 className="product-detail-cover-title">{product.title}</h1>
                    </div>
                </div>
            </div>

            {/* ===== CONTENT ===== */}
            <div className="product-detail-content-area">
                <div className="container">
                    <div className="product-detail-content-inner">
                        <p className="product-detail-intro">{product.desc}</p>
                        {product.details && (
                            <div className="product-detail-description">
                                <p>{product.details}</p>
                            </div>
                        )}
                        {product.gallery && product.gallery.length > 1 && (
                            <div className="product-detail-gallery">
                                <h3>Gallery</h3>
                                <div className="product-detail-gallery-grid">
                                    {product.gallery.map((img, i) => (
                                        <img key={i} src={resolveImageUrl(img)} alt={`${product.title} ${i + 1}`} loading="lazy" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== CTA ===== */}
            <section className="cta-banner">
                <div className="container">
                    <h2>Custom Orders Welcome</h2>
                    <p>We work with you to develop products that match your exact specifications.</p>
                    <Link to="/contact-us" className="btn btn-primary" style={{ background: '#fff', color: '#0d1821' }}>
                        Get a Quote
                    </Link>
                </div>
            </section>
        </>
    );
}

export default ProductDetail;
