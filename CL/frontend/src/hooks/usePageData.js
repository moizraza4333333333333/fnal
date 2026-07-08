import { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || '';

/**
 * Custom hook to fetch page data from the backend API.
 * @param {string} pageId - The page ID (e.g., 'home', 'about', 'services', 'products', 'contact')
 * @returns {{ page: object|null, loading: boolean, error: string|null }}
 */
export default function usePageData(pageId) {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!pageId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        fetch(`${API_URL}/api/pages/${pageId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setPage(data.data);
                } else {
                    setError(data.message || 'Failed to load page data');
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Network error');
                setLoading(false);
            });
    }, [pageId]);

    return { page, loading, error };
}
