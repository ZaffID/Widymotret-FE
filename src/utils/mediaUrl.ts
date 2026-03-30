const RAW_API_ORIGIN = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://widymotret-be-production.up.railway.app';

// Some environments are configured with a trailing /api.
// Media files are served from /uploads on the root origin, not /api/uploads.
const API_ORIGIN = String(RAW_API_ORIGIN).replace(/\/+$/, '').replace(/\/api$/, '');

export const resolveMediaUrl = (value: string): string => {
  if (!value) return value;

  // Already absolute URL
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Uploaded assets are stored on backend
  if (value.startsWith('/uploads/')) {
    return `${API_ORIGIN}${value}`;
  }
  if (value.startsWith('uploads/')) {
    return `${API_ORIGIN}/${value}`;
  }

  // Public assets remain relative to frontend
  return value;
};
