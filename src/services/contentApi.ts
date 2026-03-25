import { authStore } from '../stores/authStore';
import { ApiResponse, EditableContent, BatchContentUpdate } from '../types/content';

// Use full URL with env variable for both dev (via Vite proxy) and production (via Vercel)
const API_BASE = `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://widymotret-be-production.up.railway.app'}/api`;

/**
 * Helper: build Authorization header when token exists
 */
const authHeaders = (): Record<string, string> => {
  const token = authStore.getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// ─── Content CRUD ───────────────────────────────────────────────

/**
 * Fetch single content field
 * GET /api/content/:section/:field  (public)
 */
export const getContent = async (
  section: string,
  field: string
): Promise<ApiResponse<EditableContent>> => {
  try {
    const res = await fetch(`${API_BASE}/content/${section}/${field}`);
    if (!res.ok) {
      return {
        success: false,
        message: `Server error: ${res.status}`,
      };
    }
    return (await res.json()) as ApiResponse<EditableContent>;
  } catch (err) {
    console.error('getContent error:', err);
    return {
      success: false,
      message: 'Gagal menghubungi server',
    };
  }
};

/**
 * Fetch all content for a section
 * GET /api/content/:section  (public)
 */
export const getSectionContent = async (
  section: string
): Promise<ApiResponse<EditableContent[]>> => {
  try {
    const res = await fetch(`${API_BASE}/content/${section}`);
    if (!res.ok) {
      return {
        success: false,
        message: `Server error: ${res.status}`,
      };
    }
    return (await res.json()) as ApiResponse<EditableContent[]>;
  } catch (err) {
    console.error('getSectionContent error:', err);
    return {
      success: false,
      message: 'Gagal menghubungi server',
    };
  }
};

/**
 * Update (or create) a single content field
 * PUT /api/content/:section/:field  (protected — Bearer token)
 */
export const updateContent = async (
  section: string,
  field: string,
  value: string
): Promise<ApiResponse<EditableContent>> => {
  try {
    const token = authStore.getToken();
    if (!token) {
      return {
        success: false,
        message: 'Anda harus login terlebih dahulu',
      };
    }

    const res = await fetch(`${API_BASE}/content/${section}/${field}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ value }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || `Server error: ${res.status} ${res.statusText}`,
      };
    }

    return (await res.json()) as ApiResponse<EditableContent>;
  } catch (err) {
    console.error('updateContent error:', err);
    return {
      success: false,
      message: 'Gagal menyimpan konten ke server',
    };
  }
};

/**
 * Batch update multiple fields at once
 * POST /api/content/batch  (protected — Bearer token)
 */
export const batchUpdateContent = async (
  updates: BatchContentUpdate['updates']
): Promise<ApiResponse<EditableContent[]>> => {
  try {
    const token = authStore.getToken();
    if (!token) {
      return {
        success: false,
        message: 'Anda harus login terlebih dahulu',
      };
    }

    const res = await fetch(`${API_BASE}/content/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ updates }),
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Server error: ${res.status}`,
      };
    }

    return (await res.json()) as ApiResponse<EditableContent[]>;
  } catch (err) {
    console.error('batchUpdateContent error:', err);
    return {
      success: false,
      message: 'Gagal batch-update konten',
    };
  }
};

/**
 * Delete a content field
 * DELETE /api/content/:section/:field  (protected — Bearer token)
 */
export const deleteContent = async (
  section: string,
  field: string
): Promise<ApiResponse<void>> => {
  try {
    const token = authStore.getToken();
    if (!token) {
      return {
        success: false,
        message: 'Anda harus login terlebih dahulu',
      };
    }

    const res = await fetch(`${API_BASE}/content/${section}/${field}`, {
      method: 'DELETE',
      headers: { ...authHeaders() },
    });

    if (!res.ok) {
      return {
        success: false,
        message: `Server error: ${res.status}`,
      };
    }

    return (await res.json()) as ApiResponse<void>;
  } catch (err) {
    console.error('deleteContent error:', err);
    return {
      success: false,
      message: 'Gagal menghapus konten',
    };
  }
};

/**
 * Get ALL content (full load / backup)
 * GET /api/content  (public)
 */
export const getAllContent = async (): Promise<ApiResponse<EditableContent[]>> => {
  try {
    const res = await fetch(`${API_BASE}/content`);
    if (!res.ok) {
      return {
        success: false,
        message: `Server error: ${res.status}`,
      };
    }
    return (await res.json()) as ApiResponse<EditableContent[]>;
  } catch (err) {
    console.error('getAllContent error:', err);
    return {
      success: false,
      message: 'Gagal mengambil semua konten',
    };
  }
};

// ─── Image Upload ───────────────────────────────────────────────

/**
 * Upload an image file to the backend
 * POST /api/upload  (protected — Bearer token, multipart/form-data)
 */
export const uploadImage = async (file: File): Promise<ApiResponse<{ url: string }>> => {
  try {
    const token = authStore.getToken();
    if (!token) {
      return {
        success: false,
        message: 'Anda harus login terlebih dahulu',
      };
    }

    console.log(`[DEBUG uploadImage] Uploading file: ${file.name}, size: ${file.size}`);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    console.log(`[DEBUG uploadImage] Response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.log(`[DEBUG uploadImage] Error response: ${errorText}`);
      return {
        success: false,
        message: `Gagal upload gambar: ${res.statusText}`,
      };
    }

    const result = await res.json();
    console.log(`[DEBUG uploadImage] Success response:`, result);
    return result;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[DEBUG uploadImage] Fetch error:', err);
    return {
      success: false,
      message: 'Gagal menghubungi server',
    };
  }
};


