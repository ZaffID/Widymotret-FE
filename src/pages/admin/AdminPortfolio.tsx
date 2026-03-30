import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../../stores/authStore';
import { contentStore } from '../../stores/contentStore';
import { EditableText } from '../../components/admin/EditableText';
import { EditableImage } from '../../components/admin/EditableImage';
import { portfolioCategories, getImagesByCategory } from '../../data/portfolio';
import { FaSolidArrowLeftLong } from 'solid-icons/fa';
import { AiFillCamera } from 'solid-icons/ai';
import { FaSolidTrashAlt } from 'solid-icons/fa';
import { FaSolidLightbulb } from 'solid-icons/fa';

const AdminPortfolio: Component = () => {
  const navigate = useNavigate();
  const admin = () => authStore.getAdmin();
  const [activeCategory, setActiveCategory] = createSignal<string>('portrait');
  const [saveMessage, setSaveMessage] = createSignal<{type: 'success' | 'error'; text: string} | null>(null);

  onMount(async () => {
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

  const currentCategory = () => 
    portfolioCategories.find(c => c.slug === activeCategory());

  const currentImages = () => {
    const stored = contentStore.getField('portfolio', `${activeCategory()}_images`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.log('Failed to parse portfolio images:', e);
      }
    }
    // Fallback to portfolio.ts data
    return getImagesByCategory(activeCategory() as 'portrait' | 'event' | 'editorial' | 'retouching');
  };

  return (
    <div class="min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <nav class="bg-[#464C43] text-white shadow-lg">
        <div class="container mx-auto px-4 md:px-6 py-4">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink-0">
              <button
                onClick={() => navigate('/admin/home')}
                class="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 flex-shrink-0"
              >
                <FaSolidArrowLeftLong size={16} class="md:size-18" />
                <span class="hidden md:inline text-sm">Kembali</span>
              </button>
              <span class="hidden md:inline text-lg md:text-xl font-bold">WIDYMOTRET</span>
              <span class="text-xs md:text-sm text-white/70 border-l border-white/30 pl-3 hidden md:block">Portfolio Admin</span>
            </div>

            <div class="flex items-center gap-2 md:gap-4 ml-auto">
              <div class="text-right hidden sm:block">
                <p class="text-xs md:text-sm font-medium">{admin()?.username || 'Admin'}</p>
                <p class="text-xs text-white/70">Administrator</p>
              </div>
              
              <div class="w-8 md:w-10 h-8 md:h-10 rounded-full bg-[#576250] flex items-center justify-center flex-shrink-0">
                <span class="text-sm md:text-lg font-bold">
                  {admin()?.username?.charAt(0) || 'A'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                class="px-2 md:px-4 py-1 md:py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-all duration-200 flex items-center gap-1 md:gap-2 flex-shrink-0"
              >
                <svg class="w-4 md:w-5 h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="hidden sm:inline text-xs md:text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main class="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Portfolio Management</h1>
          <p class="text-gray-600">Kelola foto galeri per kategori. Unlimited, tapi disarankan max 20 per kategori.</p>
          
          {saveMessage() && (
            <div class={`mt-4 p-4 rounded-lg ${
              saveMessage()?.type === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-300' 
                : 'bg-red-100 text-red-700 border border-red-300'
            }`}>
              {saveMessage()?.text}
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div class="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Pilih Kategori:</h2>
          <div class="flex gap-3 flex-wrap">
            <For each={portfolioCategories}>
              {(category) => (
                <button
                  onClick={() => setActiveCategory(category.slug)}
                  class={`px-6 py-2 rounded-lg font-medium transition-all ${
                    activeCategory() === category.slug
                      ? 'bg-[#576250] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Portfolio Items Section */}
        <Show when={currentCategory()}>
          {(category) => (
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-4"><AiFillCamera class="inline mr-2" size={28} />{category().name}</h2>
              <p class="text-gray-600 mb-6">{category().description}</p>

              {/* Portfolio Images Grid */}
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <For each={currentImages()}>
                  {(image, idx) => (
                    <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <EditableImage
                        label={`Foto #${idx() + 1}`}
                        value={contentStore.getField('portfolio', `${activeCategory()}_${image.id}`) || image.url}
                        section="portfolio"
                        field={`${activeCategory()}_${image.id}`}
                        aspectClass="aspect-square"
                        onSave={(value) => {
                          contentStore.updateFieldLocal('portfolio', `${activeCategory()}_${image.id}`, value);
                          handleSave(`Gambar #${idx() + 1} berhasil diupdate`);
                        }}
                        onError={handleError}
                      />
                    </div>
                  )}
                </For>

                {/* Add New Image Button */}
                <div class="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 shadow-sm flex items-center justify-center aspect-square cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => {
                    handleSave('TODO: Implementasi tambah gambar baru');
                  }}
                >
                  <div class="text-center">
                    <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <p class="text-xs text-gray-500 font-medium">Tambah Foto</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Show>
      </main>

      {/* Footer */}
      <footer class="bg-[#464C43] text-white text-center py-4 mt-16">
        <p class="text-sm">© 2025 WIDYMOTRET Portfolio Admin</p>
      </footer>
    </div>
  );
};

export default AdminPortfolio;
