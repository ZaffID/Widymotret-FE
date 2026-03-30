import { createSignal, createRoot } from 'solid-js';

interface Admin {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
  token: string | null;
}

// Mock admin credentials (untuk development, nanti diganti dengan API call)
// Email: admin@example.com
// Password: 123456
const MOCK_ADMIN = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin Widymotret',
};

// Simple password verification (mock - di production gunakan backend API dengan bcrypt)
const verifyPassword = (password: string): boolean => {
  // Untuk development, cek password langsung
  // Di production, ini akan menjadi API call ke backend yang melakukan bcrypt.compare()
  return password === '123456';
};

function createAuthStore() {
  // Initialize from localStorage
  const storedToken = localStorage.getItem('adminToken');
  const storedAdmin = localStorage.getItem('adminData');
  
  const initialState: AuthState = {
    isAuthenticated: !!storedToken,
    admin: storedAdmin ? JSON.parse(storedAdmin) : null,
    token: storedToken,
  };

  const [state, setState] = createSignal<AuthState>(initialState);

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Simulasi API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Validasi email
      if (email !== MOCK_ADMIN.email) {
        return { success: false, message: 'Email atau password salah' };
      }

      // Validasi password (mock - di production akan menggunakan bcrypt di backend)
      if (!verifyPassword(password)) {
        return { success: false, message: 'Email atau password salah' };
      }

      // Generate mock token (di production akan dari backend)
      const token = btoa(`${MOCK_ADMIN.id}:${Date.now()}`);
      const adminData: Admin = {
        id: MOCK_ADMIN.id,
        email: MOCK_ADMIN.email,
        name: MOCK_ADMIN.name,
      };

      // Save to localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminData', JSON.stringify(adminData));

      // Update state
      setState({
        isAuthenticated: true,
        admin: adminData,
        token: token,
      });

      return { success: true, message: 'Login berhasil' };
    } catch (error) {
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
