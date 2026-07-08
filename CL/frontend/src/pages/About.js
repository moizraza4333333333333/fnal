import React from 'react';
import usePageData from '../hooks/usePageData';
import resolveImageUrl from '../utils/resolveImageUrl';
import LoadingScreen from '../components/LoadingScreen';

function About() {
    const { page, loading, error } = usePageData('about');

    const storySection = page?.sections?.find(s => s.type === 'story');
    const valuesSection = page?.sections?.find(s => s.type === 'values');

    // Fallback hardcoded content
    const storyTitle = storySection?.title || 'Our Story';
    const storyImage = storySection?.image || '/images/neve-marketing-agency-10.webp';
    const storyParagraphs = storySection?.paragraphs || [
        'We believe in the power of innovation and collaboration to drive success. What started as a small team with big dreams has grown into a thriving agency dedicated to helping businesses achieve their goals. Our mission is simple: to deliver results through creative strategies, cutting-edge technology, and a passion for excellence.',
        'With a team of experts who value integrity, ingenuity, and client success, we take pride in crafting tailored solutions that not only meet but exceed expectations. Every project we undertake is a reflection of our commitment to your growth and our belief in the potential of every brand we work with.'
    ];

    const valuesTitle = valuesSection?.title || 'We are driven by values';
    const valuesDesc = valuesSection?.desc || 'Our values define who we are and how we work. At Leather Gateway, we prioritize integrity, creativity, and collaboration in everything we do.';
    const valuesItems = valuesSection?.items || [
        { icon: '🎯', title: 'Our Mission', desc: 'To deliver results through creative strategies, cutting-edge technology, and a passion for excellence.' },
        { icon: '👁️', title: 'Our Vision', desc: 'To be the leading leather buying house, connecting global buyers with premium leather manufacturers.' },
        { icon: '🤝', title: 'Integrity & Trust', desc: 'Building meaningful relationships with our clients through transparency, honesty, and reliability.' }
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
        <>
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <h1>{page?.title || 'About Us'}</h1>
                </div>
            </section>

            {/* Our Story */}
            <section className="about-story">
                <div className="container">
                    <div className="about-story-inner">
                        {storyImage && (
                            <div className="about-story-image">
                                <img
                                    src={resolveImageUrl(storyImage)}
                                    alt={storyTitle}
                                    loading="lazy"
                                />
                            </div>
                        )}
                        <div className="about-story-text">
                            <h2>{storyTitle}</h2>
                            {storyParagraphs.map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="about-values">
                <div className="container">
                    <h2>{valuesTitle}</h2>
                    <p>{valuesDesc}</p>

                    <div className="values-grid">
                        {valuesItems.map((item, i) => (
                            <div key={i} className="value-card">
                                <div className="value-icon">{item.icon}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

export default About;
