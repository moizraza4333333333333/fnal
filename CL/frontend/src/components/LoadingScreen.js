import React from 'react';

export default function LoadingScreen({ message = 'Loading...' }) {
    return (
        <div className="loading-screen">
            <div className="loading-screen-spinner">
                <img src="/images/logo.webp" alt="Leather Gateway" />
            </div>
            <p className="loading-screen-text">{message}</p>
        </div>
    );
}
