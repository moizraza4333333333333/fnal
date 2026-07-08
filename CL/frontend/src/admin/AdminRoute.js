import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#0d1821',
                color: '#fff',
                fontSize: '18px'
            }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin" replace />;
    }

    return children;
}

export default AdminRoute;
