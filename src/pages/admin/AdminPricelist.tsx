import { Component, For, Show, createMemo, createSignal, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../../stores/authStore';
import { EditableImage } from '../../components/admin/EditableImage';
import Toast from '../../components/Toast';
import ScrollToTop from '../../components/ScrollToTop';

type Category = 'studio' | 'graduation' | 'event' | 'product' | 'wedding';

interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  features: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://widymotret-be-production-00a0.up.railway.app'}/api`;

const categoryOptions: Array<{ value: Category; label: string }> = [
  { value: 'studio', label: 'Studio Photoshoot' },
  { value: 'graduation', label: 'Graduation Photoshoot' },
  { value: 'event', label: 'Event Photoshoot' },
  { value: 'product', label: 'Product Photography' },
  { value: 'wedding', label: 'Wedding Photography & Videography' },
];

const AdminPricelist: Component = () => {
  const navigate = useNavigate();
  const admin = () => authStore.getAdmin();

  const [activeCategory, setActiveCategory] = createSignal<Category>('studio');
  const [packages, setPackages] = createSignal<Package[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [isAdding, setIsAdding] = createSignal(false);
  const [saveMessage, setSaveMessage] = createSignal<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setSaveMessage({ type, text });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const loadPackages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/packages`);
      const data = await res.json();
      if (data.success) {
        setPackages(data.data || []);
      } else {
        showToast('error', data.message || 'Gagal memuat package');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan saat memuat package');
    } finally {
      setIsLoading(false);
    }
  };

  onMount(() => {
    loadPackages();
  });

  const filteredPackages = createMemo(() =>
    packages().filter((p) => p.category?.toLowerCase() === activeCategory())
  );

  const updatePackageLocal = (id: number, updater: (pkg: Package) => Package) => {
    setPackages((prev) => prev.map((p) => (p.id === id ? updater(p) : p)));
  };

  const savePackage = async (pkg: Package) => {
    const token = authStore.getToken();
    try {
      const res = await fetch(`${API_BASE}/packages/${pkg.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          category: pkg.category,
          images: pkg.images,
          features: pkg.features,
          isPublished: pkg.isPublished,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', `Package "${pkg.name}" berhasil disimpan`);
      } else {
        showToast('error', data.message || 'Gagal menyimpan package');
      }
    } catch (err) {
      showToast('error', 'Terjadi kesalahan koneksi saat menyimpan package');
    }
  };

  const addPackage = async () => {
    setIsAdding(true);
    const token = authStore.getToken();

    try {
      const res = await fetch(`${API_BASE}/packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: 'Paket Baru',
          description: 'Deskripsi paket baru',
          price: 0,
          category: activeCategory(),
          images: [],
          features: [],
          isPublished: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', 'Package baru berhasil ditambahkan');
        await loadPackages();
      } else {
        showToast('error', data.message || 'Gagal menambah package');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan koneksi saat menambah package');
    } finally {
      setIsAdding(false);
    }
  };

  const deletePackage = async (pkg: Package) => {
    if (!confirm(`Yakin ingin menghapus package "${pkg.name}"?`)) return;

    const token = authStore.getToken();
    try {
      const res = await fetch(`${API_BASE}/packages/${pkg.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        showToast('success', 'Package berhasil dihapus');
        await loadPackages();
      } else {
        showToast('error', data.message || 'Gagal menghapus package');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan koneksi saat menghapus package');
    }
  };

  const uploadImageForPackage = async (file: File) => {
    const token = authStore.getToken();
    if (!token) {
      throw new Error('Anda harus login terlebih dahulu');
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload gagal: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  };

  const handleLogout = () => {
    authStore.logout();
    navigate('/admin', { replace: true });
  };

  return (
    <div class="min-h-screen bg-gray-100">
      <nav class="bg-[#464C43] text-white shadow-lg">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/home')}
                class="mr-4 px-3 py-2 bg-white/20 hover:bg-white/30 rounded transition text-sm"
              >
                <- Back
              </button>
              <span class="text-xl font-bold">WIDYMOTRET</span>
              <span class="text-sm text-white/70 border-l border-white/30 pl-3">Pricelist Admin</span>
            </div>

            <div class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium">{admin()?.username || 'Admin'}</p>
              </div>
              <div class="w-10 h-10 rounded-full bg-[#576250] flex items-center justify-center">
                <span class="text-lg font-bold">{admin()?.username?.charAt(0).toUpperCase() || 'A'}</span>
              </div>
              <button
                onClick={handleLogout}
                class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="container mx-auto px-6 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-800">Kelola Pricelist</h1>
          <p class="text-gray-600 mt-2">Desain card editor: lebih dekat dengan tampilan lama, tapi data tersambung backend.</p>
        </div>

        <Show when={saveMessage()}>
          <div class={`mb-6 p-4 rounded-lg ${saveMessage()?.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {saveMessage()?.text}
          </div>
        </Show>

        <div class="bg-white rounded-xl shadow-sm p-1 mb-8 flex gap-2 flex-wrap">
          <For each={categoryOptions}>
            {(opt) => (
              <button
                onClick={() => setActiveCategory(opt.value)}
                class={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeCategory() === opt.value
                    ? 'bg-[#576250] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            )}
          </For>
        </div>

        <div class="mb-6">
          <button
            onClick={addPackage}
            disabled={isAdding()}
            class="px-5 py-2.5 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium text-sm disabled:opacity-60"
          >
            {isAdding() ? 'Menambahkan...' : '+ Tambah Paket Baru'}
          </button>
        </div>

        <Show when={isLoading()}>
          <div class="flex justify-center py-16">
            <div class="animate-spin w-8 h-8 border-4 border-[#576250] border-t-transparent rounded-full"></div>
          </div>
        </Show>

        <Show when={!isLoading()}>
          <div class="space-y-5">
            <For
              each={filteredPackages()}
              fallback={
                <div class="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                  Belum ada package di kategori ini. Klik "+ Tambah Paket Baru".
                </div>
              }
            >
              {(pkg, idx) => (
                <div class="bg-white rounded-xl border border-gray-200 p-6">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="font-bold text-gray-800">Paket {idx() + 1}</h4>
                    <button
                      onClick={() => deletePackage(pkg)}
                      class="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition text-sm"
                    >
                      Hapus
                    </button>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Nama Paket</label>
                      <input
                        value={pkg.name}
                        onInput={(e) => updatePackageLocal(pkg.id, (p) => ({ ...p, name: e.currentTarget.value }))}
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Harga</label>
                      <input
                        value={String(pkg.price)}
                        onInput={(e) => {
                          const raw = e.currentTarget.value.replace(/[^0-9]/g, '');
                          updatePackageLocal(pkg.id, (p) => ({ ...p, price: raw ? parseInt(raw) : 0 }));
                        }}
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <textarea
                      value={pkg.description}
                      onInput={(e) => updatePackageLocal(pkg.id, (p) => ({ ...p, description: e.currentTarget.value }))}
                      rows="3"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fitur (Satu Baris Per Fitur)</label>
                    <textarea
                      value={(pkg.features || []).join('\n')}
                      onInput={(e) =>
                        updatePackageLocal(pkg.id, (p) => ({
                          ...p,
                          features: e.currentTarget.value.split('\n').map((x) => x.trim()).filter(Boolean),
                        }))
                      }
                      rows="5"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-4">Contoh Foto Package</label>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <For each={pkg.images || []}>
                        {(img, idx) => (
                          <EditableImage
                            label={`Foto #${idx() + 1}`}
                            value={img}
                            section={`package-${pkg.id}`}
                            field={`image-${idx()}`}
                            aspectClass="aspect-square"
                            onUpload={uploadImageForPackage}
                            onSave={(newValue) => {
                              const newImages = [...(pkg.images || [])];
                              newImages[idx()] = newValue;
                              updatePackageLocal(pkg.id, (p) => ({ ...p, images: newImages }));
                              showToast('success', 'Gambar diupdate. Klik "Simpan Paket" untuk menyimpan ke server.');
                            }}
                            onDelete={() => {
                              const newImages = (pkg.images || []).filter((_, i) => i !== idx());
                              updatePackageLocal(pkg.id, (p) => ({ ...p, images: newImages }));
                              showToast('success', 'Gambar dihapus. Klik "Simpan Paket" untuk menyimpan ke server.');
                            }}
                            onError={(err) => showToast('error', err)}
                          />
                        )}
                      </For>

                      {/* Add New Image Button */}
                      <div
                        class="bg-white p-3 rounded-lg border-2 border-dashed border-gray-300 shadow-sm flex items-center justify-center aspect-square cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => {
                          const fileInput = document.createElement('input');
                          fileInput.type = 'file';
                          fileInput.accept = 'image/*';
                          fileInput.addEventListener('change', async (e) => {
                            const input = e.target as HTMLInputElement;
                            const file = input.files?.[0];
                            if (!file) return;

                            try {
                              const response = await uploadImageForPackage(file);
                              if (response.success && response.data?.url) {
                                const newImages = [...(pkg.images || []), response.data.url];
                                updatePackageLocal(pkg.id, (p) => ({ ...p, images: newImages }));
                                showToast('success', 'Gambar ditambahkan. Klik "Simpan Paket" untuk menyimpan ke server.');
                              } else {
                                showToast('error', response.message || 'Upload gagal');
                              }
                            } catch (err) {
                              showToast('error', err instanceof Error ? err.message : 'Upload gagal');
                            }
                          });
                          fileInput.click();
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

                  <div class="mt-4 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`published-${pkg.id}`}
                      checked={pkg.isPublished}
                      onChange={(e) => updatePackageLocal(pkg.id, (p) => ({ ...p, isPublished: e.currentTarget.checked }))}
                    />
                    <label for={`published-${pkg.id}`} class="text-sm text-gray-700">
                      Published (tampilkan di website)
                    </label>
                  </div>

                  <div class="mt-5">
                    <button
                      onClick={() => savePackage(pkg)}
                      class="px-5 py-2.5 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium text-sm"
                    >
                      Simpan Paket
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </main>
    </div>
  );
};

export default AdminPricelist;

