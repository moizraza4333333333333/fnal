import React from 'react';

export default function LoadingScreen({ message = 'Loading...' }) {
    return (
        <div className="loading-screen">
            <div className="loading-screen-spinner">
                <div className="loading-screen-circle"></div>
            </div>
            <p className="loading-screen-text">{message}</p>
        </div>
    );
}
