import React, { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { Link } from 'react-router-dom';
import usePageData from '../hooks/usePageData';
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
                src={images[currentIndex]}
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

function Home() {
    const { page, loading, error } = usePageData('home');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/api/products`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProducts(data.data);
                } else {
                    setProductsError(data.message || 'Failed to load products');
                }
                setProductsLoading(false);
            })
            .catch(err => {
                setProductsError(err.message || 'Network error');
                setProductsLoading(false);
            });
    }, []);

    const openLightbox = (product, index) => {
        setCurrentProduct(product);
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setCurrentProduct(null);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev === 0 ? currentProduct.images.length - 1 : prev - 1));
    };

    const nextImage = () => {
        setCurrentIndex((prev) => (prev === currentProduct.images.length - 1 ? 0 : prev + 1));
    };

    // Fallback hardcoded content while loading or if API fails
    const heroHeading = page?.heroHeading || 'Trusted Leather Sourcing & Buying House';
    const heroText = page?.heroText || 'Leather Gateway helps international buyers source quality leather goods from reliable manufacturers, with support for product development, sampling, quality control, and export coordination.';

    const servicesSection = page?.sections?.find(s => s.type === 'services_icons');
    const ctaSection = page?.sections?.find(s => s.type === 'cta_banner');

    // Fallback service items
    const serviceItems = servicesSection?.items || [
        { icon: '/images/neve-marketing-icon-8.1.png', title: 'Supplier Sourcing', desc: 'Reliable supplier matching for leather goods, accessories, and custom product requirements.' },
        { icon: '/images/neve-marketing-icon-4.1.webp', title: 'Product Development', desc: 'Technical experts ensuring every product development requirement is fulfilled with the highest standards.' },
        { icon: '/images/neve-marketing-icon-11.png', title: 'Pricing & Negotiation', desc: 'Strategic pricing analysis and negotiation support to secure the best value for your leather sourcing needs.' },
        { icon: '/images/neve-marketing-icon-10.webp', title: 'Production Monitoring', desc: 'End-to-end production tracking and monitoring to ensure timely delivery and adherence to specifications.' },
        { icon: '/images/neve-marketing-icon-9.webp', title: 'Quality Control', desc: 'Multi-stage inspections and quality audits ensuring only approved consignments are shipped.' },
        { icon: '/images/neve-marketing-icon-13.png', title: 'Quality Audits', desc: 'Comprehensive quality audits and compliance checks to maintain international standards.' }
    ];

    // Show loading screen while fetching page data
    if (loading) {
        return <LoadingScreen message="Loading..." />;
    }

    // Show error state with retry
    if (error) {
        return (
            <div className="loading-screen">
                <div className="loading-screen-error">
                    <p>Unable to load page content. Please check your connection and try again.</p>
                    <button className="loading-screen-retry" onClick={() => window.location.reload()}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Hero Banner Section */}
            <section className="hero-section">
                <div className="hero-banner-wrapper">
                    <img
                        src="/banner.png"
                        alt="Leather Gateway - Trusted Leather Sourcing & Buying House"
                        className="hero-banner-img"
                    />
                    <div className="hero-overlay">
                        <div className="container">
                            <div className="hero-overlay-content">
                                <h1>{heroHeading}</h1>
                                <p>{heroText}</p>
                                <Link to="/contact-us" className="btn btn-primary">
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Service Icons */}
            {serviceItems.length > 0 && (
                <section className="services-icons">
                    <div className="container">
                        <div className="services-icons-grid">
                            {serviceItems.map((item, index) => (
                                <div key={index} className="service-icon-card">
                                    {item.icon && (
                                        <img
                                            src={resolveImageUrl(item.icon)}
                                            alt={item.title}
                                            loading="lazy"
                                        />
                                    )}
                                    <h3>{item.title}</h3>
                                    <p>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Home Products Section */}
            <section className="home-product-showcase">
                <div className="container">
                    <h2 className="home-products-heading">Products</h2>
                    {productsLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div className="loading-screen-spinner"></div>
                            <p style={{ marginTop: '10px', color: '#666' }}>Loading products...</p>
                        </div>
                    ) : productsError ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <p style={{ color: '#999' }}>Unable to load products right now.</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <p style={{ color: '#999' }}>No products available.</p>
                        </div>
                    ) : (
                        <>
                            <div className="home-products-grid">
                                {products.slice(0, 4).map((product) => (
                                    <div
                                        key={product._id}
                                        className="single-product-card"
                                        onClick={() => openLightbox(product, 0)}
                                        title="Click to view gallery"
                                    >
                                        <img src={product.images[0]} alt={product.title} />
                                        <div className="single-product-card-name">{product.title}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="home-products-more">
                                <Link to="/our-products" className="btn btn-primary">View All Products</Link>
                            </div>
                        </>
                    )}
                </div>
            </section>

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

            {/* CTA Banner */}
            <section className="cta-banner">
                <div className="container">
                    <h2>{ctaSection?.title || 'Ready to Source Quality Leather?'}</h2>
                    <p>{ctaSection?.desc || "Get in touch with us today and let's discuss your requirements."}</p>
                    <Link to={ctaSection?.buttonLink || '/contact-us'} className="btn btn-primary" style={{ background: '#fff', color: '#0d1821' }}>
                        {ctaSection?.buttonText || 'Contact Us Now'}
                    </Link>
                </div>
            </section>
        </>
    );
}

export default Home;
