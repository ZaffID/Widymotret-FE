import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../../stores/authStore';
import { contentStore } from '../../stores/contentStore';
import { EditableText } from '../../components/admin/EditableText';
import { servicesData } from '../../data/services';

const AdminPortfolio: Component = () => {
  const navigate = useNavigate();
  const admin = () => authStore.getAdmin();
  const [activeService, setActiveService] = createSignal<string>('studio');
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

  const currentService = () => servicesData.find(s => s.slug === activeService());

  return (
    <div class="min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <nav class="bg-[#464C43] text-white shadow-lg">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/home')}
                class="mr-4 px-3 py-2 bg-white/20 hover:bg-white/30 rounded transition text-sm"
              >
                ← Back to Admin Home
              </button>
              <span class="text-xl font-bold">WIDYMOTRET</span>
              <span class="text-sm text-white/70 border-l border-white/30 pl-3">Portfolio Admin</span>
            </div>

            <div class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium">{admin()?.name || 'Admin'}</p>
                <p class="text-xs text-white/70">{admin()?.email}</p>
              </div>
              
              <div class="w-10 h-10 rounded-full bg-[#576250] flex items-center justify-center">
                <span class="text-lg font-bold">
                  {admin()?.name?.charAt(0) || 'A'}
                </span>
              </div>

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
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Portfolio Management</h1>
          <p class="text-gray-600">Kelola foto dan galeri untuk setiap jenis layanan</p>
          
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

        {/* Service Type Tabs */}
        <div class="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Pilih Jenis Layanan:</h2>
          <div class="flex gap-3 flex-wrap">
            <For each={servicesData}>
              {(service) => (
                <button
                  onClick={() => setActiveService(service.slug)}
                  class={`px-6 py-2 rounded-lg font-medium transition-all ${
                    activeService() === service.slug
                      ? 'bg-[#576250] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {service.title}
                </button>
              )}
            </For>
          </div>
        </div>

        {/* Portfolio Items Section */}
        <Show when={currentService()}>
          {(service) => (
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-8">📸 {service().title} - Portfolio</h2>

              {/* Portfolio Items Grid */}
              <div class="space-y-6">
                <For each={service().packages}>
                  {(item, idx) => (
                    <div class="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Image Preview */}
                        <div class="md:col-span-1">
                          <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <Show 
                              when={item.price} 
                              fallback={<span class="text-gray-400 text-center text-sm">No Image URL</span>}
                            >
                              <img 
                                src={item.price || ''} 
                                alt={item.name}
                                class="w-full h-full object-cover"
                                onerror={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </Show>
                          </div>
                        </div>

                        {/* Portfolio Item Details */}
                        <div class="md:col-span-2 space-y-4">
                          <EditableText
                            label="Portfolio Item Title"
                            value={item.name}
                            section="portfolio"
                            field={`${service().slug}_item${idx()}_title`}
                            multiline={false}
                            onSave={(value) => { handleSave(`Portfolio item title would be updated`) }}
                            onError={handleError}
                          />

                          <EditableText
                            label="Image URL"
                            value={item.price || ''}
                            section="portfolio"
                            field={`${service().slug}_item${idx()}_image`}
                            multiline={false}
                            onSave={(value) => { handleSave(`Image URL would be updated`) }}
                            onError={handleError}
                          />

                          <EditableText
                            label="Description"
                            value={item.description || ''}
                            section="portfolio"
                            field={`${service().slug}_item${idx()}_description`}
                            multiline={true}
                            onSave={(value) => { handleSave(`Description would be updated`) }}
                            onError={handleError}
                          />

                          {/* Meta Information */}
                          <div class="pt-2 border-t border-gray-200 flex justify-between items-center">
                            <span class="text-sm text-gray-500">Item #{idx() + 1}</span>
                            <button
                              class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-medium"
                              onClick={() => handleSave(`Portfolio item would be deleted`)}
                            >
                              🗑️ Delete Item
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>

              {/* Add New Item Button */}
              <div class="mt-8">
                <button
                  onClick={() => handleSave(`New portfolio item would be added`)}
                  class="w-full py-3 px-4 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition-all font-medium flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Portfolio Item
                </button>
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
