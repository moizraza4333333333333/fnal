const API_URL = process.env.REACT_APP_API_URL || '';

/**
 * Resolves an image URL to a fully qualified URL.
 * Handles relative upload paths like /uploads/filename.jpg
 * by prepending the backend API URL.
 */
export default function resolveImageUrl(url) {
    if (!url) return url;
    // If it's already an absolute URL (http://, https://, //), return as-is
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
        return url;
    }
    // If it's a relative upload path, prepend the API base URL
    if (url.startsWith('/uploads/')) {
        return `${API_URL}${url}`;
    }
    // Otherwise return as-is (e.g., /images/logo.webp - local frontend assets)
    return url;
}
