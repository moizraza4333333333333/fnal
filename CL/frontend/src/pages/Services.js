import React from 'react';
import usePageData from '../hooks/usePageData';
import LoadingScreen from '../components/LoadingScreen';

function Services() {
    const { page, loading, error } = usePageData('services');

    // Fallback hardcoded data
    const heroTitle = page?.heroTitle || 'Our Services';
    const heroLead = page?.heroLead || 'We provide end-to-end solutions including supplier sourcing, competitive pricing and negotiation, production monitoring, and comprehensive quality audits – ensuring efficiency, reliability, and excellence at every stage.';
    const flowItems = page?.flowItems || ['Supplier Sourcing', 'Product Development', 'Production Tracking', 'In-Line Quality Control', 'Final Inspection & Reporting'];
    const serviceItems = page?.serviceItems || [
        { number: '01', title: 'Supplier Sourcing', desc: 'We are able to identify and connect with the most suitable vendors to meet our customers\' sourcing needs.' },
        { number: '02', title: 'Negotiation', desc: 'Through our in-depth knowledge of raw materials and innovative supply chain solutions we deliver competitive pricing.' },
        { number: '03', title: 'Product Development', desc: 'Our technical experts ensure every product development requirement is fulfilled with highest standards.' },
        { number: '04', title: 'Production Monitoring', desc: 'We seamlessly connect every stage of the supply chain from pre-production to delivery.' },
        { number: '05', title: 'Quality Assurance', desc: 'Our QA process starts with supplier audits, followed by pre-production checks to minimize risks.' },
        { number: '06', title: 'Supplier Compliance', desc: 'Our compliance department ensures adherence to international standards and customer requirements.' }
    ];

    if (loading) {
        return <LoadingScreen message="Loading..." />;
    }

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
        <main className="services-modern">
            {/* ===== HERO ===== */}
            <section className="services-modern-hero">
                <div className="services-modern-hero-bg">
                    <div className="services-modern-hero-banner">
                        <img src="/images/service-banner.jpeg" alt="Leather Gateway services" loading="eager" decoding="async" />
                    </div>
                    <div className="container services-modern-hero-inner">
                        <div className="services-modern-hero-content">
                            <span className="services-modern-badge">What We Do</span>
                            <h1 className="services-modern-title">{heroTitle}</h1>
                            <p className="services-modern-subtitle">{heroLead}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== VIDEO SECTION ===== */}
            <section className="services-modern-video-section">
                <div className="container">
                    <div className="services-modern-video-wrapper">
                        <video
                            height="1080"
                            width="1920"
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="metadata"
                        >
                            <source
                                src="/images/our-services-video.mp4"
                                type="video/mp4"
                            />
                        </video>
                    </div>
                </div>
            </section>

            {/* ===== PROCESS FLOW ===== */}
            {flowItems.length > 0 && (
                <section className="services-modern-process">
                    <div className="container">
                        <div className="services-modern-section-label">
                            <span className="services-modern-badge">Our Process</span>
                            <h2>How We Work</h2>
                            <p>From initial sourcing to final inspection — a seamless process</p>
                        </div>
                        <div className="services-modern-flow">
                            {flowItems.map((item, index) => (
                                <div key={index} className="services-modern-flow-card">
                                    <div className="services-modern-flow-number">
                                        {String(index + 1).padStart(2, '0')}
                                    </div>
                                    <h3>{item}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== SERVICES GRID ===== */}
            {serviceItems.length > 0 && (
                <section className="services-modern-grid-section">
                    <div className="container">
                        <div className="services-modern-section-label">
                            <span className="services-modern-badge">What We Offer</span>
                            <h2>Comprehensive Solutions</h2>
                            <p>Every service tailored to deliver excellence across your supply chain</p>
                        </div>
                        <div className="services-modern-grid">
                            {serviceItems.map((service, i) => (
                                <article key={i} className="services-modern-card">
                                    <div className="services-modern-card-top">
                                        <span className="services-modern-card-number">{service.number}</span>
                                        <div className="services-modern-card-line"></div>
                                    </div>
                                    <h3>{service.title}</h3>
                                    <p>{service.desc}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== CTA ===== */}
            <section className="services-modern-cta">
                <div className="container">
                    <h2>Ready to streamline your leather supply chain?</h2>
                    <p>Partner with us for reliable sourcing, quality assurance, and seamless coordination.</p>
                    <a href="/contact-us" className="btn" style={{ background: '#fff', color: '#0d1821', padding: '14px 36px', fontSize: '16px', fontWeight: '700' }}>
                        Get in Touch
                    </a>
                </div>
            </section>
        </main>
    );
}

export default Services;
