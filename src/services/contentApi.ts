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
      console.log(`[updateContent] No token found - user not authenticated`);
      return {
        success: false,
        message: 'Anda harus login terlebih dahulu',
      };
    }

    const isDelete = value === '';
    const valuePreview = isDelete ? '(empty - delete)' : value.substring(0, 30) + (value.length > 30 ? '...' : '');
    
    console.log(`[updateContent] PUT /api/content/${section}/${field}`);
    console.log(`[updateContent] Is delete: ${isDelete}, Value preview: ${valuePreview}`);
    console.log(`[updateContent] Token: ${token.substring(0, 20)}... (length: ${token.length})`);

    const res = await fetch(`${API_BASE}/content/${section}/${field}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ value }),
    });

    console.log(`[updateContent] Response status: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      let errorData = {};
      try {
        errorData = await res.json();
      } catch (e) {
        // Response wasn't JSON
        errorData = { message: `HTTP ${res.status}` };
      }
      console.error(`[updateContent] ✗ HTTP Error ${res.status}:`, errorData);
      return {
        success: false,
        message: (errorData as any).message || `Server error: ${res.status} ${res.statusText}`,
      };
    }

    const responseData = (await res.json()) as ApiResponse<EditableContent>;
    console.log(`[updateContent] ✓ Success:`, responseData.success, responseData.message);
    return responseData;
  } catch (err) {
    console.error('[updateContent] ✗ Exception:', err instanceof Error ? err.message : String(err));
    if (err instanceof Error) {
      console.error('[updateContent] Stack trace:', err.stack);
    }
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Gagal menyimpan konten ke server',
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


