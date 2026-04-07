import { createSignal, createRoot } from 'solid-js';

interface Admin {
  id: number;
  username: string; // ini sebenarnya email, tapi tetap username untuk backward compatibility
}

interface AuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
  token: string | null;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    admin: Admin;
  };
}

function createAuthStore() {
  const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://widymotret-be-production-00a0.up.railway.app';

  // Initialize from localStorage
  const storedToken = localStorage.getItem('adminToken');
  const storedAdmin = localStorage.getItem('adminData');
  
  const initialState: AuthState = {
    isAuthenticated: !!storedToken,
    admin: storedAdmin ? JSON.parse(storedAdmin) : null,
    token: storedToken,
  };

  const [state, setState] = createSignal<AuthState>(initialState);

  // Login function - calls real backend
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return { success: false, message: 'Login gagal. Periksa email dan password.' };
      }

      const data: LoginResponse = await response.json();

      if (data.success && data.data) {
        const { token, admin } = data.data;

        // Save to localStorage
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(admin));

        // Update state
        setState({
          isAuthenticated: true,
          admin,
          token,
        });

        return { success: true, message: 'Login berhasil' };
      } else {
        return { success: false, message: data.message || 'Login gagal' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Terjadi kesalahan. Silakan coba lagi.' };
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');

    // Reset state
    setState({
      isAuthenticated: false,
      admin: null,
      token: null,
    });
  };

  // Check if authenticated
  const isAuthenticated = () => state().isAuthenticated;
  
  // Get admin data
  const getAdmin = () => state().admin;

  // Get token
  const getToken = () => state().token;

  return {
    state,
    login,
    logout,
    isAuthenticated,
    getAdmin,
    getToken,
  };
}

// Create singleton store
export const authStore = createRoot(createAuthStore);

