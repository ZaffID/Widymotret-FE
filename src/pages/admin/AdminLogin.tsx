import { Component, createSignal, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../../stores/authStore';

const AdminLogin: Component = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  
  // Form validation errors
  const [emailError, setEmailError] = createSignal('');
  const [passwordError, setPasswordError] = createSignal('');

  // Check if already logged in
  if (authStore.isAuthenticated()) {
    navigate('/admin/home', { replace: true });
  }

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email wajib diisi');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Format email tidak valid');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    if (!password.trim()) {
      setPasswordError('Password wajib diisi');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password minimal 6 karakter');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Handle form submit
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const isEmailValid = validateEmail(email());
    const isPasswordValid = validatePassword(password());

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await authStore.login(email(), password());
      
      if (result.success) {
        navigate('/admin/home', { replace: true });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-[#464C43] to-[#576250] flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        {/* Logo/Brand */}
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">WIDYMOTRET</h1>
          <p class="text-white/70">Admin Panel</p>
        </div>

        {/* Login Card */}
        <div class="bg-white rounded-2xl shadow-2xl p-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-[#464C43]">Selamat Datang</h2>
            <p class="text-gray-500 mt-2">Silakan login untuk melanjutkan</p>
          </div>

          {/* Error Message */}
          <Show when={error()}>
            <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-center gap-2 text-red-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium">{error()}</span>
              </div>
            </div>
          </Show>

          <form onSubmit={handleSubmit} class="space-y-6">
            {/* Email Field */}
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email()}
                onInput={(e) => {
                  setEmail(e.currentTarget.value);
                  if (emailError()) validateEmail(e.currentTarget.value);
                }}
                onBlur={() => validateEmail(email())}
                class="w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-[#576250] focus:border-transparent outline-none"
                classList={{
                  'border-gray-300': !emailError(),
                  'border-red-500 bg-red-50': !!emailError()
                }}
                placeholder="admin@example.com"
                disabled={isLoading()}
              />
              <Show when={emailError()}>
                <p class="mt-1 text-sm text-red-500">{emailError()}</p>
              </Show>
            </div>

            {/* Password Field */}
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password()}
                onInput={(e) => {
                  setPassword(e.currentTarget.value);
                  if (passwordError()) validatePassword(e.currentTarget.value);
                }}
                onBlur={() => validatePassword(password())}
                class="w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-[#576250] focus:border-transparent outline-none"
                classList={{
                  'border-gray-300': !passwordError(),
                  'border-red-500 bg-red-50': !!passwordError()
                }}
                placeholder="••••••••"
                disabled={isLoading()}
              />
              <Show when={passwordError()}>
                <p class="mt-1 text-sm text-red-500">{passwordError()}</p>
              </Show>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading()}
              class="w-full py-3 px-6 bg-[#464C43] hover:bg-[#576250] text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Show when={isLoading()} fallback="Login">
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Memproses...</span>
              </Show>
            </button>
          </form>

          {/* Back to Website */}
          <div class="mt-8 text-center">
            <a 
              href="/" 
              class="text-sm text-gray-500 hover:text-[#576250] transition"
            >
              ← Kembali ke Website
            </a>
          </div>
        </div>

        {/* Footer */}
        <p class="text-center text-white/50 text-sm mt-8">
          © 2026 Widymotret Studio. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
