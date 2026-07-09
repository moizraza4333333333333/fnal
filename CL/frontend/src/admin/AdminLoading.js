import React from 'react';
import './admin.css';

/**
 * AdminLoading — branded loading screen with logo + spinning circle.
 * Used across the admin panel while fetching data.
 */
function AdminLoading({ message = 'Loading...' }) {
    return (
        <div className="admin-loading-screen">
            <div className="admin-loading-content">
                <div className="admin-loading-logo-wrap">
                    <div className="admin-loading-spinner" />
                    <img
                        src="/images/logo.webp"
                        alt="Leather Gateway"
                        className="admin-loading-logo"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
                <p className="admin-loading-text">{message}</p>
            </div>
        </div>
    );
}

export default AdminLoading;
