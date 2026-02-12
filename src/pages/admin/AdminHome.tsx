import { Component, createSignal, onMount, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../../stores/authStore';
import { contentStore } from '../../stores/contentStore';
import { EditableText } from '../../components/admin/EditableText';

const AdminHome: Component = () => {
  const navigate = useNavigate();
  const admin = () => authStore.getAdmin();
  const [activeTab, setActiveTab] = createSignal('hero');
  const [saveMessage, setSaveMessage] = createSignal<{type: 'success' | 'error'; text: string} | null>(null);

  onMount(async () => {
    // Load all content on component mount
    await contentStore.loadAll();
  });

  const handleLogout = () => {
    authStore.logout();
    navigate('/admin', { replace: true });
  };

  const handleSave = (message: string) => {
    setSaveMessage({ type: 'success', text: message });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleError = (message: string) => {
    setSaveMessage({ type: 'error', text: message });
  };

  return (
    <div class="min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <nav class="bg-[#464C43] text-white shadow-lg">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            {/* Logo */}
            <div class="flex items-center gap-3">
              <span class="text-xl font-bold">WIDYMOTRET</span>
              <span class="text-sm text-white/70 border-l border-white/30 pl-3">Admin Panel</span>
            </div>

            {/* User Menu */}
            <div class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium">{admin()?.name || 'Admin'}</p>
                <p class="text-xs text-white/70">{admin()?.email}</p>
              </div>
              
              {/* Avatar */}
              <div class="w-10 h-10 rounded-full bg-[#576250] flex items-center justify-center">
                <span class="text-lg font-bold">
                  {admin()?.name?.charAt(0) || 'A'}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main class="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-800">
            Selamat Datang, {admin()?.name?.split(' ')[0] || 'Admin'}! 👋
          </h1>
          <p class="text-gray-600 mt-2">
            Kelola konten website Widymotret Studio dari sini.
          </p>
        </div>

        {/* Success/Error Message */}
        <Show when={saveMessage()}>
          <div class={`mb-6 p-4 rounded-lg ${saveMessage()?.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {saveMessage()?.text}
          </div>
        </Show>

        {/* Tab Navigation */}
        <div class="bg-white rounded-xl shadow-sm p-1 mb-8 flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('hero')}
            class={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab() === 'hero'
                ? 'bg-[#576250] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🏠 Hero Section
          </button>
          <button
            onClick={() => setActiveTab('about')}
            class={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab() === 'about'
                ? 'bg-[#576250] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ℹ️ About
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            class={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab() === 'contact'
                ? 'bg-[#576250] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📞 Contact Info
          </button>
          <button
            onClick={() => setActiveTab('services')}
            class={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab() === 'services'
                ? 'bg-[#576250] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🎯 Services
          </button>
        </div>

        {/* Content Management */}
        <div class="bg-white rounded-xl shadow-sm p-8">
          {/* Hero Section Tab */}
          <Show when={activeTab() === 'hero'}>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-6">Hero Section</h2>
              <EditableText
                label="Hero Title"
                value={contentStore.getField('hero', 'title')}
                section="hero"
                field="title"
                multiline={false}
                onSave={(value) => {
                  contentStore.updateFieldLocal('hero', 'title', value);
                  handleSave('Hero title berhasil disimpan');
                }}
                onError={handleError}
              />
              <EditableText
                label="Hero Subtitle"
                value={contentStore.getField('hero', 'subtitle')}
                section="hero"
                field="subtitle"
                multiline={true}
                onSave={(value) => {
                  contentStore.updateFieldLocal('hero', 'subtitle', value);
                  handleSave('Hero subtitle berhasil disimpan');
                }}
                onError={handleError}
              />
              
              <div class="mt-8 pt-8 border-t border-gray-300">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Introduction Section</h3>
                <EditableText
                  label="Introduction Heading"
                  value={contentStore.getField('introduction', 'heading')}
                  section="introduction"
                  field="heading"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('introduction', 'heading', value);
                    handleSave('Introduction heading berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Introduction Description 1"
                  value={contentStore.getField('introduction', 'description1')}
                  section="introduction"
                  field="description1"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('introduction', 'description1', value);
                    handleSave('Introduction description 1 berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Introduction Description 2"
                  value={contentStore.getField('introduction', 'description2')}
                  section="introduction"
                  field="description2"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('introduction', 'description2', value);
                    handleSave('Introduction description 2 berhasil disimpan');
                  }}
                  onError={handleError}
                />
              </div>
            </div>
          </Show>

          {/* About Section Tab */}
          <Show when={activeTab() === 'about'}>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-6">About Section</h2>
              <EditableText
                label="About Title"
                value={contentStore.getField('about', 'title')}
                section="about"
                field="title"
                multiline={false}
                onSave={(value) => {
                  contentStore.updateFieldLocal('about', 'title', value);
                  handleSave('About title berhasil disimpan');
                }}
                onError={handleError}
              />
              <EditableText
                label="About Description 1"
                value={contentStore.getField('about', 'description1')}
                section="about"
                field="description1"
                multiline={true}
                onSave={(value) => {
                  contentStore.updateFieldLocal('about', 'description1', value);
                  handleSave('About description 1 berhasil disimpan');
                }}
                onError={handleError}
              />
              <EditableText
                label="About Description 2"
                value={contentStore.getField('about', 'description2')}
                section="about"
                field="description2"
                multiline={true}
                onSave={(value) => {
                  contentStore.updateFieldLocal('about', 'description2', value);
                  handleSave('About description 2 berhasil disimpan');
                }}
                onError={handleError}
              />
            </div>
          </Show>

          {/* Contact Section Tab */}
          <Show when={activeTab() === 'contact'}>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
              <EditableText
                label="Phone"
                value={contentStore.getField('settings', 'phone')}
                section="settings"
                field="phone"
                multiline={false}
                onSave={(value) => {
                  contentStore.updateFieldLocal('settings', 'phone', value);
                  handleSave('Nomor telepon berhasil disimpan');
                }}
                onError={handleError}
              />
              <EditableText
                label="Email"
                value={contentStore.getField('settings', 'email')}
                section="settings"
                field="email"
                multiline={false}
                onSave={(value) => {
                  contentStore.updateFieldLocal('settings', 'email', value);
                  handleSave('Email berhasil disimpan');
                }}
                onError={handleError}
              />
              <EditableText
                label="Address"
                value={contentStore.getField('settings', 'address')}
                section="settings"
                field="address"
                multiline={true}
                onSave={(value) => {
                  contentStore.updateFieldLocal('settings', 'address', value);
                  handleSave('Alamat berhasil disimpan');
                }}
                onError={handleError}
              />
              <EditableText
                label="WhatsApp Number"
                value={contentStore.getField('settings', 'whatsapp')}
                section="settings"
                field="whatsapp"
                multiline={false}
                onSave={(value) => {
                  contentStore.updateFieldLocal('settings', 'whatsapp', value);
                  handleSave('Nomor WhatsApp berhasil disimpan');
                }}
                onError={handleError}
              />
              <EditableText
                label="Instagram Handle"
                value={contentStore.getField('settings', 'instagram')}
                section="settings"
                field="instagram"
                multiline={false}
                onSave={(value) => {
                  contentStore.updateFieldLocal('settings', 'instagram', value);
                  handleSave('Instagram handle berhasil disimpan');
                }}
                onError={handleError}
              />
            </div>
          </Show>

          {/* Services Section Tab */}
          <Show when={activeTab() === 'services'}>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-6">Services Section</h2>
              <EditableText
                label="Services Title"
                value={contentStore.getField('services', 'title')}
                section="services"
                field="title"
                multiline={false}
                onSave={(value) => {
                  contentStore.updateFieldLocal('services', 'title', value);
                  handleSave('Services title berhasil disimpan');
                }}
                onError={handleError}
              />
              <EditableText
                label="Services Subtitle"
                value={contentStore.getField('services', 'subtitle')}
                section="services"
                field="subtitle"
                multiline={true}
                onSave={(value) => {
                  contentStore.updateFieldLocal('services', 'subtitle', value);
                  handleSave('Services subtitle berhasil disimpan');
                }}
                onError={handleError}
              />
            </div>
          </Show>

          {/* Info Note */}
          <div class="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p class="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Klik ikon pensil di setiap field untuk mengedit konten. Perubahan akan disimpan secara otomatis ke backend.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer class="bg-white border-t mt-auto py-4 px-6">
        <div class="container mx-auto text-center text-gray-500 text-sm">
          <p>© 2026 Widymotret Studio Admin Panel</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminHome;
