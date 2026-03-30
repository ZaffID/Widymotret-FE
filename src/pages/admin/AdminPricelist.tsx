import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../../stores/authStore';
import { contentStore } from '../../stores/contentStore';
import { EditableText } from '../../components/admin/EditableText';
import { servicesData } from '../../data/services';

const AdminPricelist: Component = () => {
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
              <span class="text-sm text-white/70 border-l border-white/30 pl-3">Pricelist Admin</span>
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
          <h1 class="text-3xl font-bold text-gray-800">
            💰 Kelola Pricelist
          </h1>
          <p class="text-gray-600 mt-2">
            Edit paket dan harga untuk setiap jenis layanan fotografi.
          </p>
        </div>

        {/* Success/Error Message */}
        <Show when={saveMessage()}>
          <div class={`mb-6 p-4 rounded-lg ${saveMessage()?.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {saveMessage()?.text}
          </div>
        </Show>

        {/* Service Type Tabs */}
        <div class="bg-white rounded-xl shadow-sm p-1 mb-8 flex gap-2 flex-wrap">
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

        {/* Content Management */}
        <Show when={currentService()}>
          {(service) => (
            <div class="bg-white rounded-xl shadow-sm p-8">
              <div>
                <h2 class="text-2xl font-bold text-gray-800 mb-8">{service().title}</h2>

                {/* Service Details Section */}
                <div class="mb-10 pb-10 border-b-2 border-gray-200">
                  <h3 class="text-lg font-bold text-gray-800 mb-4">📋 Service Details</h3>
                  
                  <EditableText
                    label="Service Title"
                    value={service().title}
                    section="service"
                    field={`${service().slug}_title`}
                    multiline={false}
                    onSave={(value) => {
                      // Note: In a real app, you'd update the service in the backend
                      // For now, this is a placeholder
                      handleSave('Service title would be updated in backend');
                    }}
                    onError={handleError}
                  />

                  <EditableText
                    label="Service Description"
                    value={service().description}
                    section="service"
                    field={`${service().slug}_description`}
                    multiline={true}
                    onSave={(value) => {
                      handleSave('Service description would be updated in backend');
                    }}
                    onError={handleError}
                  />

                  <EditableText
                    label="Service Image URL"
                    value={service().image}
                    section="service"
                    field={`${service().slug}_image`}
                    multiline={false}
                    onSave={(value) => {
                      handleSave('Service image URL would be updated in backend');
                    }}
                    onError={handleError}
                  />
                </div>

                {/* Packages Section */}
                <div>
                  <h3 class="text-lg font-bold text-gray-800 mb-4">📦 Packages</h3>
                  <div class="space-y-6">
                    <For each={service().packages}>
                      {(pkg, idx) => (
                        <div class="p-6 bg-gray-50 rounded-lg border border-gray-200">
                          <div class="flex items-center justify-between mb-4">
                            <h4 class="font-bold text-gray-800">Package {idx() + 1}</h4>
                            <button
                              class="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition text-sm"
                              title="Delete this package"
                            >
                              ✕ Delete
                            </button>
                          </div>

                          <EditableText
                            label="Package Name"
                            value={pkg.name}
                            section="service"
                            field={`${service().slug}_pkg${idx()}_name`}
                            multiline={false}
                            onSave={(value) => {
                              handleSave(`Package name would be updated in backend`);
                            }}
                            onError={handleError}
                          />

                          <EditableText
                            label="Price"
                            value={pkg.price}
                            section="service"
                            field={`${service().slug}_pkg${idx()}_price`}
                            multiline={false}
                            onSave={(value) => {
                              handleSave(`Package price would be updated in backend`);
                            }}
                            onError={handleError}
                          />

                          <EditableText
                            label="Description"
                            value={pkg.description}
                            section="service"
                            field={`${service().slug}_pkg${idx()}_description`}
                            multiline={true}
                            onSave={(value) => {
                              handleSave(`Package description would be updated in backend`);
                            }}
                            onError={handleError}
                          />

                          <EditableText
                            label="Features (one per line)"
                            value={pkg.features.join('\n')}
                            section="service"
                            field={`${service().slug}_pkg${idx()}_features`}
                            multiline={true}
                            onSave={(value) => {
                              handleSave(`Package features would be updated in backend`);
                            }}
                            onError={handleError}
                          />
                        </div>
                      )}
                    </For>
                  </div>

                  <button class="mt-6 px-6 py-3 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium">
                    + Add New Package
                  </button>
                </div>
              </div>
            </div>
          )}
        </Show>

        {/* Info Note */}
        <div class="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p class="text-sm text-blue-800">
            💡 <strong>Note:</strong> Editing paket akan disimpan ke backend. Setiap perubahan akan langsung terlihat di halaman pricelist frontend.
          </p>
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

export default AdminPricelist;
