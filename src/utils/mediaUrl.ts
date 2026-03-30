const RAW_API_ORIGIN = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://widymotret-be-production.up.railway.app';

// Some environments are configured with a trailing /api.
// Media files are served from /uploads on the root origin, not /api/uploads.
const API_ORIGIN = String(RAW_API_ORIGIN).replace(/\/+$/, '').replace(/\/api$/, '');

export const resolveMediaUrl = (value: string): string => {
  if (!value) return value;

  // Already absolute URL
  if (/^https?:\/\//i.test(value)) {
    console.log(`[DEBUG resolveMediaUrl] Already absolute URL: ${value}`);
    return value;
  }

  // Uploaded assets are stored on backend
  if (value.startsWith('/uploads/')) {
    const resolved = `${API_ORIGIN}${value}`;
    console.log(`[DEBUG resolveMediaUrl] /uploads/ path: ${value} => ${resolved}`);
    return resolved;
  }
  if (value.startsWith('uploads/')) {
    const resolved = `${API_ORIGIN}/${value}`;
    console.log(`[DEBUG resolveMediaUrl] uploads/ path: ${value} => ${resolved}`);
    return resolved;
  }

  // Public assets remain relative to frontend
  console.log(`[DEBUG resolveMediaUrl] Public asset (relative): ${value}`);
  return value;
};
