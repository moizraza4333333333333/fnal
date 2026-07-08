const API_URL = process.env.REACT_APP_API_URL || '';

function optimizeCloudinaryUrl(url, options = {}) {
    if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
        return url;
    }

    const { width = 900, quality = 'auto' } = options;
    const transform = `f_auto,q_${quality},c_limit,w_${width}`;

    if (url.includes('/upload/f_auto') || url.includes('/upload/q_auto') || url.includes('/upload/c_limit')) {
        return url;
    }

    return url.replace('/upload/', `/upload/${transform}/`);
}

/**
 * Resolves an image URL to a fully qualified URL.
 * Handles relative upload paths like /uploads/filename.jpg
 * by prepending the backend API URL.
 */
export default function resolveImageUrl(url, options = {}) {
    if (!url) return url;

    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
        return optimizeCloudinaryUrl(url, options);
    }

    if (url.startsWith('/uploads/')) {
        return `${API_URL}${url}`;
    }

    return url;
}
