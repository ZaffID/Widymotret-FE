import { Component, createSignal, onMount, Show, For, createMemo } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../../stores/authStore';
import { contentStore } from '../../stores/contentStore';
import { EditableText } from '../../components/admin/EditableText';
import { EditableImage } from '../../components/admin/EditableImage';
import Toast from '../../components/Toast';
import ScrollToTop from '../../components/ScrollToTop';
import { servicesData } from '../../data/services';
import { aboutData } from '../../data/about';
import { portfolioCategories, getImagesByCategory } from '../../data/portfolio';
import { resolveMediaUrl } from '../../utils/mediaUrl';

// API Base URL - same as contentApi
const API_BASE = `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://widymotret-be-production.up.railway.app'}/api`;

import { AiFillHome } from 'solid-icons/ai';
import { AiFillDollarCircle } from 'solid-icons/ai';
import { AiFillCamera } from 'solid-icons/ai';
import { AiFillBook } from 'solid-icons/ai';
import { FaSolidClapperboard } from 'solid-icons/fa';
import { AiFillEdit } from 'solid-icons/ai';
import { RiGameSportsTargetFill } from 'solid-icons/ri';
import { AiFillFileImage } from 'solid-icons/ai';
import { RiWeatherSparkling2Fill } from 'solid-icons/ri';
import { FaSolidClipboardList } from 'solid-icons/fa';
import { FiPackage } from 'solid-icons/fi';
import { FaSolidTrashAlt } from 'solid-icons/fa';
import { FaSolidLightbulb } from 'solid-icons/fa';
import { FaRegularCalendarAlt } from 'solid-icons/fa';
import { AiFillStar } from 'solid-icons/ai';
import { FaSolidPhoneAlt } from 'solid-icons/fa';
import { BsRocketTakeoffFill } from 'solid-icons/bs';

interface ApiPackage {
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

const packageTemplateImages: Record<string, string[]> = {
  studio: [
    '/STUDIO/personal/DSC00061.jpg',
    '/STUDIO/MINIGRUP/DSC00038.jpg',
    '/STUDIO/MEDIUM GRUP/DSC00174.jpg',
    '/STUDIO/LARGE GRUP/DSC00207.jpg',
  ],
  graduation: [
    '/STUDIO/GRADUATION/DSC01616.jpg',
    '/STUDIO/GRADUATION/DSC02593.jpg',
    '/STUDIO/GRADUATION/WID02934.jpg',
    '/STUDIO/GRADUATION/WID03838.jpg',
  ],
  event: [
    '/event/picnic.jpg',
    '/birthday party pl.jpg',
    '/home (3).jpg',
    '/home (4).jpg',
  ],
  product: [
    '/photography.png',
    '/diagonal (1).png',
    '/diagonal (2).png',
    '/landscape/landscape (1).png',
  ],
  wedding: [
    '/wedding-design.png',
    '/STUDIO/PREWED/DSC00088.jpg',
    '/STUDIO/PREWED/DSC00145.jpg',
    '/STUDIO/PREWED/WDI_0794.jpg',
  ],
};

const TestimoniCounter = () => {
  const getCount = createMemo(() => {
    let count = 0;
    for (let i = 1; i <= 7; i++) {
      if (contentStore.getField('testimonials', `quote${i}`)) count++;
    }
    return count;
  });

  const isFull = createMemo(() => getCount() >= 6);

  return (
    <p class="text-sm text-gray-600">
      <span class="font-semibold">{getCount()}</span> dari 7 testimoni
      <Show when={isFull()}>
        <span class="text-orange-600 ml-2">⚠️ Max approached</span>
      </Show>
    </p>
  );
};

const AdminHome: Component = () => {
  const navigate = useNavigate();
  const admin = () => authStore.getAdmin();
  const [currentPage, setCurrentPage] = createSignal<'home' | 'pricelist' | 'portfolio' | 'about'>('home');
  const [activeServicePricelist, setActiveServicePricelist] = createSignal<string>('studio');
  const [activeServicePortfolio, setActiveServicePortfolio] = createSignal<string>('portrait');
  const [saveMessage, setSaveMessage] = createSignal<{type: 'success' | 'error'; text: string} | null>(null);
  const [packages, setPackages] = createSignal<ApiPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = createSignal(false);
  const [addingPackage, setAddingPackage] = createSignal(false);
  const [editingFields, setEditingFields] = createSignal<Record<string, boolean>>({});
  const [fieldDrafts, setFieldDrafts] = createSignal<Record<string, string>>({});
  const [showAddPackageModal, setShowAddPackageModal] = createSignal(false);
  const [showDeletePackageModal, setShowDeletePackageModal] = createSignal(false);
  const [packageToDelete, setPackageToDelete] = createSignal<ApiPackage | null>(null);
  const [newPackageName, setNewPackageName] = createSignal('Paket Baru');
  const [newPackageDescription, setNewPackageDescription] = createSignal('Deskripsi paket baru');
  const [newPackagePrice, setNewPackagePrice] = createSignal('0');
  const [newPackageFeatures, setNewPackageFeatures] = createSignal('');
  const [newPackagePublished, setNewPackagePublished] = createSignal(true);

  onMount(async () => {
    // Load all content on component mount
    await contentStore.loadAll();
    await loadPackages();
  });

  const getTemplateImagesByCategory = (category: string, seed = 0): string[] => {
    const key = (category || '').toLowerCase();
    const source = packageTemplateImages[key] || [
      '/landscape/landscape (1).png',
      '/landscape/landscape (2).png',
      '/landscape/landscape (3).png',
      '/landscape/landscape (4).png',
    ];

    const start = source.length > 0 ? seed % source.length : 0;
    const rotated = [...source.slice(start), ...source.slice(0, start)];
    return rotated.slice(0, Math.min(4, rotated.length));
  };

  const loadPackages = async () => {
    setPackagesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/packages`);
      const data = await res.json();
      if (data.success) {
        const hydrated = (data.data || []).map((pkg: ApiPackage, idx: number) => ({
          ...pkg,
          images: Array.isArray(pkg.images) && pkg.images.length > 0
            ? pkg.images
            : getTemplateImagesByCategory(pkg.category, idx),
        }));
        setPackages(hydrated);
      }
    } catch (error) {
      handleError('Gagal memuat data package dari backend');
    } finally {
      setPackagesLoading(false);
    }
  };

  const filteredPackages = createMemo(() => {
    const category = activeServicePricelist().toLowerCase();
    return packages().filter((pkg) => pkg.category?.toLowerCase() === category);
  });

  const getServicePreviewImage = (slug: string, fallback: string) => {
    const category = slug.toLowerCase();
    const pkg = packages().find((p) => p.category?.toLowerCase() === category && (p.images || []).length > 0);
    const fromPackages = pkg?.images?.[0];
    return resolveMediaUrl(fromPackages || fallback);
  };

  const updatePackageLocal = (id: number, updater: (pkg: ApiPackage) => ApiPackage) => {
    setPackages((prev) => prev.map((pkg) => (pkg.id === id ? updater(pkg) : pkg)));
  };

  const fieldKey = (pkgId: number, field: string) => `${pkgId}:${field}`;

  const getDraftValue = (pkg: ApiPackage, field: 'name' | 'price' | 'description' | 'features') => {
    const key = fieldKey(pkg.id, field);
    const draft = fieldDrafts()[key];
    if (draft !== undefined) return draft;

    if (field === 'price') return String(pkg.price ?? 0);
    if (field === 'features') return (pkg.features || []).join('\n');
    return String(pkg[field] ?? '');
  };

  const setDraftValue = (pkgId: number, field: string, value: string) => {
    const key = fieldKey(pkgId, field);
    setFieldDrafts((prev) => ({ ...prev, [key]: value }));
  };

  const isFieldEditing = (pkgId: number, field: string) => {
    const key = fieldKey(pkgId, field);
    return !!editingFields()[key];
  };

  const startFieldEditing = (pkg: ApiPackage, field: 'name' | 'price' | 'description' | 'features') => {
    const key = fieldKey(pkg.id, field);
    setDraftValue(pkg.id, field, getDraftValue(pkg, field));
    setEditingFields((prev) => ({ ...prev, [key]: true }));
  };

  const cancelFieldEditing = (pkg: ApiPackage, field: 'name' | 'price' | 'description' | 'features') => {
    const key = fieldKey(pkg.id, field);
    setDraftValue(pkg.id, field, getDraftValue(pkg, field));
    setEditingFields((prev) => ({ ...prev, [key]: false }));
  };

  const saveFieldEditing = async (pkg: ApiPackage, field: 'name' | 'price' | 'description' | 'features') => {
    const key = fieldKey(pkg.id, field);
    await savePackage(pkg, true);
    setEditingFields((prev) => ({ ...prev, [key]: false }));
    handleSave(`Field ${field} pada ${pkg.name} berhasil disimpan`);
  };

  const buildPackageFromDrafts = (pkg: ApiPackage): ApiPackage => {
    const name = getDraftValue(pkg, 'name').trim() || pkg.name;
    const rawPrice = getDraftValue(pkg, 'price').replace(/[^0-9]/g, '');
    const description = getDraftValue(pkg, 'description').trim();
    const features = getDraftValue(pkg, 'features').split('\n').map((x) => x.trim()).filter(Boolean);

    return {
      ...pkg,
      name,
      price: rawPrice ? parseInt(rawPrice) : 0,
      description: description || pkg.description,
      features,
    };
  };

  const savePackage = async (pkg: ApiPackage, silent = false) => {
    const token = authStore.getToken();
    const payloadPkg = buildPackageFromDrafts(pkg);
    try {
      const res = await fetch(`${API_BASE}/packages/${payloadPkg.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: payloadPkg.name,
          description: payloadPkg.description,
          price: payloadPkg.price,
          category: payloadPkg.category,
          images: payloadPkg.images,
          features: payloadPkg.features,
          isPublished: payloadPkg.isPublished,
        }),
      });
      const data = await res.json();
      if (data.success) {
        updatePackageLocal(payloadPkg.id, () => payloadPkg);
        setFieldDrafts((prev) => ({
          ...prev,
          [fieldKey(payloadPkg.id, 'name')]: payloadPkg.name,
          [fieldKey(payloadPkg.id, 'price')]: String(payloadPkg.price),
          [fieldKey(payloadPkg.id, 'description')]: payloadPkg.description,
          [fieldKey(payloadPkg.id, 'features')]: (payloadPkg.features || []).join('\n'),
        }));
        if (!silent) handleSave(`Package ${payloadPkg.name} berhasil disimpan`);
      } else {
        handleError(data.message || 'Gagal menyimpan package');
      }
    } catch (error) {
      handleError('Terjadi kesalahan koneksi saat menyimpan package');
    }
  };

  const openAddPackageModal = () => {
    setNewPackageName('Paket Baru');
    setNewPackageDescription('Deskripsi paket baru');
    setNewPackagePrice('0');
    setNewPackageFeatures('');
    setNewPackagePublished(true);
    setShowAddPackageModal(true);
  };

  const addPackage = async () => {
    setAddingPackage(true);
    const token = authStore.getToken();
    try {
      const res = await fetch(`${API_BASE}/packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newPackageName().trim() || 'Paket Baru',
          description: newPackageDescription().trim() || 'Deskripsi paket baru',
          price: parseInt(newPackagePrice().replace(/[^0-9]/g, '')) || 0,
          category: activeServicePricelist(),
          images: [],
          features: newPackageFeatures().split('\n').map((x) => x.trim()).filter(Boolean),
          isPublished: newPackagePublished(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        handleSave('Paket baru berhasil ditambahkan');
        setShowAddPackageModal(false);
        await loadPackages();
      } else {
        handleError(data.message || 'Gagal menambahkan paket');
      }
    } catch (error) {
      handleError('Terjadi kesalahan koneksi saat menambahkan paket');
    } finally {
      setAddingPackage(false);
    }
  };

  const openDeletePackageModal = (pkg: ApiPackage) => {
    setPackageToDelete(pkg);
    setShowDeletePackageModal(true);
  };

  const deletePackage = async () => {
    const pkg = packageToDelete();
    if (!pkg) return;
    const token = authStore.getToken();
    try {
      const res = await fetch(`${API_BASE}/packages/${pkg.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        handleSave(`Package ${pkg.name} berhasil dihapus`);
        setShowDeletePackageModal(false);
        setPackageToDelete(null);
        await loadPackages();
      } else {
        handleError(data.message || 'Gagal menghapus package');
      }
    } catch (error) {
      handleError('Terjadi kesalahan koneksi saat menghapus package');
    }
  };

  const uploadImageForPackage = async (file: File) => {
    const token = authStore.getToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload gagal: ${res.status}`);
    }

    return await res.json();
  };

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
    setTimeout(() => setSaveMessage(null), 5000); // Errors stay 5s before auto-dismissing
  };

  const aboutTextValue = (field: string, fallback: string) => {
    return contentStore.getField('about_page', field) || fallback;
  };

  const aboutImageValue = (field: string, fallback?: string) => {
    const value = contentStore.getField('about', field) || fallback || '';
    return resolveMediaUrl(value);
  };

  const handleAboutImageSave = async (field: string, label: string, value: string) => {
    contentStore.updateFieldLocal('about', field, value);
    // Reload the 'about' section to get fresh data from backend
    await contentStore.loadSection('about');
    handleSave(`${label} berhasil diupdate`);
  };

  return (
    <div class="min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <nav class="bg-[#464C43] text-white shadow-lg">
        <div class="container mx-auto px-4 md:px-6 py-4">
          <div class="flex items-center justify-between gap-4">
            {/* Logo & Page Title */}
            <div class="flex items-center gap-3 min-w-0">
              <img src="/LOGO/BIGGER WM NEW PUTIH.png" alt="Widymotret" class="h-10 flex-shrink-0 drop-shadow-lg" />
              <span class="text-xs md:text-sm text-white/70 border-l border-white/30 pl-3 truncate hidden md:block">
                {currentPage() === 'home' && 'Halaman Utama'}
                {currentPage() === 'pricelist' && 'Pricelist'}
                {currentPage() === 'portfolio' && 'Portfolio'}
                {currentPage() === 'about' && 'Halaman About'}
              </span>
            </div>

            {/* User Menu */}
            <div class="flex items-center gap-2 md:gap-4 ml-auto">
              <div class="text-right hidden sm:block">
                <p class="text-xs md:text-sm font-medium">{admin()?.username || 'Admin'}</p>
                <p class="text-xs text-white/70">Administrator</p>
              </div>
              
              {/* Avatar */}
              <div class="w-8 md:w-10 h-8 md:h-10 rounded-full bg-[#576250] flex items-center justify-center flex-shrink-0">
                <span class="text-sm md:text-lg font-bold">
                  {admin()?.username?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>

              {/* Logout Button */}
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
          <h1 class="text-3xl font-bold text-gray-800">
            Selamat Datang, {admin()?.username?.split(' ')[0] || 'Admin'}!
          </h1>
          <p class="text-gray-600 mt-2">
            Kelola konten website Widymotret Studio dari sini.
          </p>
        </div>

        {/* Success/Error Message - Toast Notification */}
        <Toast 
          message={saveMessage()?.text} 
          type={saveMessage()?.type}
          onClose={() => setSaveMessage(null)}
        />

      {/* Tab Navigation */}
        <div class="bg-white rounded-xl shadow-sm p-1 mb-8 flex gap-2 flex-wrap">
          <button
            onClick={() => setCurrentPage('home')}
            class={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentPage() === 'home'
                ? 'bg-[#576250] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AiFillHome size={20} />
            Halaman Utama
          </button>
          <button
            onClick={() => setCurrentPage('pricelist')}
            class={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentPage() === 'pricelist'
                ? 'bg-[#576250] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AiFillDollarCircle size={20} />
            Pricelist
          </button>
          <button
            onClick={() => setCurrentPage('portfolio')}
            class={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentPage() === 'portfolio'
                ? 'bg-[#576250] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AiFillCamera size={20} />
            Portfolio
          </button>
          <button
            onClick={() => setCurrentPage('about')}
            class={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentPage() === 'about'
                ? 'bg-[#576250] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AiFillBook size={20} />
            Halaman About
          </button>
        </div>

        {/* Content Management */}
        <div class="bg-white rounded-xl shadow-sm p-8">
          {/* HOME PAGE */}
          <Show when={currentPage() === 'home'}>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-8">Kelola Halaman Utama</h2>
              
              {/* Hero Section */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4"><FaSolidClapperboard class="inline mr-2" size={20} />Hero Section</h3>
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
                <h4 class="text-sm font-semibold text-gray-600 mt-6 mb-3">Hero Carousel Images (4 gambar)</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <For each={[
                    { path: '/home (1).png', label: 'Hero Slide 1' },
                    { path: '/home (2).jpg', label: 'Hero Slide 2' },
                    { path: '/home (3).jpg', label: 'Hero Slide 3' },
                    { path: '/home (4).jpg', label: 'Hero Slide 4' },
                  ]}>
                    {(img, idx) => (
                      <EditableImage
                        label={img.label}
                        value={contentStore.getField('hero', `carousel_${idx()}`) || img.path}
                        section="hero"
                        field={`carousel_${idx()}`}
                        aspectClass="aspect-[4/3]"
                        onSave={(v) => {
                          contentStore.updateFieldLocal('hero', `carousel_${idx()}`, v);
                          handleSave(`Hero slide ${idx() + 1} berhasil diupdate`);
                        }}
                        onError={handleError}
                      />
                    )}
                  </For>
                </div>
              </div>

              {/* Introduction Section */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4"><AiFillEdit class="inline mr-2" size={20} />Introduction Section</h3>
                <EditableText
                  label="Heading"
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
                  label="Description 1"
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
                  label="Description 2"
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

              {/* Services Section */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4"><RiGameSportsTargetFill class="inline mr-2" size={20} />Services Section</h3>
                <p class="text-sm text-gray-500 mb-4">Gambar service mengikuti data dari tab <strong>Pricelist</strong>. Edit gambar service di sana.</p>
                <EditableText
                  label="Title"
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
                  label="Subtitle"
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
                <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                  <For each={servicesData}>
                    {(s) => (
                      <div class="text-center">
                        <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img src={getServicePreviewImage(s.slug, s.image)} alt={s.title} class="w-full h-full object-cover" />
                        </div>
                        <p class="text-xs text-gray-500 mt-1">{s.title}</p>
                      </div>
                    )}
                  </For>
                </div>
              </div>

              {/* Portfolio Grid Preview */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4"><AiFillFileImage class="inline mr-2" size={20} />Portfolio Grid (4 gambar)</h3>
                <p class="text-sm text-gray-500 mb-4">4 foto dengan kategori yang tampil di homepage</p>
                <div class="space-y-6">
                  <For each={Array.from({length: 4}, (_, i) => i)}>
                    {(idx) => {
                      const defaultPortfolios = [
                        '/landscape/landscape (1).png',
                        '/landscape/landscape (2).png',
                        '/landscape/landscape (3).png',
                        '/landscape/landscape (4).png',
                      ];
                      const defaultCategories = [
                        'Portrait Photography',
                        'Event and Wedding Coverage',
                        'Editorial and Brand Shots',
                        'Image Retouching and Editing',
                      ];
                      return (
                        <div class="border border-gray-200 rounded-lg p-4">
                          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Image Column */}
                            <div>
                              <EditableImage
                                label={`Portfolio ${idx + 1} - Gambar`}
                                value={contentStore.getField('home', `portfolio_grid_${idx}`) || defaultPortfolios[idx]}
                                section="home"
                                field={`portfolio_grid_${idx}`}
                                aspectClass="aspect-video"
                                onSave={(v) => {
                                  console.log(`[AdminHome] Portfolio grid onSave: portfolio_grid_${idx} = ${v}`);
                                  contentStore.updateFieldLocal('home', `portfolio_grid_${idx}`, v);
                                  handleSave(`Portfolio ${idx + 1} gambar berhasil diupdate`);
                                }}
                                onError={handleError}
                              />
                            </div>
                            
                            {/* Text Info Column */}
                            <div class="md:col-span-2 space-y-3">
                              <EditableText
                                label={`Portfolio ${idx + 1} - Kategori`}
                                value={contentStore.getField('home', `portfolio_grid_category_${idx}`) || defaultCategories[idx]}
                                section="home"
                                field={`portfolio_grid_category_${idx}`}
                                multiline={false}
                                onSave={(v) => {
                                  console.log(`[AdminHome] Portfolio category onSave: portfolio_grid_category_${idx} = ${v}`);
                                  contentStore.updateFieldLocal('home', `portfolio_grid_category_${idx}`, v);
                                  handleSave(`Portfolio ${idx + 1} kategori berhasil diupdate`);
                                }}
                                onError={handleError}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>

              {/* Potret Unggulan (Featured Shots) - READ FROM STORE */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4"><RiWeatherSparkling2Fill class="inline mr-2" size={20} />Potret Unggulan (Featured Shots)</h3>
                <p class="text-sm text-gray-500 mb-4">Foto portrait yang ditampilkan di carousel. Bisa ditambah/hapus.</p>

                <EditableText
                  label="Judul Section"
                  value={contentStore.getField('featured', 'title')}
                  section="featured"
                  field="title"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('featured', 'title', value);
                    handleSave('Judul Potret Unggulan berhasil disimpan');
                  }}
                  onError={handleError}
                />

                <EditableText
                  label="Subtitle Section"
                  value={contentStore.getField('featured', 'subtitle')}
                  section="featured"
                  field="subtitle"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('featured', 'subtitle', value);
                    handleSave('Subtitle Potret Unggulan berhasil disimpan');
                  }}
                  onError={handleError}
                />

                <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <For each={Array.from({length: 5}, (_, i) => i)}>
                    {(idx) => {
                      const defaultPortraits = [
                        '/portrait/portrait (1).png',
                        '/portrait/portrait (2).png',
                        '/portrait/portrait (3).png',
                        '/portrait/portrait (4).png',
                        '/portrait/portrait (5).png',
                      ];
                      return (
                        <EditableImage
                          label={`Potret ${idx + 1}`}
                          value={contentStore.getField('featured', `portrait_${idx}`) || defaultPortraits[idx]}
                          section="featured"
                          field={`portrait_${idx}`}
                          aspectClass="aspect-[3/4]"
                          onSave={(v) => {
                            console.log(`[AdminHome] Featured onSave called: portrait_${idx} = ${v}`);
                            contentStore.updateFieldLocal('featured', `portrait_${idx}`, v);
                            handleSave(`Potret ${idx + 1} berhasil diupdate`);
                          }}
                          onError={handleError}
                        />
                      );
                    }}
                  </For>
                </div>
              </div>

              {/* Alur Booking Section */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4"><FaRegularCalendarAlt class="inline mr-2" size={20} />Alur Booking (6 Steps)</h3>
                <EditableText
                  label="Section Title"
                  value={contentStore.getField('booking', 'title')}
                  section="booking"
                  field="title"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('booking', 'title', value);
                    handleSave('Booking title berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Section Subtitle"
                  value={contentStore.getField('booking', 'subtitle')}
                  section="booking"
                  field="subtitle"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('booking', 'subtitle', value);
                    handleSave('Booking subtitle berhasil disimpan');
                  }}
                  onError={handleError}
                />
                
                <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <For each={[1, 2, 3, 4, 5, 6]}>
                    {(step) => (
                      <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 class="font-bold text-gray-800 mb-3 text-sm">Step {step}</h4>
                        <EditableText
                          label={`Step ${step} Title`}
                          value={contentStore.getField('booking', `step${step}_title`)}
                          section="booking"
                          field={`step${step}_title`}
                          multiline={false}
                          onSave={(value) => {
                            contentStore.updateFieldLocal('booking', `step${step}_title`, value);
                            handleSave(`Step ${step} title berhasil disimpan`);
                          }}
                          onError={handleError}
                        />
                        <EditableText
                          label={`Step ${step} Description`}
                          value={contentStore.getField('booking', `step${step}_description`)}
                          section="booking"
                          field={`step${step}_description`}
                          multiline={true}
                          onSave={(value) => {
                            contentStore.updateFieldLocal('booking', `step${step}_description`, value);
                            handleSave(`Step ${step} description berhasil disimpan`);
                          }}
                          onError={handleError}
                        />
                      </div>
                    )}
                  </For>
                </div>
              </div>

              {/* Testimonials Section */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4"><AiFillStar class="inline mr-2" size={20} />Testimoni</h3>
                <EditableText
                  label="Judul Bagian"
                  value={contentStore.getField('testimonials', 'title')}
                  section="testimonials"
                  field="title"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('testimonials', 'title', value);
                    handleSave('Testimoni title berhasil disimpan');
                  }}
                  onError={handleError}
                />
                
                <div class="mt-6 space-y-4">
                  <div class="flex items-center justify-between">
                    <TestimoniCounter />
                    <button
                      onClick={() => {
                        // Find first empty slot
                        for (let i = 1; i <= 7; i++) {
                          const quote = contentStore.getField('testimonials', `quote${i}`);
                          if (!quote) {
                            contentStore.updateFieldLocal('testimonials', `quote${i}`, 'Testimoni baru');
                            contentStore.updateFieldLocal('testimonials', `author${i}`, 'Nama');
                            handleSave(`Testimoni ${i} ditambahkan`);
                            return;
                          }
                        }
                        handleError('Maksimal 7 testimoni sudah tercapai');
                      }}
                      class="px-3 py-1.5 bg-[#576250] text-white rounded-md text-sm font-medium hover:bg-[#464C43]"
                    >
                      + Tambah Testimoni
                    </button>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <For each={[1, 2, 3, 4, 5, 6, 7]}>
                      {(idx) => {
                        const quote = () => contentStore.getField('testimonials', `quote${idx}`);
                        const canDelete = createMemo(() => {
                          let count = 0;
                          for (let i = 1; i <= 7; i++) {
                            if (contentStore.getField('testimonials', `quote${i}`)) count++;
                          }
                          return count > 3;
                        });

                        return (
                          <Show when={quote()}>
                            <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                              <div class="flex justify-between items-start mb-3">
                                <h4 class="font-bold text-gray-800 text-sm">Testimoni {idx}</h4>
                                <Show when={canDelete()}>
                                  <button
                                    onClick={() => {
                                      contentStore.updateFieldLocal('testimonials', `quote${idx}`, '');
                                      contentStore.updateFieldLocal('testimonials', `author${idx}`, '');
                                      handleSave(`Testimoni ${idx} dihapus`);
                                    }}
                                    class="text-red-500 hover:text-red-700 text-lg leading-none px-2"
                                    title="Hapus testimoni"
                                  >
                                    ×
                                  </button>
                                </Show>
                              </div>
                              <EditableText
                                label={`Kutipan ${idx}`}
                                value={quote()}
                                section="testimonials"
                                field={`quote${idx}`}
                                multiline={true}
                                onSave={(value) => {
                                  contentStore.updateFieldLocal('testimonials', `quote${idx}`, value);
                                  handleSave(`Kutipan ${idx} berhasil disimpan`);
                                }}
                                onError={handleError}
                              />
                              <EditableText
                                label={`Nama ${idx}`}
                                value={contentStore.getField('testimonials', `author${idx}`)}
                                section="testimonials"
                                field={`author${idx}`}
                                multiline={false}
                                onSave={(value) => {
                                  contentStore.updateFieldLocal('testimonials', `author${idx}`, value);
                                  handleSave(`Nama ${idx} berhasil disimpan`);
                                }}
                                onError={handleError}
                              />
                            </div>
                          </Show>
                        );
                      }}
                    </For>
                  </div>
                </div>
              </div>

              {/* Contact Info Section */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4"><FaSolidPhoneAlt class="inline mr-2" size={20} />Contact Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
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
              </div>

              {/* CTA Section */}
              <div>
                <h3 class="text-lg font-bold text-gray-800 mb-4"><BsRocketTakeoffFill class="inline mr-2" size={20} />Call To Action (CTA)</h3>
                <EditableText
                  label="CTA Heading"
                  value={contentStore.getField('home', 'cta_heading')}
                  section="home"
                  field="cta_heading"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('home', 'cta_heading', value);
                    handleSave('CTA heading berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="CTA Subheading"
                  value={contentStore.getField('home', 'cta_subheading')}
                  section="home"
                  field="cta_subheading"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('home', 'cta_subheading', value);
                    handleSave('CTA subheading berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="CTA Button Text"
                  value={contentStore.getField('home', 'cta_button')}
                  section="home"
                  field="cta_button"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('home', 'cta_button', value);
                    handleSave('CTA button text berhasil disimpan');
                  }}
                  onError={handleError}
                />
              </div>
            </div>
          </Show>

          {/* PRICELIST PAGE */}
          <Show when={currentPage() === 'pricelist'}>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-8"><AiFillDollarCircle class="inline mr-2" size={24} />Kelola Pricelist</h2>
              <p class="text-gray-600 mb-6">Edit paket dan harga untuk setiap jenis layanan fotografi.</p>

              {/* Service Type Tabs */}
              <div class="bg-gray-50 rounded-xl p-1 mb-8 flex gap-2 flex-wrap">
                <For each={servicesData}>
                  {(service) => (
                    <button
                      onClick={() => setActiveServicePricelist(service.slug)}
                      class={`px-6 py-2 rounded-lg font-medium transition-all ${
                        activeServicePricelist() === service.slug
                          ? 'bg-[#576250] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {service.title}
                    </button>
                  )}
                </For>
              </div>

              <Show when={servicesData.find(s => s.slug === activeServicePricelist())}>
                {(service) => (
                  <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-6">{service().title}</h3>

                    {/* Service Cover Image + Details */}
                    <div class="mb-8 pb-8 border-b-2 border-gray-200">
                      <h4 class="text-sm font-bold text-gray-800 mb-4"><FaSolidClipboardList class="inline mr-2" size={18} />Detail Layanan</h4>
                      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div class="md:col-span-1">
                          <EditableImage
                            label="Gambar Cover"
                            value={contentStore.getField('service', `${service().slug}_image`) || service().image}
                            section="service"
                            field={`${service().slug}_image`}
                            aspectClass="aspect-video"
                            onSave={(value) => {
                              contentStore.updateFieldLocal('service', `${service().slug}_image`, value);
                              handleSave('Gambar layanan berhasil diupdate');
                            }}
                            onError={handleError}
                          />
                        </div>
                        <div class="md:col-span-3">
                          <EditableText
                            label="Nama Layanan"
                            value={contentStore.getField('service', `${service().slug}_title`) || service().title}
                            section="service"
                            field={`${service().slug}_title`}
                            multiline={false}
                            onSave={(value) => {
                              contentStore.updateFieldLocal('service', `${service().slug}_title`, value);
                              handleSave('Nama layanan berhasil diupdate');
                            }}
                            onError={handleError}
                          />
                          <EditableText
                            label="Deskripsi Layanan"
                            value={contentStore.getField('service', `${service().slug}_description`) || service().description}
                            section="service"
                            field={`${service().slug}_description`}
                            multiline={true}
                            onSave={(value) => {
                              contentStore.updateFieldLocal('service', `${service().slug}_description`, value);
                              handleSave('Deskripsi layanan berhasil diupdate');
                            }}
                            onError={handleError}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Packages - Backend Driven */}
                    <h4 class="text-sm font-bold text-gray-800 mb-4"><FiPackage class="inline mr-2" size={18} />Paket Harga</h4>

                    <Show when={packagesLoading()}>
                      <div class="flex justify-center py-8">
                        <div class="animate-spin w-8 h-8 border-4 border-[#576250] border-t-transparent rounded-full"></div>
                      </div>
                    </Show>

                    <Show when={!packagesLoading()}>
                      <div class="space-y-4">
                        <For each={filteredPackages()} fallback={
                          <div class="p-5 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-500">
                            Belum ada package di kategori ini.
                          </div>
                        }>
                          {(pkg, idx) => (
                            <div class="p-5 bg-gray-50 rounded-lg border border-gray-200">
                              <div class="flex items-center justify-between mb-3">
                                <h5 class="font-bold text-gray-800 text-sm">Paket {idx() + 1}</h5>
                                <button
                                  onClick={() => openDeletePackageModal(pkg)}
                                  class="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition text-xs flex items-center gap-1"
                                >
                                  <FaSolidTrashAlt size={14} />
                                  Hapus
                                </button>
                              </div>

                              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label class="block text-sm font-semibold text-gray-700 mb-2">Nama Paket</label>
                                  <div class="editable-text-display-mode" classList={{ 'ring-2 ring-blue-500 border-blue-500 bg-white': isFieldEditing(pkg.id, 'name') }}>
                                    <div class="editable-text-content">
                                      <input
                                        value={getDraftValue(pkg, 'name')}
                                        onInput={(e) => setDraftValue(pkg.id, 'name', e.currentTarget.value)}
                                        disabled={!isFieldEditing(pkg.id, 'name')}
                                        class="w-full bg-transparent outline-none disabled:text-gray-700 disabled:cursor-not-allowed"
                                      />
                                    </div>
                                    <button class="editable-text-edit-btn" onClick={() => startFieldEditing(pkg, 'name')} title="Edit Nama Paket">
                                      <AiFillEdit />
                                    </button>
                                  </div>
                                  <Show when={isFieldEditing(pkg.id, 'name')}>
                                    <div class="flex gap-2 mt-2">
                                      <button onClick={() => saveFieldEditing(pkg, 'name')} class="px-3 py-1.5 bg-emerald-500 text-white rounded-md text-xs font-semibold hover:bg-emerald-600 transition">SIMPAN</button>
                                      <button onClick={() => cancelFieldEditing(pkg, 'name')} class="px-3 py-1.5 bg-slate-500 text-white rounded-md text-xs font-semibold hover:bg-slate-600 transition">BATAL</button>
                                    </div>
                                  </Show>
                                </div>

                                <div>
                                  <label class="block text-sm font-semibold text-gray-700 mb-2">Harga</label>
                                  <div class="editable-text-display-mode" classList={{ 'ring-2 ring-blue-500 border-blue-500 bg-white': isFieldEditing(pkg.id, 'price') }}>
                                    <div class="editable-text-content">
                                      <input
                                        value={getDraftValue(pkg, 'price')}
                                        onInput={(e) => setDraftValue(pkg.id, 'price', e.currentTarget.value)}
                                        disabled={!isFieldEditing(pkg.id, 'price')}
                                        class="w-full bg-transparent outline-none disabled:text-gray-700 disabled:cursor-not-allowed"
                                      />
                                    </div>
                                    <button class="editable-text-edit-btn" onClick={() => startFieldEditing(pkg, 'price')} title="Edit Harga">
                                      <AiFillEdit />
                                    </button>
                                  </div>
                                  <Show when={isFieldEditing(pkg.id, 'price')}>
                                    <div class="flex gap-2 mt-2">
                                      <button onClick={() => saveFieldEditing(pkg, 'price')} class="px-3 py-1.5 bg-emerald-500 text-white rounded-md text-xs font-semibold hover:bg-emerald-600 transition">SIMPAN</button>
                                      <button onClick={() => cancelFieldEditing(pkg, 'price')} class="px-3 py-1.5 bg-slate-500 text-white rounded-md text-xs font-semibold hover:bg-slate-600 transition">BATAL</button>
                                    </div>
                                  </Show>
                                </div>
                              </div>

                              <div class="mb-4">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                                <div class="editable-text-display-mode" classList={{ 'ring-2 ring-blue-500 border-blue-500 bg-white': isFieldEditing(pkg.id, 'description') }}>
                                  <div class="editable-text-content">
                                    <textarea
                                      value={getDraftValue(pkg, 'description')}
                                      onInput={(e) => setDraftValue(pkg.id, 'description', e.currentTarget.value)}
                                      disabled={!isFieldEditing(pkg.id, 'description')}
                                      rows="2"
                                      class="w-full bg-transparent outline-none resize-none disabled:text-gray-700 disabled:cursor-not-allowed"
                                    />
                                  </div>
                                  <button class="editable-text-edit-btn" onClick={() => startFieldEditing(pkg, 'description')} title="Edit Deskripsi">
                                    <AiFillEdit />
                                  </button>
                                </div>
                                <Show when={isFieldEditing(pkg.id, 'description')}>
                                  <div class="flex gap-2 mt-2">
                                    <button onClick={() => saveFieldEditing(pkg, 'description')} class="px-3 py-1.5 bg-emerald-500 text-white rounded-md text-xs font-semibold hover:bg-emerald-600 transition">SIMPAN</button>
                                    <button onClick={() => cancelFieldEditing(pkg, 'description')} class="px-3 py-1.5 bg-slate-500 text-white rounded-md text-xs font-semibold hover:bg-slate-600 transition">BATAL</button>
                                  </div>
                                </Show>
                              </div>

                              <div class="mb-4">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Fitur (Satu Baris Per Fitur)</label>
                                <div class="editable-text-display-mode" classList={{ 'ring-2 ring-blue-500 border-blue-500 bg-white': isFieldEditing(pkg.id, 'features') }}>
                                  <div class="editable-text-content">
                                    <textarea
                                      value={getDraftValue(pkg, 'features')}
                                      onInput={(e) => setDraftValue(pkg.id, 'features', e.currentTarget.value)}
                                      disabled={!isFieldEditing(pkg.id, 'features')}
                                      rows="4"
                                      class="w-full bg-transparent outline-none resize-none disabled:text-gray-700 disabled:cursor-not-allowed"
                                    />
                                  </div>
                                  <button class="editable-text-edit-btn" onClick={() => startFieldEditing(pkg, 'features')} title="Edit Fitur">
                                    <AiFillEdit />
                                  </button>
                                </div>
                                <Show when={isFieldEditing(pkg.id, 'features')}>
                                  <div class="flex gap-2 mt-2">
                                    <button onClick={() => saveFieldEditing(pkg, 'features')} class="px-3 py-1.5 bg-emerald-500 text-white rounded-md text-xs font-semibold hover:bg-emerald-600 transition">SIMPAN</button>
                                    <button onClick={() => cancelFieldEditing(pkg, 'features')} class="px-3 py-1.5 bg-slate-500 text-white rounded-md text-xs font-semibold hover:bg-slate-600 transition">BATAL</button>
                                  </div>
                                </Show>
                              </div>

                              <div class="mb-4">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Contoh Foto Package</label>
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-max">
                                  <For each={pkg.images || []}>
                                    {(img, imgIdx) => (
                                      <EditableImage
                                        label={`Foto #${imgIdx() + 1}`}
                                        value={img}
                                        section={`package-${pkg.id}`}
                                        field={`image-${imgIdx()}`}
                                        aspectClass="aspect-video"
                                        onUpload={uploadImageForPackage}
                                        onSave={(newValue) => {
                                          const newImages = [...(pkg.images || [])];
                                          newImages[imgIdx()] = newValue;
                                          updatePackageLocal(pkg.id, (p) => ({ ...p, images: newImages }));
                                          handleSave(`Gambar #${imgIdx() + 1} berhasil diupdate. Klik SIMPAN untuk menyimpan ke server.`);
                                        }}
                                        onDelete={() => {
                                          const newImages = (pkg.images || []).filter((_, i) => i !== imgIdx());
                                          updatePackageLocal(pkg.id, (p) => ({ ...p, images: newImages }));
                                          handleSave(`Gambar dihapus. Klik SIMPAN untuk menyimpan ke server.`);
                                        }}
                                        onError={handleError}
                                      />
                                    )}
                                  </For>

                                  {/* Add New Image Button */}
                                  <button
                                    class="aspect-video rounded-lg border-2 border-gray-300 flex flex-col items-center justify-center text-sm text-gray-600 hover:border-[#576250] hover:text-[#576250] hover:bg-gray-50 transition cursor-pointer font-medium"
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
                                            handleSave(`Gambar ditambahkan. Klik SIMPAN untuk menyimpan ke server.`);
                                          } else {
                                            handleError(response.message || 'Upload gagal');
                                          }
                                        } catch (err) {
                                          handleError(err instanceof Error ? err.message : 'Upload gagal');
                                        }
                                      });
                                      fileInput.click();
                                    }}
                                  >
                                    <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Tambah Foto</span>
                                  </button>
                                </div>
                              </div>

                              <div class="flex items-center gap-4">
                                <label class="inline-flex items-center gap-2 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={pkg.isPublished}
                                    onChange={(e) => updatePackageLocal(pkg.id, (prev) => ({ ...prev, isPublished: e.currentTarget.checked }))}
                                  />
                                  Published
                                </label>
                                <button
                                  onClick={() => savePackage(pkg)}
                                  class="px-4 py-2 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition text-sm font-medium"
                                >
                                  Simpan Paket
                                </button>
                              </div>
                            </div>
                          )}
                        </For>
                      </div>

                      <button
                        onClick={openAddPackageModal}
                        disabled={addingPackage()}
                        class="mt-4 px-5 py-2.5 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium text-sm disabled:opacity-60"
                      >
                        + Tambah Paket Baru
                      </button>
                    </Show>
                  </div>
                )}
              </Show>
            </div>
          </Show>

          {/* PORTFOLIO PAGE */}
          <Show when={currentPage() === 'portfolio'}>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-2"><AiFillCamera class="inline mr-2" size={24} />Manajemen Portfolio</h2>
              <p class="text-gray-600 mb-6">Kelola foto galeri per kategori. Unlimited, tapi disarankan max 20 per kategori.</p>

              {/* Tabs Kategori */}
              <div class="bg-gray-50 rounded-xl p-1 mb-8 flex gap-2 flex-wrap">
                <For each={portfolioCategories}>
                  {(cat) => (
                    <button
                      onClick={() => setActiveServicePortfolio(cat.slug)}
                      class={`px-6 py-2 rounded-lg font-medium transition-all ${
                        activeServicePortfolio() === cat.slug
                          ? 'bg-[#576250] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  )}
                </For>
              </div>

              {/* Portfolio Images for selected category */}
              {(() => {
                const images = () => getImagesByCategory(activeServicePortfolio());
                const cat = () => portfolioCategories.find(c => c.slug === activeServicePortfolio());
                return (
                  <Show when={cat()}>
                    {(category) => (
                      <div>
                        <div class="flex items-center justify-between mb-4">
                          <div>
                            <h3 class="text-lg font-bold text-gray-800">{category().name}</h3>
                            <p class="text-sm text-gray-500">{category().description}</p>
                          </div>
                          <span class={`text-sm font-medium px-3 py-1 rounded-full ${
                            images().length > 20 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {images().length} foto
                            {images().length > 20 && (
                              <svg class="inline ml-1 w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.981-1.742 2.981H4.42c-1.53 0-2.492-1.647-1.743-2.98l5.58-9.92zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-7a1 1 0 00-1 1v4a1 1 0 102 0V7a1 1 0 00-1-1z" clip-rule="evenodd" />
                              </svg>
                            )}
                          </span>
                        </div>

                        {images().length > 20 && (
                          <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                            <div class="flex items-start gap-2">
                              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.981-1.742 2.981H4.42c-1.53 0-2.492-1.647-1.743-2.98l5.58-9.92zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-7a1 1 0 00-1 1v4a1 1 0 102 0V7a1 1 0 00-1-1z" clip-rule="evenodd" />
                              </svg>
                              <span>Kategori ini memiliki lebih dari 20 foto. Pertimbangkan untuk mengurangi agar performa tetap optimal.</span>
                            </div>
                          </div>
                        )}

                        {/* Grid Foto */}
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <For each={images()}>
                            {(img, idx) => {
                              const fieldName = `${category().slug}_${img.id}`;
                              const storedValue = contentStore.getField('portfolio', fieldName);
                              const displayValue = storedValue || img.url;
                              return (
                                <EditableImage
                                  label={img.title}
                                  value={displayValue}
                                  section="portfolio"
                                  field={fieldName}
                                  aspectClass="aspect-square"
                                  onSave={(v) => {
                                    console.log(`[AdminHome] Portfolio onSave: ${fieldName} = ${v}`);
                                    contentStore.updateFieldLocal('portfolio', fieldName, v);
                                    handleSave(`${img.title} berhasil diupdate`);
                                  }}
                                  onError={handleError}
                                  onDelete={() => handleSave(`${img.title} akan dihapus`)}
                                />
                              );
                            }}
                          </For>
                        </div>

                        {/* Tambah Foto Baru */}
                        <button
                          onClick={() => handleSave(`Foto baru akan ditambah ke ${category().name}`)}
                          class="mt-6 w-full py-3 px-4 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Tambah Foto ke {category().name}
                        </button>
                      </div>
                    )}
                  </Show>
                );
              })()}
            </div>
          </Show>

          {/* ABOUT PAGE */}
          <Show when={currentPage() === 'about'}>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-2">Kelola Halaman Tentang</h2>
              <p class="text-gray-500 text-sm mb-8">Edit teks dan gambar pada halaman <code class="bg-gray-100 px-1 rounded">/about</code></p>

              {/* Hero Gallery - ADDABLE (max 3 photos with specific layout) */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-2"><AiFillFileImage class="inline mr-2" size={20} />Galeri Hero (bagian atas halaman)</h3>
                <p class="text-sm text-gray-500 mb-4">Layout: 1 foto portrait (kiri) + 2 foto landscape (kanan atas & bawah).</p>
                <div class="grid grid-cols-2 gap-2 max-w-2xl">
                  <div class="md:row-span-2">
                    <EditableImage
                      label="Foto Utama"
                      value={aboutImageValue('hero_main', '/portrait/portrait (1).png')}
                      section="about"
                      field="hero_main"
                      aspectClass="aspect-[3/4]"
                      onSave={(v) => handleAboutImageSave('hero_main', 'Foto utama', v)}
                      onError={handleError}
                    />
                  </div>
                  <div>
                    <EditableImage
                      label="Foto 2"
                      value={aboutImageValue('hero_right_top', '/landscape/landscape (2).png')}
                      section="about"
                      field="hero_right_top"
                      aspectClass="aspect-[3/2]"
                      onSave={(v) => handleAboutImageSave('hero_right_top', 'Foto 2', v)}
                      onError={handleError}
                    />
                  </div>
                  <div>
                    <EditableImage
                      label="Foto 3"
                      value={aboutImageValue('hero_right_bottom', '/landscape/landscape (3).png')}
                      section="about"
                      field="hero_right_bottom"
                      aspectClass="aspect-[3/2]"
                      onSave={(v) => handleAboutImageSave('hero_right_bottom', 'Foto 3', v)}
                      onError={handleError}
                    />
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Tagline</h3>
                <EditableText
                  label="Tagline (di bawah judul)"
                  value={aboutTextValue('tagline', aboutData.tagline)}
                  section="about_page"
                  field="tagline"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'tagline', value);
                    handleSave('Tagline berhasil disimpan');
                  }}
                  onError={handleError}
                />
              </div>

              {/* My Story */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4\">Cerita Saya</h3>
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div class="md:col-span-3">
                    <EditableText
                      label="Judul"
                      value={aboutTextValue('story_heading', aboutData.myStory.heading)}
                      section="about_page"
                      field="story_heading"
                      multiline={false}
                      onSave={(value) => {
                        contentStore.updateFieldLocal('about_page', 'story_heading', value);
                        handleSave('Judul berhasil disimpan');
                      }}
                      onError={handleError}
                    />
                    <For each={[1, 2, 3]}>
                      {(idx) => (
                        <EditableText
                          label={`Paragraf ${idx}`}
                          value={aboutTextValue(`story_paragraph${idx}`, aboutData.myStory.paragraphs[idx - 1] || '')}
                          section="about_page"
                          field={`story_paragraph${idx}`}
                          multiline={true}
                          onSave={(value) => {
                            contentStore.updateFieldLocal('about_page', `story_paragraph${idx}`, value);
                            handleSave(`Paragraf ${idx} berhasil disimpan`);
                          }}
                          onError={handleError}
                        />
                      )}
                    </For>
                  </div>
                  <div class="md:col-span-2">
                    <h4 class="text-sm font-semibold text-gray-600 mb-2">Galeri (2 Foto)</h4>
                    <div class="grid grid-cols-2 gap-4 max-w-[520px]">
                      <EditableImage
                        label="Foto 1"
                        value={aboutImageValue('story_img1', '/portrait/portrait (2).png')}
                        section="about"
                        field="story_img1"
                        aspectClass="aspect-[3/4]"
                        onSave={(v) => handleAboutImageSave('story_img1', 'Foto 1', v)}
                        onError={handleError}
                      />
                      <EditableImage
                        label="Foto 2"
                        value={aboutImageValue('story_img2', '/portrait/portrait (3).png')}
                        section="about"
                        field="story_img2"
                        aspectClass="aspect-[3/4]"
                        onSave={(v) => handleAboutImageSave('story_img2', 'Foto 2', v)}
                        onError={handleError}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Philosophy Quote */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Filosofi</h3>
                <EditableText
                  label="Kutipan"
                  value={aboutTextValue('philosophy_quote', aboutData.philosophyQuote)}
                  section="about_page"
                  field="philosophy_quote"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'philosophy_quote', value);
                    handleSave('Kuipan filosofi berhasil disimpan');
                  }}
                  onError={handleError}
                />
              </div>

              {/* Behind the Lens */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Di Balik Lensa</h3>
                <EditableText
                  label="Judul"
                  value={aboutTextValue('behind_lens_heading', aboutData.behindTheLens.heading)}
                  section="about_page"
                  field="behind_lens_heading"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'behind_lens_heading', value);
                    handleSave('Judul berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Tagline"
                  value={aboutTextValue('behind_lens_tagline', aboutData.behindTheLens.tagline)}
                  section="about_page"
                  field="behind_lens_tagline"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'behind_lens_tagline', value);
                    handleSave('Tagline berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Deskripsi"
                  value={aboutTextValue('behind_lens_description', aboutData.behindTheLens.description)}
                  section="about_page"
                  field="behind_lens_description"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'behind_lens_description', value);
                    handleSave('Deskripsi berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <p class="text-sm text-gray-500 mb-4">Layout: 3 kolom (Kiri: 3 landscape | Tengah: 1 portrait | Kanan: 3 landscape)</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
                  {/* Left Column - 3 Landscape Photos */}
                  <div class="flex flex-col gap-4">
                    <h4 class="text-xs font-semibold text-gray-500 uppercase">Kolom Kiri (Landscape)</h4>
                    <For each={[
                      { path: '/landscape/landscape (1).png', label: '1', field: 'btl_left1' },
                      { path: '/landscape/landscape (2).png', label: '2', field: 'btl_left2' },
                      { path: '/landscape/landscape (3).png', label: '3', field: 'btl_left3' },
                    ]}>
                      {(img) => (
                        <EditableImage
                          label={`Foto ${img.label}`}
                          value={aboutImageValue(img.field)}
                          section="about"
                          field={img.field}
                          aspectClass="aspect-[3/2]"
                          onSave={(v) => handleAboutImageSave(img.field, `Foto ${img.label}`, v)}
                          onError={handleError}
                        />
                      )}
                    </For>
                  </div>

                  {/* Center Column - 1 Portrait Photo */}
                  <div class="flex flex-col gap-4">
                    <h4 class="text-xs font-semibold text-gray-500 uppercase">Kolom Tengah (Portrait)</h4>
                    <EditableImage
                      label="Foto 4 (Portrait)"
                      value={aboutImageValue('btl_center')}
                      section="about"
                      field="btl_center"
                      aspectClass="aspect-[3/4]"
                      onSave={(v) => handleAboutImageSave('btl_center', 'Foto 4 (Portrait)', v)}
                      onError={handleError}
                    />
                  </div>

                  {/* Right Column - 3 Landscape Photos */}
                  <div class="flex flex-col gap-4">
                    <h4 class="text-xs font-semibold text-gray-500 uppercase">Kolom Kanan (Landscape)</h4>
                    <For each={[
                      { path: '/landscape/landscape (4).png', label: '5', field: 'btl_right1' },
                      { path: '/portrait/portrait (3).png', label: '6', field: 'btl_right2' },
                      { path: '/portrait/portrait (4).png', label: '7', field: 'btl_right3' },
                    ]}>
                      {(img) => (
                        <EditableImage
                          label={`Foto ${img.label}`}
                          value={aboutImageValue(img.field)}
                          section="about"
                          field={img.field}
                          aspectClass="aspect-[3/2]"
                          onSave={(v) => handleAboutImageSave(img.field, `Foto ${img.label}`, v)}
                          onError={handleError}
                        />
                      )}
                    </For>
                  </div>
                </div>
              </div>

              {/* Team */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Tim Kami</h3>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <EditableImage
                      label="Foto Tim"
                      value={aboutImageValue('team_photo')}
                      section="about"
                      field="team_photo"
                      aspectClass="aspect-video"
                      onSave={(v) => handleAboutImageSave('team_photo', 'Foto tim', v)}
                      onError={handleError}
                    />
                  </div>
                  <div class="md:col-span-3">
                    <EditableText
                      label="Judul"
                      value={aboutTextValue('team_heading', 'Our Team')}
                      section="about_page"
                      field="team_heading"
                      multiline={false}
                      onSave={(value) => {
                        contentStore.updateFieldLocal('about_page', 'team_heading', value);
                        handleSave('Judul berhasil disimpan');
                      }}
                      onError={handleError}
                    />
                    <EditableText
                      label="Deskripsi"
                      value={aboutTextValue('team_description', aboutData.teamDescription)}
                      section="about_page"
                      field="team_description"
                      multiline={true}
                      onSave={(value) => {
                        contentStore.updateFieldLocal('about_page', 'team_description', value);
                        handleSave('Deskripsi berhasil disimpan');
                      }}
                      onError={handleError}
                    />
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div>
                <h3 class="text-lg font-bold text-gray-800 mb-4">Call to Action</h3>
                <EditableText
                  label="Judul"
                  value={aboutTextValue('cta_heading', aboutData.cta.heading)}
                  section="about_page"
                  field="cta_heading"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'cta_heading', value);
                    handleSave('Judul berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Deskripsi"
                  value={aboutTextValue('cta_subheading', aboutData.cta.subheading)}
                  section="about_page"
                  field="cta_subheading"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'cta_subheading', value);
                    handleSave('Deskripsi berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Teks Tombol"
                  value={aboutTextValue('cta_button', aboutData.cta.buttonText)}
                  section="about_page"
                  field="cta_button"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'cta_button', value);
                    handleSave('Teks tombol berhasil disimpan');
                  }}
                  onError={handleError}
                />
              </div>
            </div>
          </Show>

          {/* Info Note */}
          <div class="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p class="text-sm text-blue-800">
              <FaSolidLightbulb class="inline mr-2 text-blue-600" size={16} />
              <strong>Tips:</strong> Klik pensil untuk edit teks. Hover gambar untuk edit/hapus/upload file lokal.
            </p>
          </div>
        </div>
      </main>

      {/* Add Package Modal */}
      <Show when={showAddPackageModal()}>
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
          onClick={() => setShowAddPackageModal(false)}
        >
          <div
            class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-fadeInScale"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="flex justify-end mb-4">
              <button
                onClick={() => setShowAddPackageModal(false)}
                class="text-gray-400 hover:text-gray-600 transition"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="text-center mb-6">
              <h3 class="text-2xl font-bold text-[#464C43] mb-2">Tambah Paket Baru</h3>
              <p class="text-gray-600 text-sm">Kategori: {activeServicePricelist()}</p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Nama Paket</label>
                <input
                  value={newPackageName()}
                  onInput={(e) => setNewPackageName(e.currentTarget.value)}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Harga</label>
                <input
                  value={newPackagePrice()}
                  onInput={(e) => setNewPackagePrice(e.currentTarget.value)}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={newPackageDescription()}
                  onInput={(e) => setNewPackageDescription(e.currentTarget.value)}
                  rows="3"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">Fitur (Satu Baris Per Fitur)</label>
                <textarea
                  value={newPackageFeatures()}
                  onInput={(e) => setNewPackageFeatures(e.currentTarget.value)}
                  rows="4"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <label class="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={newPackagePublished()}
                  onChange={(e) => setNewPackagePublished(e.currentTarget.checked)}
                />
                Published
              </label>
            </div>

            <div class="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddPackageModal(false)}
                class="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Batal
              </button>
              <button
                onClick={addPackage}
                disabled={addingPackage()}
                class="flex-1 py-3 px-4 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium disabled:opacity-60"
              >
                {addingPackage() ? 'Menambahkan...' : 'Tambah Paket'}
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Delete Package Modal */}
      <Show when={showDeletePackageModal()}>
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
          onClick={() => setShowDeletePackageModal(false)}
        >
          <div
            class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeInScale"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="text-center mb-6">
              <h3 class="text-2xl font-bold text-[#464C43] mb-2">Hapus Paket?</h3>
              <p class="text-gray-600">
                Yakin ingin menghapus paket <span class="font-semibold">{packageToDelete()?.name}</span>?
              </p>
            </div>

            <div class="flex gap-3">
              <button
                onClick={() => {
                  setShowDeletePackageModal(false);
                  setPackageToDelete(null);
                }}
                class="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Batal
              </button>
              <button
                onClick={deletePackage}
                class="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Footer */}
      <footer class="bg-white border-t mt-auto py-4 px-6">
        <div class="container mx-auto text-center text-gray-500 text-sm">
          <p>© 2026 Widymotret Studio Admin Panel</p>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <ScrollToTop showThreshold={300} />
    </div>
  );
};

export default AdminHome;
