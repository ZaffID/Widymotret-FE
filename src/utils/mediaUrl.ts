const API_ORIGIN = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://widymotret-be-production.up.railway.app';

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
