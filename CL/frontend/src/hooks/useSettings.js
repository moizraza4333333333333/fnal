import { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || '';

/**
 * Custom hook to fetch site settings from the backend API.
 * @returns {{ settings: object|null, loading: boolean, error: string|null }}
 */
export default function useSettings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/api/settings`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSettings(data.data);
                } else {
                    setError(data.message || 'Failed to load settings');
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Network error');
                setLoading(false);
            });
    }, []);

    return { settings, loading, error };
}
