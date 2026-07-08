import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import useSettings from '../hooks/useSettings';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { settings } = useSettings();
    const siteName = settings?.siteName || 'Leather Gateway';

    return (
        <header className="header">
            <div className="header-inner">
                <Link to="/" className="logo">
                    <img
                        src="/images/logo.webp"
                        alt={`${siteName} Logo`}
                        className="logo-img"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className="site-title">{siteName}</span>
                </Link>

                <button
                    className={`menu-toggle ${isOpen ? 'open' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`nav-menu ${isOpen ? 'open' : ''}`}>
                    <li><NavLink to="/" onClick={() => setIsOpen(false)}>Home</NavLink></li>
                    <li><NavLink to="/about-us" onClick={() => setIsOpen(false)}>About Us</NavLink></li>
                    <li><NavLink to="/our-services" onClick={() => setIsOpen(false)}>Our Services</NavLink></li>
                    <li><NavLink to="/our-products" onClick={() => setIsOpen(false)}>Our Products</NavLink></li>
                    <li><NavLink to="/contact-us" onClick={() => setIsOpen(false)}>Contact Us</NavLink></li>
                    <li className="nav-cta-li">
                        <a
                            href="/Leather-Gateway-Company-Profile.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nav-cta"
                        >
                            Company Profile
                        </a>
                    </li>
                </ul>
            </div>
        </header>
    );
}

export default Navbar;
