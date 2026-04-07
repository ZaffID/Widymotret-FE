import { Component, createSignal, onMount, onCleanup, Show, For, createMemo } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../../stores/authStore';
import { contentStore } from '../../stores/contentStore';
import { EditableText } from '../../components/admin/EditableText';
import { EditableImage } from '../../components/admin/EditableImage';
import Toast from '../../components/Toast';
import ScrollToTop from '../../components/ScrollToTop';
import { servicesData } from '../../data/services';
import { aboutData } from '../../data/about';
import { getImagesByCategory } from '../../data/portfolio';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { updateContent } from '../../services/contentApi';

// API Base URL - same as contentApi
const API_BASE = `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://widymotret-be-production-00a0.up.railway.app'}/api`;

interface ApiPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  features: string[];
  isPublished: boolean;
  whatsappLinkType?: string;
  customWhatsappUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  tagExample: string;
  examplePhotoUrl: string | null;
}

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
import { FaSolidTrashAlt, FaSolidEdit } from 'solid-icons/fa';
import { FaSolidLightbulb } from 'solid-icons/fa';
import { FaRegularCalendarAlt } from 'solid-icons/fa';
import { AiFillStar } from 'solid-icons/ai';
import { FaSolidPhoneAlt } from 'solid-icons/fa';
import { BsRocketTakeoffFill } from 'solid-icons/bs';

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
        <span class="text-orange-600 ml-2">Warning: Max approached</span>
      </Show>
    </p>
  );
};

const AdminHome: Component = () => {
  const navigate = useNavigate();
  const admin = () => authStore.getAdmin();
  const [currentPage, setCurrentPage] = createSignal<'home' | 'services' | 'pricelist' | 'portfolio-categories' | 'portfolio' | 'about' | 'footer'>('home');
  const [activeServicePricelist, setActiveServicePricelist] = createSignal<string>('studio');
  const [activeServicePortfolio, setActiveServicePortfolio] = createSignal<string>('portrait');
  const [saveMessage, setSaveMessage] = createSignal<{type: 'success' | 'error'; text: string} | null>(null);
  const [showConfirmStatModal, setShowConfirmStatModal] = createSignal(false);
  const [pendingStatEdit, setPendingStatEdit] = createSignal<{field: string; value: string} | null>(null);
  const [isEditingTotalPhotos, setIsEditingTotalPhotos] = createSignal(false);
  const [isEditingCategories, setIsEditingCategories] = createSignal(false);
  const [editTotalPhotosValue, setEditTotalPhotosValue] = createSignal('');
  const [editCategoriesValue, setEditCategoriesValue] = createSignal('');
  const [showRefreshConfirmModal, setShowRefreshConfirmModal] = createSignal(false);
  const [packages, setPackages] = createSignal<ApiPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = createSignal(false);
  const [unsavedPackageIds, setUnsavedPackageIds] = createSignal<Set<number>>(new Set());
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

  // Services Management
  const [showAddServiceModal, setShowAddServiceModal] = createSignal(false);
  const [isEditingService, setIsEditingService] = createSignal(false);
  const [editingServiceSlug, setEditingServiceSlug] = createSignal<string | null>(null);
  const [newServiceName, setNewServiceName] = createSignal('Layanan Baru');
  const [newServiceSlug, setNewServiceSlug] = createSignal('layanan-baru');
  const [newServiceDescription, setNewServiceDescription] = createSignal('Deskripsi layanan');
  const [newServiceImage, setNewServiceImage] = createSignal('/photography.png');
  const [uploadingServiceImage, setUploadingServiceImage] = createSignal(false);
  const [serviceImageUploaded, setServiceImageUploaded] = createSignal(false);
  const [allServices, setAllServices] = createSignal<any[]>([]);

  // Portfolio Categories Management
  const [portfolioCategoriesData, setPortfolioCategoriesData] = createSignal<PortfolioCategory[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = createSignal(false);
  const [isEditingCategory, setIsEditingCategory] = createSignal(false);
  const [editingCategoryId, setEditingCategoryId] = createSignal<number | null>(null);
  const [newCategoryName, setNewCategoryName] = createSignal('Kategori Baru');
  const [newCategorySlug, setNewCategorySlug] = createSignal('kategori-baru');
  const [newCategoryDescription, setNewCategoryDescription] = createSignal('Deskripsi kategori');
  const [newCategoryTagExample, setNewCategoryTagExample] = createSignal('Category #1');
  const [newCategoryExamplePhoto, setNewCategoryExamplePhoto] = createSignal('');
  const [uploadingCategoryPhoto, setUploadingCategoryPhoto] = createSignal(false);

  onMount(async () => {
    // Load all content on component mount
    console.log('[AdminHome.onMount] Starting load...');
    await contentStore.loadAll();
    console.log('[AdminHome.onMount] contentStore.loadAll() complete');
    await loadPackages();
    console.log('[AdminHome.onMount] loadPackages() complete');
    await loadPortfolioCategories();
    console.log('[AdminHome.onMount] loadPortfolioCategories() complete');
    // Load services after packages are loaded
    loadAllServices();
    console.log('[AdminHome.onMount] loadAllServices() complete');
    
    // Reset to home tab and scroll to top on page load/refresh
    setCurrentPage('home');
    window.scrollTo(0, 0);
  });
  
  // Add beforeunload listener to warn about unsaved packages
  onMount(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedPackageIds().size > 0) {
        e.preventDefault();
        e.returnValue = 'Ada paket foto yang belum disimpan. Klik SIMPAN PAKET terlebih dahulu.';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup listener on unmount
    onCleanup(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    });
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
        console.log('[loadPackages] FULL Raw API response (first package):', JSON.stringify(data.data?.[0], null, 2));
        
        // Build service slug to category map for image restoration
        const serviceMap = new Map(allServices().map(s => [s.slug, s]));
        
        const hydrated = (data.data || []).map((pkg: ApiPackage, idx: number) => {
          // Try to find service for this package category
          const categoryService = allServices().find(s => s.slug === pkg.category?.toLowerCase());
          
          let images = Array.isArray(pkg.images) && pkg.images.length > 0
            ? pkg.images
            : getTemplateImagesByCategory(pkg.category, idx);
          
          // Try to restore images from contentStore (saved by EditableImage)
          if (categoryService) {
            const restoredImages: string[] = [];
            for (let i = 0; i < (images?.length || 4); i++) {
              const field = `${categoryService.slug}_pkg_image_${i}`;
              const savedImage = contentStore.getField('service', field);
              restoredImages.push(savedImage || images[i] || getTemplateImagesByCategory(pkg.category, i)[i]);
            }
            images = restoredImages;
            console.log(`[loadPackages] Restored ${restoredImages.length} images for category "${pkg.category}"`);
          }
          
          const result = { ...pkg, images };
          
          if (idx === 0) {
            console.log('[loadPackages] First package after loading:', JSON.stringify(result, null, 2));
            console.log('[loadPackages] First package whatsappLinkType:', result.whatsappLinkType);
            console.log('[loadPackages] First package customWhatsappUrl:', result.customWhatsappUrl);
            console.log('[loadPackages] All fields in first package:', Object.keys(result));
          }
          return result;
        });
        setPackages(hydrated);
        console.log('[loadPackages] Packages loaded successfully, count:', hydrated.length);
      }
    } catch (error) {
      handleError('Gagal memuat data package dari backend');
      console.error('[loadPackages] Error:', error);
    } finally {
      setPackagesLoading(false);
    }
  };

  const filteredPackages = createMemo(() => {
    const category = activeServicePricelist().toLowerCase();
    return packages().filter((pkg) => pkg.category?.toLowerCase() === category);
  });

  // Portfolio Categories Functions
  const loadPortfolioCategories = async () => {
    console.log('[loadPortfolioCategories] === START ===');
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const url = `${API_BASE}/portfolio-categories`;
      console.log('[loadPortfolioCategories] API_BASE:', API_BASE);
      console.log('[loadPortfolioCategories] Full URL:', url);
      console.log('[loadPortfolioCategories] Starting fetch...');
      
      const res = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      const duration = Date.now() - startTime;
      console.log(`[loadPortfolioCategories] Response received in ${duration}ms`);
      console.log('[loadPortfolioCategories] Response status:', res.status);
      console.log('[loadPortfolioCategories] Response headers:', {
        'content-type': res.headers.get('content-type'),
        'content-length': res.headers.get('content-length'),
      });
      
      if (!res.ok) {
        console.warn(`[loadPortfolioCategories] HTTP ${res.status} - attempting to read body`);
      }
      
      const text = await res.text();
      console.log('[loadPortfolioCategories] Raw response text:', text.substring(0, 500));
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('[loadPortfolioCategories] JSON parse error:', e);
        console.error('[loadPortfolioCategories] Response was:', text);
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }
      
      console.log('[loadPortfolioCategories] Parsed data:', data);
      console.log('[loadPortfolioCategories] data.success:', data?.success);
      console.log('[loadPortfolioCategories] data.data:', data?.data);
      
      if (data?.success && Array.isArray(data.data)) {
        console.log('[loadPortfolioCategories] Setting categories, count:', data.data.length);
        // Sort by ID ascending so new categories appear at the end
        const sorted = [...data.data].sort((a, b) => (a.id || 0) - (b.id || 0));
        setPortfolioCategoriesData(sorted);
        console.log('[loadPortfolioCategories] === SUCCESS === Categories loaded:', sorted.length);
      } else if (data?.data && Array.isArray(data.data)) {
        // Fallback: data might be in data.data directly
        console.log('[loadPortfolioCategories] Fields present - success:', !!data.success, 'isArray:', Array.isArray(data.data));
        const sorted = [...data.data].sort((a, b) => (a.id || 0) - (b.id || 0));
        setPortfolioCategoriesData(sorted);
        console.log('[loadPortfolioCategories] === SUCCESS (fallback) === Categories loaded:', sorted.length);
      } else {
        console.warn('[loadPortfolioCategories] Unexpected response structure');
        console.warn('[loadPortfolioCategories] Full response:', JSON.stringify(data));
        setPortfolioCategoriesData([]);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      console.error(`[loadPortfolioCategories] === ERROR === (after ${duration}ms)`);
      console.error('[loadPortfolioCategories] Error name:', (error as any)?.name);
      console.error('[loadPortfolioCategories] Error message:', error instanceof Error ? error.message : String(error));
      console.error('[loadPortfolioCategories] Full error:', error);
      
      // Set empty array on error
      setPortfolioCategoriesData([]);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const savePortfolioCategory = async () => {
    const token = authStore.getToken();
    if (!token) {
      handleError('Token tidak ditemukan');
      return;
    }

    // Validate slug: lowercase, hyphens, and alphanumeric only
    const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    const newSlug = newCategorySlug().trim().toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
    if (!slugRegex.test(newSlug)) {
      handleError('Slug hanya boleh huruf kecil, angka, dan tanda hubung (-). Spasi tidak diperbolehkan.');
      return;
    }
    setNewCategorySlug(newSlug);

    // Validate tag format: must be 'Name #X' where X is literal letter X (placeholder for number)
    const tagRegex = /#X$/i;
    const rawTag = newCategoryTagExample().trim();
    if (!tagRegex.test(rawTag)) {
      handleError('Format tag salah. Harus berakhir dengan #X (contoh: Wedding #X, Portrait #X)');
      return;
    }
    // Normalize to uppercase X before saving
    const normalizedTag = rawTag.replace(/#x$/i, '#X');
    console.log(`[savePortfolioCategory] Tag normalized: "${rawTag}" -> "${normalizedTag}"`);

    // Warn if changing slug and existing category has photos
    if (isEditingCategory()) {
      const category = portfolioCategoriesData().find(c => c.id === editingCategoryId());
      if (category && category.slug !== newSlug) {
        const allFields = contentStore.getSectionFields('portfolio');
        const photosExist = allFields.some(f => f.field.startsWith(`${category.slug}_`) && f.field !== `${category.slug}_categories`);
        if (photosExist) {
          handleError('Slug tidak boleh diubah karena sudah ada foto dengan slug lama. Ganti nama kategori saja, atau hapus semua foto terlebih dahulu.');
          return;
        }
      }
    }

    try {
      const payload = {
        name: newCategoryName(),
        slug: newSlug,
        description: newCategoryDescription(),
        tagExample: normalizedTag,
        examplePhotoUrl: newCategoryExamplePhoto(),
      };

      const url = isEditingCategory()
        ? `${API_BASE}/portfolio-categories/${editingCategoryId()}`
        : `${API_BASE}/portfolio-categories`;

      const method = isEditingCategory() ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        handleSave(isEditingCategory() ? 'Kategori berhasil diperbarui' : 'Kategori berhasil dibuat');
        await loadPortfolioCategories();
        
        // Refresh contentStore portfolio section to update main portfolio page
        await contentStore.loadSection('portfolio');
        console.log('[savePortfolioCategory] Portfolio section reloaded');
        
        resetCategoryModal();
      } else {
        handleError(data.message || 'Gagal menyimpan kategori');
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Gagal menyimpan kategori');
      console.error('[savePortfolioCategory] Error:', error);
    }
  };

  const deletePortfolioCategory = async (id: number) => {
    const token = authStore.getToken();
    if (!token) {
      handleError('Token tidak ditemukan');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/portfolio-categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        handleSave('Kategori berhasil dihapus');
        await loadPortfolioCategories();
      } else {
        handleError(data.message || 'Gagal menghapus kategori');
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Gagal menghapus kategori');
      console.error('[deletePortfolioCategory] Error:', error);
    }
  };

  const resetCategoryModal = () => {
    setShowAddCategoryModal(false);
    setIsEditingCategory(false);
    setEditingCategoryId(null);
    setNewCategoryName('Kategori Baru');
    setNewCategorySlug('kategori-baru');
    setNewCategoryDescription('Deskripsi kategori');
    setNewCategoryTagExample('Category #1');
    setNewCategoryExamplePhoto('');
  };

  const openEditCategoryModal = (category: PortfolioCategory) => {
    setIsEditingCategory(true);
    setEditingCategoryId(category.id);
    setNewCategoryName(category.name);
    setNewCategorySlug(category.slug);
    setNewCategoryDescription(category.description);
    setNewCategoryTagExample(category.tagExample);
    setNewCategoryExamplePhoto(category.examplePhotoUrl || '');
    setShowAddCategoryModal(true);
  };

  const uploadCategoryPhoto = async (file: File) => {
    setUploadingCategoryPhoto(true);
    try {
      const token = authStore.getToken();
      if (!token) {
        handleError('Token tidak ditemukan - silakan login ulang');
        setUploadingCategoryPhoto(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setNewCategoryExamplePhoto(data.data.url);
        handleSave('Foto berhasil diupload');
      } else {
        handleError(data.message ||'Upload gagal');
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Upload gagal');
    } finally {
      setUploadingCategoryPhoto(false);
    }
  };

  // Load all unique service categories
  const loadAllServices = () => {
    console.log('[loadAllServices] === START ===');
    
    // Start with hardcoded services
    const servicesSet = new Map<string, any>();
    
    // Add hardcoded services
    servicesData.forEach(service => {
      const storedTitle = contentStore.getField('service', `${service.slug}_title`);
      const storedDesc = contentStore.getField('service', `${service.slug}_description`);
      const storedImage = contentStore.getField('service', `${service.slug}_image`);
      
      console.log(`[loadAllServices] Hardcoded service "${service.slug}":`, {
        title: storedTitle || service.title,
        desc: storedDesc || service.description,
        image: storedImage || service.image,
      });
      
      servicesSet.set(service.slug, {
        slug: service.slug,
        title: storedTitle || service.title,
        description: storedDesc || service.description,
        image: storedImage || service.image,
        isCustom: false
      });
    });

    // Add categories from packages that aren't in hardcoded list
    const packageCategories = [...new Set(packages().map(pkg => pkg.category?.toLowerCase()).filter(Boolean))];
    packageCategories.forEach(category => {
      if (!servicesSet.has(category)) {
        const storedTitle = contentStore.getField('service', `${category}_title`);
        const storedDesc = contentStore.getField('service', `${category}_description`);
        const storedImage = contentStore.getField('service', `${category}_image`);
        
        // Skip if title is explicitly deleted (empty)
        if (!storedTitle || storedTitle.trim() === '') {
          console.log(`[loadAllServices] Skipping category "${category}" - title is empty (deleted)`);
          return;
        }
        
        console.log(`[loadAllServices] Custom service from packages "${category}":`, {
          title: storedTitle,
          desc: storedDesc,
          image: storedImage,
        });
        
        servicesSet.set(category, {
          slug: category,
          title: storedTitle,
          description: storedDesc || 'Layanan fotografi',
          image: storedImage || '/photography.png',
          isCustom: true
        });
      }
    });

    // Add custom services created by user (any service with _title field)
    const allServiceFields = contentStore.getSectionFields('service');
    console.log('[loadAllServices] All service fields from store:', allServiceFields);
    
    const titleFields = allServiceFields.filter(f => f.field.endsWith('_title') && f.value.trim() !== '');
    console.log('[loadAllServices] Title fields found:', titleFields);
    
    titleFields.forEach(titleField => {
      const slug = titleField.field.replace('_title', '');
      
      // Skip if already in hardcoded or package categories
      if (!servicesSet.has(slug)) {
        const storedTitle = titleField.value;
        const storedDesc = contentStore.getField('service', `${slug}_description`);
        const storedImage = contentStore.getField('service', `${slug}_image`);
        
        console.log(`[loadAllServices] User-created service "${slug}":`, {
          title: storedTitle,
          desc: storedDesc,
          image: storedImage,
        });
        
        servicesSet.set(slug, {
          slug,
          title: storedTitle,
          description: storedDesc || 'Layanan fotografi',
          image: storedImage || '/photography.png',
          isCustom: true
        });
      }
    });

    const finalServices = Array.from(servicesSet.values());
    console.log('[loadAllServices] Final services count:', finalServices.length);
    console.log('[loadAllServices] Final services:', finalServices);
    setAllServices(finalServices);
  };

  // Initialize active service when allServices loads
  createMemo(() => {
    const services = allServices();
    if (services.length > 0 && activeServicePricelist()) {
      // Check if current selection still exists
      if (!services.find(s => s.slug === activeServicePricelist())) {
        setActiveServicePricelist(services[0].slug);
      }
    } else if (services.length > 0) {
      setActiveServicePricelist(services[0].slug);
    }
  });

  const getServicePreviewImage = (slug: string, fallback: string) => {
    const category = slug.toLowerCase();
    const pkg = packages().find((p) => p.category?.toLowerCase() === category && (p.images || []).length > 0);
    const fromPackages = pkg?.images?.[0];
    return resolveMediaUrl(fromPackages || fallback);
  };

  const unsavedPackageDetails = createMemo(() => {
    const pendingIds = unsavedPackageIds();
    const allPkgs = packages();
    const serviceTitleMap = new Map(allServices().map((s) => [s.slug.toLowerCase(), s.title]));

    return allPkgs
      .filter((pkg) => pendingIds.has(pkg.id))
      .map((pkg) => {
        const slug = (pkg.category || '').toLowerCase();
        const serviceTitle = serviceTitleMap.get(slug) || (slug ? `${slug.charAt(0).toUpperCase()}${slug.slice(1)}` : 'Tidak diketahui');
        return {
          id: pkg.id,
          packageName: pkg.name || `Paket #${pkg.id}`,
          serviceTitle,
        };
      });
  });

  const updatePackageLocal = (id: number, updater: (pkg: ApiPackage) => ApiPackage) => {
    setPackages((prev) => prev.map((pkg) => (pkg.id === id ? updater(pkg) : pkg)));
    // Track this package as unsaved
    setUnsavedPackageIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
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
      whatsappLinkType: (pkg as any).whatsappLinkType,
      customWhatsappUrl: (pkg as any).customWhatsappUrl,
    };
  };

  const savePackage = async (pkg: ApiPackage, silent = false) => {
    const token = authStore.getToken();
    const payloadPkg = buildPackageFromDrafts(pkg);
    const payload = {
      name: payloadPkg.name,
      description: payloadPkg.description,
      price: payloadPkg.price,
      category: payloadPkg.category,
      images: payloadPkg.images,
      features: payloadPkg.features,
      isPublished: payloadPkg.isPublished,
      whatsappLinkType: (payloadPkg as any).whatsappLinkType || 'studio',
      customWhatsappUrl: (payloadPkg as any).customWhatsappUrl || null,
    };
    console.log('[savePackage] FULL Payload being sent:', JSON.stringify(payload, null, 2));
    try {
      const res = await fetch(`${API_BASE}/packages/${payloadPkg.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log('[savePackage] FULL API Response:', JSON.stringify(data, null, 2));
      if (data.success) {
        updatePackageLocal(payloadPkg.id, () => payloadPkg);
        setFieldDrafts((prev) => ({
          ...prev,
          [fieldKey(payloadPkg.id, 'name')]: payloadPkg.name,
          [fieldKey(payloadPkg.id, 'price')]: String(payloadPkg.price),
          [fieldKey(payloadPkg.id, 'description')]: payloadPkg.description,
          [fieldKey(payloadPkg.id, 'features')]: (payloadPkg.features || []).join('\n'),
        }));
        // Clear unsaved state for this package
        setUnsavedPackageIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(payloadPkg.id);
          return newSet;
        });
        if (!silent) handleSave(`Package ${payloadPkg.name} berhasil disimpan`);
      } else {
        handleError(data.message || 'Gagal menyimpan package');
      }
    } catch (error) {
      handleError('Terjadi kesalahan koneksi saat menyimpan package');
      console.error('[savePackage] Error:', error);
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
        loadAllServices();
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
        loadAllServices();
      } else {
        handleError(data.message || 'Gagal menghapus package');
      }
    } catch (error) {
      handleError('Terjadi kesalahan koneksi saat menghapus package');
    }
  };

  const addNewService = async () => {
    const slug = newServiceSlug().trim().toLowerCase().replace(/\s+/g, '-');
    const name = newServiceName().trim();
    const desc = newServiceDescription().trim();
    const image = newServiceImage() || '/photography.png';

    console.log(`[addNewService] === START ===`);
    console.log(`[addNewService] Input: name="${name}", slug="${slug}", desc="${desc}", image="${image}"`);

    if (!name || !slug) {
      handleError('Nama dan slug layanan harus diisi');
      return;
    }

    try {
      console.log(`[addNewService] Saving to contentStore...`);
      // Save to contentStore
      contentStore.updateFieldLocal('service', `${slug}_title`, name);
      contentStore.updateFieldLocal('service', `${slug}_description`, desc);
      contentStore.updateFieldLocal('service', `${slug}_image`, image);
      console.log(`[addNewService] [OK] contentStore updated`);

      console.log(`[addNewService] Persisting to backend...`);
      // Persist to backend
      const r1 = await updateContent('service', `${slug}_title`, name);
      console.log(`[addNewService] Backend response 1 (title):`, r1);
      if (!r1.success) throw new Error(`Title save failed: ${r1.message}`);
      
      const r2 = await updateContent('service', `${slug}_description`, desc);
      console.log(`[addNewService] Backend response 2 (desc):`, r2);
      if (!r2.success) throw new Error(`Description save failed: ${r2.message}`);
      
      const r3 = await updateContent('service', `${slug}_image`, image);
      console.log(`[addNewService] Backend response 3 (image):`, r3);
      if (!r3.success) throw new Error(`Image save failed: ${r3.message}`);

      console.log(`[addNewService] [OK] Backend persist OK`);

      // Reset form and close modal
      setNewServiceName('Layanan Baru');
      setNewServiceSlug('layanan-baru');
      setNewServiceDescription('Deskripsi layanan');
      setNewServiceImage('/photography.png');
      setServiceImageUploaded(false);
      setShowAddServiceModal(false);

      console.log(`[addNewService] Reloading service section from backend...`);
      // Reload entire service section from backend to get fresh data
      await contentStore.loadSection('service');
      
      console.log(`[addNewService] Reloading services...`);
      // Reload services
      loadAllServices();
      
      console.log(`[addNewService] === SUCCESS === Service "${name}" added!`);
      handleSave(`Layanan "${name}" berhasil ditambahkan`);
    } catch (error) {
      console.error(`[addNewService] === ERROR ===`);
      console.error(`[addNewService] Error details:`, error);
      handleError(error instanceof Error ? error.message : 'Gagal menambahkan layanan');
    }
  };

  const deleteService = async (slug: string) => {
    console.log(`[deleteService] === START === slug="${slug}"`);
    
    // Show confirmation
    if (!confirm(`Apakah Anda yakin ingin menghapus layanan ini? Data tidak dapat dikembalikan.`)) {
      console.log(`[deleteService] Hapus dibatalkan oleh user`);
      return;
    }

    try {
      console.log(`[deleteService] Deleting from backend (3 fields: title, desc, image)...`);
      
      // Delete with more detailed error tracking
      const fieldsToDelete = [
        { name: 'title', key: `${slug}_title` },
        { name: 'description', key: `${slug}_description` },
        { name: 'image', key: `${slug}_image` }
      ];
      
      const results: any[] = [];
      for (const field of fieldsToDelete) {
        try {
          console.log(`[deleteService] Deleting field: ${field.name}...`);
          const response = await updateContent('service', field.key, '');
          console.log(`[deleteService] Response for ${field.name}:`, response);
          
          if (!response.success) {
            console.error(`[deleteService] Field ${field.name} failed: ${response.message}`);
            results.push({ field: field.name, success: false, message: response.message });
          } else {
            console.log(`[deleteService] [OK] ${field.name} deleted successfully`);
            results.push({ field: field.name, success: true });
          }
        } catch (fieldError) {
          console.error(`[deleteService] Exception while deleting ${field.name}:`, fieldError);
          results.push({ 
            field: field.name, 
            success: false, 
            message: fieldError instanceof Error ? fieldError.message : 'Unknown error'
          });
        }
      }
      
      // Check if all deletions were successful
      const allSuccess = results.every(r => r.success);
      const failedFields = results.filter(r => !r.success);
      
      if (!allSuccess) {
        const failedFieldsStr = failedFields.map(f => `${f.field} (${f.message})`).join(', ');
        throw new Error(`Gagal menghapus fields: ${failedFieldsStr}`);
      }

      console.log(`[deleteService] [OK] All backend deletions OK`);

      // Remove from local contentStore
      for (const field of fieldsToDelete) {
        contentStore.updateFieldLocal('service', field.key, '');
      }
      console.log(`[deleteService] [OK] contentStore cleared`);

      console.log(`[deleteService] Reloading service section from backend...`);
      // Reload entire service section from backend
      await contentStore.loadSection('service');
      
      console.log(`[deleteService] Reloading services list...`);
      // Reload services
      loadAllServices();
      
      console.log(`[deleteService] === SUCCESS === Service deleted!`);
      handleSave(`Layanan ${slug} berhasil dihapus`);
    } catch (error) {
      console.error(`[deleteService] === ERROR ===`);
      console.error(`[deleteService] Error details:`, error);
      handleError(error instanceof Error ? error.message : 'Gagal menghapus layanan');
    }
  };

  const editService = async () => {
    const oldSlug = editingServiceSlug();
    const newSlug = newServiceSlug().trim().toLowerCase().replace(/\s+/g, '-');
    const name = newServiceName().trim();
    const desc = newServiceDescription().trim();
    const image = newServiceImage() || '/photography.png';

    console.log(`[editService] === START === oldSlug="${oldSlug}", newSlug="${newSlug}"`);

    if (!name || !newSlug) {
      handleError('Nama dan slug layanan harus diisi');
      return;
    }

    try {
      // If slug changed, delete old fields and create new ones
      if (oldSlug !== newSlug) {
        console.log(`[editService] Slug berubah, menghapus fields lama...`);
        await updateContent('service', `${oldSlug}_title`, '');
        await updateContent('service', `${oldSlug}_description`, '');
        await updateContent('service', `${oldSlug}_image`, '');
      }

      console.log(`[editService] Saving ke backend dengan slug baru...`);
      // Save to contentStore
      contentStore.updateFieldLocal('service', `${newSlug}_title`, name);
      contentStore.updateFieldLocal('service', `${newSlug}_description`, desc);
      contentStore.updateFieldLocal('service', `${newSlug}_image`, image);

      // Persist to backend
      const r1 = await updateContent('service', `${newSlug}_title`, name);
      if (!r1.success) throw new Error(`Title save failed: ${r1.message}`);
      
      const r2 = await updateContent('service', `${newSlug}_description`, desc);
      if (!r2.success) throw new Error(`Description save failed: ${r2.message}`);
      
      const r3 = await updateContent('service', `${newSlug}_image`, image);
      if (!r3.success) throw new Error(`Image save failed: ${r3.message}`);

      // Reset form and close modal
      setNewServiceName('Layanan Baru');
      setNewServiceSlug('layanan-baru');
      setNewServiceDescription('Deskripsi layanan');
      setNewServiceImage('/photography.png');
      setServiceImageUploaded(false);
      setShowAddServiceModal(false);
      setIsEditingService(false);
      setEditingServiceSlug(null);

      // Reload services
      await contentStore.loadSection('service');
      loadAllServices();
      
      console.log(`[editService] === SUCCESS ===`);
      handleSave(`Layanan "${name}" berhasil diperbarui`);
    } catch (error) {
      console.error(`[editService] === ERROR ===`, error);
      handleError(error instanceof Error ? error.message : 'Gagal memperbarui layanan');
    }
  };

  const uploadImageForPackage = async (file: File) => {
    const token = authStore.getToken();
    const formData = new FormData();
    formData.append('file', file);

    console.log(`[uploadImageForPackage] === UPLOAD START ===`);
    console.log(`[uploadImageForPackage] File: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
    console.log(`[uploadImageForPackage] Token exists: ${!!token}`);
    console.log(`[uploadImageForPackage] Token starts with: ${token?.substring(0, 20)}...`);
    console.log(`[uploadImageForPackage] Endpoint: ${API_BASE}/upload`);

    // Validate token exists
    if (!token) {
      const errMsg = 'Token tidak ditemukan - silakan login ulang';
      console.error(`[uploadImageForPackage] ${errMsg}`);
      throw new Error(errMsg);
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      const errMsg = `File terlalu besar (${(file.size / 1024 / 1024).toFixed(2)}MB > 5MB)`;
      console.error(`[uploadImageForPackage] ${errMsg}`);
      throw new Error(errMsg);
    }

    try {
      // Make fetch request
      console.log(`[uploadImageForPackage] Sending fetch request...`);
      const startTime = Date.now();
      
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const duration = Date.now() - startTime;
      console.log(`[uploadImageForPackage] Response received in ${duration}ms, Status: ${res.status}`);

      // Check if response is OK
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        console.log(`[uploadImageForPackage] Response Content-Type: ${contentType}`);
        
        let errorText = '';
        try {
          errorText = await res.text();
        } catch (e) {
          errorText = `(gagal membaca response body)`;
        }
        
        console.error(`[uploadImageForPackage] HTTP ${res.status}: ${errorText}`);
        throw new Error(`Upload gagal - Server mengembalikan ${res.status}: ${errorText}`);
      }

      // Parse JSON response
      console.log(`[uploadImageForPackage] Parsing response JSON...`);
      const responseData = await res.json();
      console.log(`[uploadImageForPackage] Response data:`, responseData);
      
      // Validate response
      if (!responseData.success) {
        throw new Error(responseData.message || 'Respon server tidak valid');
      }

      if (!responseData.data?.url) {
        throw new Error('Tidak ada URL gambar dalam response');
      }
      
      console.log(`[uploadImageForPackage] === UPLOAD SUCCESS ===`);
      return responseData;
      
    } catch (error) {
      console.error(`[uploadImageForPackage] === UPLOAD FAILED ===`);
      console.error(`[uploadImageForPackage] Error type:`, error?.constructor?.name);
      console.error(`[uploadImageForPackage] Error message:`, error instanceof Error ? error.message : String(error));
      console.error(`[uploadImageForPackage] Full error:`, error);
      throw error;
    }
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

  // Delete testimonial and save to backend
  const deleteTestimonial = async (idx: number) => {
    try {
      // Update local state first
      contentStore.updateFieldLocal('testimonials', `quote${idx}`, '');
      contentStore.updateFieldLocal('testimonials', `author${idx}`, '');

      // Save to backend
      await updateContent('testimonials', `quote${idx}`, '');
      await updateContent('testimonials', `author${idx}`, '');

      handleSave(`Testimoni ${idx} dihapus`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Gagal menghapus testimoni';
      handleError(errorMsg);
      console.error('Delete testimonial error:', error);
    }
  };

  // Refresh portfolio data from database and reset edit states
  const handleRefreshPortfolioData = async () => {
    try {
      setShowRefreshConfirmModal(false);
      // Reset all edit states before reload
      setIsEditingTotalPhotos(false);
      setIsEditingCategories(false);
      
      // Reload portfolio section from backend
      await contentStore.loadSection('portfolio');
      
      // Auto-sync Categories: if stored value differs from actual category count, fix it
      const storedCategories = contentStore.getField('portfolio', 'categories');
      const actualCategories = portfolioCategoriesData().length.toString();
      if (storedCategories && storedCategories !== actualCategories) {
        console.log(`[AdminHome] Auto-syncing Categories: ${storedCategories} -> ${actualCategories}`);
        await updateContent('portfolio', 'categories', actualCategories);
        contentStore.updateFieldLocal('portfolio', 'categories', actualCategories);
      }
      
      // Reset edit values to empty
      setEditTotalPhotosValue('');
      setEditCategoriesValue('');
      setPendingStatEdit(null);
      
      handleSave('Data portfolio berhasil dimuat ulang dari database');
      console.log('[AdminHome] Portfolio data refreshed successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Gagal memuat ulang data';
      handleError(errorMsg);
      console.error('Refresh portfolio error:', error);
    }
  };

  // Get appropriate title for new portfolio item
  const getNewItemTitle = (categorySlug: string, newIndex: number) => {
    const category = portfolioCategoriesData().find(c => c.slug === categorySlug);
    const defaultImages = getImagesByCategory(categorySlug as any);
    const defaultCount = defaultImages.length;
    
    if (category) {
      // tagExample format is now #X only (e.g., "#1")
      // Display: "{category.name} #{index}"
      return `${category.name} #${defaultCount + newIndex}`;
    }
    return `Photo #${newIndex}`;
  };

  // Get all images for category (default + from backend)
  const getPortfolioCategoryImages = (categorySlug: string) => {
    // Get default images from portfolio.ts
    const defaultImages = getImagesByCategory(categorySlug);
    
    // Access contentStore to trigger Solid.js dependency tracking
    const portfolioFields = contentStore.getSectionFields('portfolio');
    const categoryFields = portfolioFields.filter(f => f.field.startsWith(`${categorySlug}_`));
    
    // Create complete image list: defaults + any new items not in defaults
    const allImages: Array<{id: string; title: string; url: string; category: string; hasValue?: boolean}> = [...defaultImages];
    
    // Track how many new items we've added (for proper numbering)
    let newItemCount = 0;
    
    // Add any fields that start with "new_" (dynamically added items)
    categoryFields.forEach(field => {
      if (field.field.startsWith(`${categorySlug}_new_`)) {
        const id = field.field.replace(`${categorySlug}_`, ''); // Extract just 'new_1', 'new_2', etc
        const value = field.value;
        // Add if field exists (even if just placeholder)
        if (value) {
          // Check if already in defaults
          if (!allImages.find(img => img.id === id)) {
            newItemCount++;
            const hasRealContent = !!(value && value.trim() && value !== '/placeholder.png');
            allImages.push({
              id,
              title: getNewItemTitle(categorySlug, newItemCount),
              url: value,
              category: categorySlug as any,
              hasValue: hasRealContent,
            });
          }
        }
      }
    });
    
    return allImages.sort((a, b) => {
      // Sort defaults first (p1-p5, e1-e5, etc), then new items
      const aIsDefault = !a.id.startsWith('new_');
      const bIsDefault = !b.id.startsWith('new_');
      if (aIsDefault !== bIsDefault) return aIsDefault ? -1 : 1;
      return a.id.localeCompare(b.id);
    });
  };

  // Add new portfolio item to category - creates field in backend
  const addPortfolioItem = async (categorySlug: string) => {
    try {
      // Find next available ID
      const allFields = contentStore.getSectionFields('portfolio');
      const categoryFields = allFields.filter(f => f.field.startsWith(`${categorySlug}_new_`));
      const newCount = categoryFields.length + 1;
      const newId = `new_${newCount}`;
      const fieldName = `${categorySlug}_${newId}`;
      
      console.log(`[AdminHome] Adding new portfolio item: ${fieldName}`);
      
      // Create with placeholder to make it visible in grid immediately
      const placeholderUrl = '/placeholder.png';
      await updateContent('portfolio', fieldName, placeholderUrl);
      
      // Update contentStore with placeholder
      contentStore.updateFieldLocal('portfolio', fieldName, placeholderUrl);
      
      handleSave(`Slot foto baru ditambahkan untuk ${categorySlug}. Upload foto dan klik Simpan.`);
      
      // Memo will re-run automatically due to contentStore.lastUpdated change
    } catch (error) {
      console.error(`[AdminHome] Error adding portfolio item:`, error);
      handleError(`Gagal menambahkan slot foto: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Portfolio images memo - track both category AND contentStore changes
  const portfolioImages = createMemo(() => {
    // Access contentStore state to make this a dependency
    // This ensures memo re-runs when portfolio fields change in backend
    const _storeUpdateTrigger = contentStore.state().lastUpdated?.getTime() || 0;
    return getPortfolioCategoryImages(activeServicePortfolio());
  });

  // Format portfolio count: show "21+" if more than 21 photos
  const portfolioPhotoCountDisplay = createMemo(() => {
    const count = portfolioImages().length;
    return count > 31 ? '31' : count.toString();
  });

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
    <div class="admin-home min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <nav class="bg-[#464C43] text-white shadow-lg">
        <div class="container mx-auto px-4 md:px-6 py-4">
          <div class="flex items-center justify-between gap-4">
            {/* Logo & Page Title */}
            <div class="flex items-center gap-3 min-w-0">
              <img src="/LOGO/BIGGER WM NEW PUTIH.png" alt="Widymotret" class="h-10 flex-shrink-0 drop-shadow-lg" />
              <span class="text-xs md:text-sm text-white/70 border-l border-white/30 pl-3 truncate hidden md:block">
                {currentPage() === 'home' && 'Halaman Utama'}
                {currentPage() === 'services' && 'Kelola Services'}
                {currentPage() === 'pricelist' && 'Kelola Pricelist'}
                {currentPage() === 'portfolio' && 'Kelola Portfolio'}
                {currentPage() === 'about' && 'Halaman About'}
                {currentPage() === 'footer' && 'Kelola Footer'}
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

      {/* Tab Navigation - Responsive: Buttons on desktop, Dropdown on mobile */}
        <div class="bg-white rounded-xl shadow-sm p-1 mb-8">
          {/* Mobile Dropdown */}
          <div class="md:hidden px-4 py-2">
            <select
              value={currentPage()}
              onChange={(e) => {
                const page = e.currentTarget.value as 'home' | 'services' | 'pricelist' | 'portfolio-categories' | 'portfolio' | 'about' | 'footer';
                setCurrentPage(page);
                
                // Load data for about/footer if needed
                if (page === 'about') {
                  Promise.all([
                    contentStore.loadSection('about_page'),
                    contentStore.loadSection('about'),
                  ]);
                } else if (page === 'footer') {
                  contentStore.loadSection('footer');
                }
              }}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg font-medium bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#576250]"
            >
              <option value="home">Halaman Utama</option>
              <option value="services">Kelola Services</option>
              <option value="pricelist">Pricelist</option>
              <option value="portfolio-categories">Kategori Portfolio</option>
              <option value="portfolio">Portfolio</option>
              <option value="about">Halaman About</option>
              <option value="footer">Kelola Footer</option>
            </select>
          </div>

          {/* Desktop Horizontal Scroll Tabs */}
          <div class="hidden md:flex gap-2 flex-wrap overflow-x-auto pb-1">
            <button
              onClick={() => setCurrentPage('home')}
              class={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                currentPage() === 'home'
                  ? 'bg-[#576250] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <AiFillHome size={20} />
              Halaman Utama
            </button>
            <button
              onClick={() => setCurrentPage('services')}
              class={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                currentPage() === 'services'
                  ? 'bg-[#576250] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaSolidClipboardList size={20} />
              Kelola Services
            </button>
            <button
              onClick={() => setCurrentPage('pricelist')}
              class={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                currentPage() === 'pricelist'
                  ? 'bg-[#576250] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <AiFillDollarCircle size={20} />
              Pricelist
            </button>
            <button
              onClick={() => setCurrentPage('portfolio-categories')}
              class={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                currentPage() === 'portfolio-categories'
                  ? 'bg-[#576250] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <AiFillFileImage size={20} />
              Kategori Portfolio
            </button>
            <button
              onClick={() => setCurrentPage('portfolio')}
              class={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                currentPage() === 'portfolio'
                  ? 'bg-[#576250] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <AiFillCamera size={20} />
              Portfolio
            </button>
            <button
              onClick={async () => {
                setCurrentPage('about');
                // Load about_page and about sections from backend
                await Promise.all([
                  contentStore.loadSection('about_page'),
                  contentStore.loadSection('about'),
                ]);
              }}
              class={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                currentPage() === 'about'
                  ? 'bg-[#576250] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <AiFillBook size={20} />
              Halaman About
            </button>
            <button
              onClick={async () => {
                setCurrentPage('footer');
                // Load footer section from backend
                await contentStore.loadSection('footer');
              }}
              class={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                currentPage() === 'footer'
                  ? 'bg-[#576250] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaSolidPhoneAlt size={20} />
              Kelola Footer
            </button>
          </div>
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
                <div class="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 -mx-4 px-4">
                  <div class="flex gap-3 pb-2 min-w-min">
                    <For each={allServices()}>
                      {(s) => (
                        <div class="text-center flex-shrink-0">
                          <div class="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <img 
                              src={resolveMediaUrl(contentStore.getField('service', `${s.slug}_image`) || s.image)} 
                              alt={s.title} 
                              class="w-full h-full object-cover" 
                            />
                          </div>
                          <p class="text-xs text-gray-500 mt-1 max-w-32 truncate">{s.title}</p>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              </div>

              {/* Portfolio Grid automatically fetches from first image of each category - no manual admin config needed */}

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
                <EditableText
                  label="SubJudul/Deskripsi"
                  value={contentStore.getField('testimonials', 'subtitle')}
                  section="testimonials"
                  field="subtitle"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('testimonials', 'subtitle', value);
                    handleSave('Testimoni subtitle berhasil disimpan');
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

                        return (
                          <Show when={quote()}>
                            <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                              <div class="flex justify-between items-start mb-3">
                                <h4 class="font-bold text-gray-800 text-sm">Testimoni {idx}</h4>
                                <button
                                  onClick={() => deleteTestimonial(idx)}
                                  class="text-red-500 hover:text-red-700 text-lg leading-none px-2"
                                  title="Hapus testimoni"
                                >
                                  Ã—
                                </button>
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

          {/* SERVICES MANAGEMENT PAGE */}
          <Show when={currentPage() === 'services'}>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-8"><FaSolidClipboardList class="inline mr-2" size={24} />Kelola Layanan</h2>
              <p class="text-gray-600 mb-6">Tambah dan kelola kategori layanan fotografi.</p>

              <button
                onClick={() => setShowAddServiceModal(true)}
                class="mb-8 px-5 py-2.5 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium text-sm"
              >
                + Tambah Layanan Baru
              </button>

              {/* Services List - Vertical Stacking */}
              <div class="space-y-4">
                <Show when={allServices().length === 0} fallback={
                  <For each={allServices()}>
                    {(service) => (
                      <div class="p-5 bg-gray-50 rounded-lg border border-gray-200">
                        <div class="flex gap-4 items-start">
                          {/* Image */}
                          <div class="w-24 h-24 flex-shrink-0">
                            <img 
                              src={resolveMediaUrl(service.image)} 
                              alt={service.title}
                              class="w-full h-full object-cover rounded"
                            />
                          </div>
                          {/* Content */}
                          <div class="flex-grow">
                            <h3 class="font-bold text-gray-800 mb-2">{service.title}</h3>
                            <p class="text-sm text-gray-600 mb-3">{service.description}</p>
                            <p class="text-xs text-gray-500">Slug: <code class="bg-gray-200 px-1 py-0.5 rounded">{service.slug}</code></p>
                          </div>
                          {/* Buttons */}
                          <div class="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => {
                                setIsEditingService(true);
                                setEditingServiceSlug(service.slug);
                                setNewServiceName(service.title);
                                setNewServiceSlug(service.slug);
                                setNewServiceDescription(service.description);
                                setNewServiceImage(service.image);
                                setShowAddServiceModal(true);
                              }}
                              class="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded transition text-sm flex items-center gap-2 flex-shrink-0 border border-blue-200 hover:border-blue-300"
                            >
                              <FaSolidEdit size={16} />
                              Edit
                            </button>
                            <button
                              onClick={() => deleteService(service.slug)}
                              class="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition text-sm flex items-center gap-2 flex-shrink-0 border border-red-200 hover:border-red-300"
                            >
                              <FaSolidTrashAlt size={16} />
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                }>
                  <div class="p-5 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-500">
                    Tidak ada layanan. Buat layanan baru untuk memulai.
                  </div>
                </Show>
              </div>
            </div>
          </Show>

          {/* PRICELIST PAGE */}
          <Show when={currentPage() === 'pricelist'}>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-8"><AiFillDollarCircle class="inline mr-2" size={24} />Kelola Pricelist</h2>
              <p class="text-gray-600 mb-6">Edit paket dan harga untuk setiap jenis layanan fotografi.</p>

              {/* Warning Banner - Unsaved Packages */}
              <Show when={unsavedPackageIds().size > 0}>
                <div class="mb-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
                  <div class="flex items-start gap-3">
                    <svg class="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.981-1.742 2.981H4.42c-1.53 0-2.492-1.647-1.743-2.98l5.58-9.92zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-7a1 1 0 00-1 1v4a1 1 0 102 0V7a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <div class="flex-1">
                      <p class="font-semibold text-amber-800">Ada {unsavedPackageIds().size} paket foto yang belum disimpan</p>
                      <p class="text-sm text-amber-700">Klik tombol "SIMPAN PAKET" untuk setiap paket yang diubah sebelum keluar halaman ini</p>
                      <div class="mt-3 rounded border border-amber-200 bg-amber-100/60 p-3">
                        <p class="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-2">Detail perubahan belum disimpan</p>
                        <ul class="space-y-1 text-sm text-amber-900">
                          <For each={unsavedPackageDetails()}>
                            {(item) => (
                              <li>
                                Halaman: Admin Home | Bagian: Pricelist - {item.serviceTitle} | Paket: {item.packageName}
                              </li>
                            )}
                          </For>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Show>

              {/* Service Type Tabs - Horizontal Scrollable */}
              <div class="mb-8">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-sm font-semibold text-gray-700">Pilih Layanan</h3>
                  <span class="text-xs text-gray-500 px-3 py-1 bg-gray-100 rounded-full">
                    {allServices().length} layanan
                  </span>
                </div>
                <div class="relative">
                  {/* Scroll Container */}
                  <div class="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <div class="bg-gradient-to-r from-gray-50 to-gray-50 rounded-xl p-3 flex gap-3 min-w-min">
                      <For each={allServices()}>
                        {(service) => (
                          <button
                            onClick={() => setActiveServicePricelist(service.slug)}
                            class={`px-5 py-3 rounded-lg font-medium transition-all whitespace-nowrap flex-shrink-0 border-2 ${
                              activeServicePricelist() === service.slug
                                ? 'bg-[#576250] text-white border-[#576250] shadow-md'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#576250] hover:text-[#576250]'
                            }`}
                          >
                            {service.title}
                            {activeServicePricelist() === service.slug && (
                              <span class="ml-2 inline-block w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            )}
                          </button>
                        )}
                      </For>
                    </div>
                  </div>
                  {/* Scroll Indicator */}
                  <Show when={allServices().length > 3}>
                    <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none rounded-r-xl flex items-center justify-end pr-2">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  </Show>
                </div>
              </div>

              <Show when={allServices().find(s => s.slug === activeServicePricelist())}>
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
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 items-start">
                                  <For each={pkg.images || []}>
                                    {(img, imgIdx) => (
                                      <EditableImage
                                        label={`Foto #${imgIdx() + 1}`}
                                        value={img}
                                        section="service"
                                        field={`${service().slug}_pkg_image_${imgIdx()}`}
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
                                  <div class="flex flex-col gap-2">
                                    <p class="text-sm font-semibold text-gray-700">Foto #{(pkg.images?.length || 0) + 1}</p>
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
                              </div>

                              {/* WhatsApp Link Options */}
                              <div class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <label class="block text-sm font-semibold text-gray-700 mb-3">Link WhatsApp Kontak</label>
                                <div class="space-y-3">
                                  <div class="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      id={`wa-studio-${pkg.id}`}
                                      name={`wa-type-${pkg.id}`}
                                      value="studio"
                                      checked={(pkg as any).whatsappLinkType !== 'wedding' && (pkg as any).whatsappLinkType !== 'custom'}
                                      onChange={() => updatePackageLocal(pkg.id, (prev) => ({ ...prev, whatsappLinkType: 'studio', customWhatsappUrl: '' } as any))}
                                    />
                                    <label for={`wa-studio-${pkg.id}`} class="text-sm text-gray-700 cursor-pointer">
                                      Studio foto: https://wa.me/62895351115777
                                    </label>
                                  </div>
                                  
                                  <div class="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      id={`wa-wedding-${pkg.id}`}
                                      name={`wa-type-${pkg.id}`}
                                      value="wedding"
                                      checked={(pkg as any).whatsappLinkType === 'wedding'}
                                      onChange={() => updatePackageLocal(pkg.id, (prev) => ({ ...prev, whatsappLinkType: 'wedding', customWhatsappUrl: '' } as any))}
                                    />
                                    <label for={`wa-wedding-${pkg.id}`} class="text-sm text-gray-700 cursor-pointer">
                                      Studio foto (khusus wedding): https://wa.me/62895632522949
                                    </label>
                                  </div>

                                  <div class="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      id={`wa-custom-${pkg.id}`}
                                      name={`wa-type-${pkg.id}`}
                                      value="custom"
                                      checked={(pkg as any).whatsappLinkType === 'custom'}
                                      onChange={() => updatePackageLocal(pkg.id, (prev) => ({ ...prev, whatsappLinkType: 'custom' } as any))}
                                    />
                                    <label for={`wa-custom-${pkg.id}`} class="text-sm text-gray-700 cursor-pointer">
                                      Lainnya (isi sendiri)
                                    </label>
                                  </div>
                                  
                                  <Show when={(pkg as any).whatsappLinkType === 'custom'}>
                                    <input
                                      type="text"
                                      value={(pkg as any).customWhatsappUrl || ''}
                                      onChange={(e) => updatePackageLocal(pkg.id, (prev) => ({ ...prev, customWhatsappUrl: e.currentTarget.value } as any))}
                                      placeholder="Misal: https://wa.me/62895123456"
                                      class="ml-6 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                    />
                                  </Show>
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

              {/* Hero Image Section */}
              <div class="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Hero Image - Portfolio Page</h3>
                <p class="text-sm text-gray-600 mb-4">Gambar besar di atas portfolio page (rekomendasi: landscape/cover image)</p>
                <div class="max-w-md">
                  <EditableImage
                    label="Portfolio Hero Image"
                    value={contentStore.getField('portfolio', 'hero_image')}
                    section="portfolio"
                    field="hero_image"
                    aspectClass="aspect-video"
                    onUpload={uploadImageForPackage}
                    onSave={async (v) => {
                      try {
                        contentStore.updateFieldLocal('portfolio', 'hero_image', v);
                        handleSave(`Hero image berhasil diupdate`);
                      } catch (error) {
                        handleError(`Gagal menyimpan: ${error instanceof Error ? error.message : 'Unknown error'}`);
                      }
                    }}
                    onError={handleError}
                  />
                </div>
              </div>

              {/* Tabs Kategori */}
              <div class="bg-gray-50 rounded-xl p-4 mb-8">
                {/* Mobile Select Dropdown */}
                <select 
                  class="block md:hidden w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-700 focus:outline-none focus:border-[#576250] mb-4"
                  value={activeServicePortfolio()}
                  onChange={(e) => setActiveServicePortfolio(e.target.value)}
                >
                  <For each={portfolioCategoriesData()}>
                    {(cat) => (
                      <option value={cat.slug}>{cat.name}</option>
                    )}
                  </For>
                </select>

                {/* Desktop Button Tabs */}
                <div class="hidden md:flex gap-2 overflow-x-auto pb-2 scroll-smooth">
                  <For each={portfolioCategoriesData()}>
                    {(cat) => (
                      <button
                        onClick={() => setActiveServicePortfolio(cat.slug)}
                        class={`px-6 py-2 rounded-lg font-medium transition-all flex-shrink-0 whitespace-nowrap ${
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
              </div>

              {/* Portfolio Images for selected category */}
              {(() => {
                const cat = () => portfolioCategoriesData().find((c: PortfolioCategory) => c.slug === activeServicePortfolio());
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
                            portfolioImages().length > 20 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {portfolioImages().length} foto
                            {portfolioImages().length > 20 && (
                              <svg class="inline ml-1 w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.981-1.742 2.981H4.42c-1.53 0-2.492-1.647-1.743-2.98l5.58-9.92zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-7a1 1 0 00-1 1v4a1 1 0 102 0V7a1 1 0 00-1-1z" clip-rule="evenodd" />
                              </svg>
                            )}
                          </span>
                        </div>

                        {portfolioImages().length > 20 && (
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
                        <For each={[activeServicePortfolio()]}>
                          {() => (
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <For each={portfolioImages()}>
                                {(img, idx) => {
                                  const fieldName = `${category().slug}_${img.id}`;
                                  const rawStoredValue = contentStore.getField('portfolio', fieldName);
                                  // Check if field has been explicitly set in backend
                                  const hasBeenSaved = rawStoredValue !== undefined && rawStoredValue !== null;
                                  // Sanitize stored value
                                  const storedValue = rawStoredValue 
                                    && String(rawStoredValue).trim() 
                                    && !['no image', 'null', 'undefined'].includes(String(rawStoredValue).trim().toLowerCase())
                                    ? rawStoredValue 
                                    : '';
                                  // If explicitly deleted (hasBeenSaved but storedValue empty) -> show empty. Otherwise fallback to default img.url
                                  const displayValue = hasBeenSaved ? storedValue : img.url;
                                  
                                  // Get label from DB tagExample, replace #X with actual index (matching Portfolio.tsx logic)
                                  const getImageLabel = () => {
                                    const dbCategory = category();
                                    if (!dbCategory?.tagExample) return img.title;
                                    // tagExample format: "Wedding #X" - replace X with index
                                    return dbCategory.tagExample.replace(/#X$/i, `#${idx() + 1}`);
                                  };
                                  
                                  console.log(`[AdminHome Portfolio] Rendering ${fieldName}: hasBeenSaved=${hasBeenSaved}, stored="${storedValue}", display="${displayValue}", label="${getImageLabel()}"`);
                                  
                                  return (
                                    <EditableImage
                                      label={getImageLabel()}
                                      value={displayValue}
                                      section="portfolio"
                                      field={fieldName}
                                      aspectClass="aspect-square"
                                      onUpload={uploadImageForPackage}
                                      onSave={async (v) => {
                                        console.log(`[AdminHome] Portfolio onSave START: field=${fieldName}, newValue="${v}"`);
                                        try {
                                          // Keep the new value locally for immediate UI persistence
                                          // No need to reload from backend - trust the save worked
                                          contentStore.updateFieldLocal('portfolio', fieldName, v);
                                          console.log(`[AdminHome] Portfolio local store updated with new value`);
                                          handleSave(`${getImageLabel()} berhasil diupdate`);
                                        } catch (error) {
                                          console.error(`[AdminHome] Portfolio onSave ERROR:`, error);
                                          handleError(`Gagal menyimpan: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                        }
                                      }}
                                      onError={handleError}
                                      onDelete={async () => {
                                        try {
                                          console.log(`[AdminHome] Portfolio delete START: field=${fieldName}`);
                                          const response = await updateContent('portfolio', fieldName, '');
                                          console.log(`[AdminHome] Portfolio delete API response:`, response);
                                          
                                          if (!response.success) {
                                            throw new Error(`API error: ${response.message}`);
                                          }
                                          
                                          contentStore.updateFieldLocal('portfolio', fieldName, '');
                                          handleSave(`${getImageLabel()} berhasil dihapus`);
                                        } catch (error) {
                                          console.error(`[AdminHome] Portfolio delete ERROR:`, error);
                                          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                                          handleError(`Gagal menghapus: ${errorMsg}`);
                                        }
                                      }}
                                    />
                                  );
                                }}
                              </For>
                            </div>
                          )}
                        </For>

                        {/* Tambah Foto Baru */}
                        <button
                          onClick={() => addPortfolioItem(category().slug)}
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

              {/* Portfolio Stats - Editable Section */}
              <div class="mt-12 bg-white rounded-lg border border-gray-200 p-6">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Statistik Portfolio</h3>
                <p class="text-sm text-gray-600 mb-6">Atur statistik. Total Photos & Categories adalah jumlah sebenarnya dari database.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Total Photos - Read-Only, Shows Keseluruhan Foto */}
                  <div class="p-4 bg-gray-50 rounded-lg border border-gray-300">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Total Photos (Bagian ini)</label>
                    <p class="text-sm text-gray-600 mb-2">Jumlah foto dari bagian portfolio yang dipilih</p>
                    <div class="relative">
                      <input
                        type="text"
                        value={portfolioPhotoCountDisplay()}
                        disabled
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed font-semibold text-lg"
                        title="Nilai ini otomatis dihitung"
                      />
                    </div>
                    <p class="text-xs text-gray-600 mt-2">Ter-update otomatis saat foto ditambah/dihapus</p>
                  </div>

                  {/* Categories - Read-Only, Auto-Calculated */}
                  <div class="p-4 bg-gray-50 rounded-lg border border-gray-300">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Categories</label>
                    <p class="text-sm text-gray-600 mb-2">Jumlah kategori dari database</p>
                    <div class="relative">
                      <input
                        type="text"
                        value={portfolioCategoriesData().length.toString()}
                        disabled
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed font-semibold text-lg"
                        title="Nilai ini otomatis dihitung dari jumlah kategori"
                      />
                    </div>
                    <p class="text-xs text-gray-600 mt-2">Ter-update otomatis berdasarkan kategori yang ada</p>
                  </div>

                  {/* Happy Clients - Simple Editable */}
                  <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Happy Clients (Editable)</label>
                    <input
                      type="text"
                      value={contentStore.getField('portfolio', 'happy_clients') || '500+'}
                      onChange={(e) => contentStore.updateFieldLocal('portfolio', 'happy_clients', e.currentTarget.value)}
                      onBlur={(e) => {
                        updateContent('portfolio', 'happy_clients', e.currentTarget.value);
                        handleSave('Happy Clients berhasil disimpan');
                      }}
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: 500+"
                    />
                    <p class="text-xs text-blue-700 mt-2">Langsung tersimpan</p>
                  </div>

                  {/* Years Experience - Simple Editable */}
                  <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Years Experience (Editable)</label>
                    <input
                      type="text"
                      value={contentStore.getField('portfolio', 'years_experience') || '5+'}
                      onChange={(e) => contentStore.updateFieldLocal('portfolio', 'years_experience', e.currentTarget.value)}
                      onBlur={(e) => {
                        updateContent('portfolio', 'years_experience', e.currentTarget.value);
                        handleSave('Years Experience berhasil disimpan');
                      }}
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: 5+"
                    />
                    <p class="text-xs text-blue-700 mt-2">Langsung tersimpan</p>
                  </div>
                </div>
              </div>

              {/* Modal Confirmation for Stats */}
              <Show when={showConfirmStatModal()}>
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div class="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Konfirmasi Perubahan</h3>
                    <p class="text-gray-600 text-sm mb-6">
                      {pendingStatEdit()?.field === 'total_photos' 
                        ? 'Total Photos sudah terhubung dengan jumlah asli dari database. Yakin mau mengubahnya?' 
                        : 'Categories sudah terhubung dengan jumlah asli dari database. Yakin mau mengubahnya?'}
                    </p>
                    <div class="flex gap-3">
                      <button
                        onClick={() => setShowConfirmStatModal(false)}
                        class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                      >
                        Tidak
                      </button>
                      <button
                        onClick={async () => {
                          if (pendingStatEdit()) {
                            await updateContent('portfolio', pendingStatEdit()!.field, pendingStatEdit()!.value);
                            handleSave(`${pendingStatEdit()!.field} berhasil diubah`);
                            setIsEditingTotalPhotos(false);
                            setIsEditingCategories(false);
                          }
                          setShowConfirmStatModal(false);
                          setPendingStatEdit(null);
                        }}
                        class="flex-1 px-4 py-2 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium"
                      >
                        Ya, Ubah
                      </button>
                    </div>
                  </div>
                </div>
              </Show>

              {/* Refresh Button - Below Stats */}
              <div class="mt-8 pt-6 border-t-2 border-gray-200 flex gap-2">
                <button
                  onClick={() => setShowRefreshConfirmModal(true)}
                  class="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium text-sm flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Muat Ulang Data
                </button>
              </div>

              {/* Refresh Confirmation Modal */}
              <Show when={showRefreshConfirmModal()}>
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div class="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Muat Ulang Data Portfolio</h3>
                    <p class="text-gray-600 text-sm mb-6">
                      Jumlah data akan kembali sesuai isi database. Yakin ingin mengubah?
                    </p>
                    <div class="flex gap-3">
                      <button
                        onClick={() => setShowRefreshConfirmModal(false)}
                        class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                      >
                        Tidak
                      </button>
                      <button
                        onClick={handleRefreshPortfolioData}
                        class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        Ya, Muat Ulang
                      </button>
                    </div>
                  </div>
                </div>
              </Show>
            </div>
          </Show>

          {/* PORTFOLIO CATEGORIES MANAGEMENT */}
          <Show when={currentPage() === 'portfolio-categories'}>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-8"><AiFillFileImage class="inline mr-2" size={24} />Manajemen Kategori Portfolio</h2>
              <p class="text-gray-600 mb-6">Kelola jenis-jenis portfolio yang akan ditampilkan di halaman portofolio.</p>

              <button
                onClick={() => {
                  resetCategoryModal();
                  setShowAddCategoryModal(true);
                }}
                class="mb-8 px-5 py-2.5 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium text-sm"
              >
                + Tambah Kategori Baru
              </button>

              {/* Categories List */}
              <div class="space-y-4">
                <For each={portfolioCategoriesData()} fallback={
                  <div class="p-5 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-500">
                    Belum ada kategori. Buat kategori baru untuk memulai.
                  </div>
                }>
                  {(category) => (
                    <div class="p-5 bg-gray-50 rounded-lg border border-gray-200">
                      <div class="flex gap-4 items-start">
                        <Show when={category.examplePhotoUrl}>
                          <div class="w-24 h-24 flex-shrink-0">
                            <img 
                              src={resolveMediaUrl(category.examplePhotoUrl || '')} 
                              alt={category.name}
                              class="w-full h-full object-cover rounded"
                            />
                          </div>
                        </Show>
                        <div class="flex-grow">
                          <h3 class="font-bold text-gray-800 mb-2">{category.name}</h3>
                          <p class="text-sm text-gray-600 mb-2">{category.description}</p>
                          <div class="flex gap-4 text-xs text-gray-500">
                            <span>Tag: <code class="bg-gray-200 px-1 py-0.5 rounded">{category.tagExample}</code></span>
                            <span>Slug: <code class="bg-gray-200 px-1 py-0.5 rounded">{category.slug}</code></span>
                          </div>
                        </div>
                        <button
                          onClick={() => openEditCategoryModal(category)}
                          class="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded transition text-sm flex items-center gap-2 flex-shrink-0 border border-blue-200 hover:border-blue-300"
                        >
                          <FaSolidEdit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => deletePortfolioCategory(category.id)}
                          class="px-3 py-2 text-red-600 hover:bg-red-50 rounded transition text-sm flex items-center gap-2 flex-shrink-0 border border-red-200 hover:border-red-300"
                        >
                          <FaSolidTrashAlt size={16} />
                          Hapus
                        </button>
                      </div>
                    </div>
                  )}
                </For>
              </div>

              {/* Add/Edit Category Modal */}
              <Show when={showAddCategoryModal()}>
                <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">
                      {isEditingCategory() ? 'Edit Kategori Portfolio' : 'Tambah Kategori Portfolio Baru'}
                    </h3>

                    <div class="space-y-4 mb-6">
                      {/* Name Field */}
                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Nama Kategori</label>
                        <input
                          type="text"
                          value={newCategoryName()}
                          onInput={(e) => setNewCategoryName(e.currentTarget.value)}
                          placeholder="Misal: Portrait Photography"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#576250]"
                        />
                      </div>

                      {/* Slug Field */}
                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                        <input
                          type="text"
                          value={newCategorySlug()}
                          onInput={(e) => {
                            let val = e.currentTarget.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
                            setNewCategorySlug(val);
                          }}
                          placeholder="Misal: portrait"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#576250] font-mono text-sm"
                        />
                        <p class="text-xs text-gray-500 mt-1">Otomatis: huruf kecil, hanya alphanumeric dan tanda hubung (-)</p>
                      </div>

                      {/* Description Field */}
                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                        <textarea
                          value={newCategoryDescription()}
                          onInput={(e) => setNewCategoryDescription(e.currentTarget.value)}
                          placeholder="Deskripsi kategori portfolio ini..."
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#576250] resize-none"
                        />
                      </div>

                      {/* Tag Example Field */}
                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Tag Contoh</label>
                        <input
                          type="text"
                          value={newCategoryTagExample()}
                          onInput={(e) => {
                            // Normalize to uppercase X
                            const val = e.currentTarget.value.replace(/#x$/i, '#X');
                            setNewCategoryTagExample(val);
                          }}
                          placeholder="Misal: Wedding #X"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#576250]"
                        />
                        <p class="text-xs text-gray-500 mt-1">Format: Nama Tag #X, X adalah placeholder angka (contoh: Wedding #X, Portrait #X)</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div class="flex gap-3">
                      <button
                        onClick={() => resetCategoryModal()}
                        class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                      >
                        Batal
                      </button>
                      <button
                        onClick={savePortfolioCategory}
                        class="flex-1 px-4 py-2 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium"
                      >
                        {isEditingCategory() ? 'Perbarui Kategori' : 'Buat Kategori'}
                      </button>
                    </div>
                  </div>
                </div>
              </Show>
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
                    <For each={[0, 1, 2]}>
                      {(idx) => (
                        <EditableText
                          label={`Paragraf ${idx + 1}`}
                          value={aboutTextValue(`story_paragraph${idx}`, aboutData.myStory.paragraphs[idx] || '')}
                          section="about_page"
                          field={`story_paragraph${idx}`}
                          multiline={true}
                          onSave={(value) => {
                            contentStore.updateFieldLocal('about_page', `story_paragraph${idx}`, value);
                            handleSave(`Paragraf ${idx + 1} berhasil disimpan`);
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
                  label="Judul"
                  value={aboutTextValue('philosophy_title', 'Filosofi')}
                  section="about_page"
                  field="philosophy_title"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'philosophy_title', value);
                    handleSave('Judul filosofi berhasil disimpan');
                  }}
                  onError={handleError}
                />
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
                <EditableText
                  label="Text Penutup (di bawah galeri)"
                  value={aboutTextValue('btl_closing_text', 'Setiap momen yang tertangkap adalah cerita yang terpelihara seumur hidup.')}
                  section="about_page"
                  field="btl_closing_text"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'btl_closing_text', value);
                    handleSave('Text penutup berhasil disimpan');
                  }}
                  onError={handleError}
                />
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

          {/* FOOTER PAGE */}
          <Show when={currentPage() === 'footer'}>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-8">Kelola Footer</h2>
              
              {/* Studio Information */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Informasi Studio</h3>
                <EditableText
                  label="Deskripsi Studio"
                  value={contentStore.getField('footer', 'studio_description') || 'Mengabadikan momen abadi bersama orang-orang terkasih. Kami percaya setiap momen memiliki cerita uniknya sendiri.'}
                  section="footer"
                  field="studio_description"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('footer', 'studio_description', value);
                    handleSave('Deskripsi studio berhasil disimpan');
                  }}
                  onError={handleError}
                />
              </div>

              {/* Footer Content */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Konten Footer</h3>
                <EditableText
                  label="Copyright Text"
                  value={contentStore.getField('footer', 'copyright_text') || '(c) 2026 Studio Photography. All rights reserved.'}
                  section="footer"
                  field="copyright_text"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('footer', 'copyright_text', value);
                    handleSave('Copyright berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Tagline"
                  value={contentStore.getField('footer', 'tagline') || 'Made with love for capturing moments'}
                  section="footer"
                  field="tagline"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('footer', 'tagline', value);
                    handleSave('Tagline berhasil disimpan');
                  }}
                  onError={handleError}
                />
              </div>

              {/* Contact Information */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Informasi Kontak</h3>
                <EditableText
                  label="Alamat Email"
                  value={contentStore.getField('footer', 'email') || 'info@studiophoto.com'}
                  section="footer"
                  field="email"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('footer', 'email', value);
                    handleSave('Email berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Nomor Telepon"
                  value={contentStore.getField('footer', 'phone') || '+62 (123) 456-7890'}
                  section="footer"
                  field="phone"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('footer', 'phone', value);
                    handleSave('Nomor telepon berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Alamat Fisik"
                  value={contentStore.getField('footer', 'address') || 'Jl. Studio No. 123, City, Country'}
                  section="footer"
                  field="address"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('footer', 'address', value);
                    handleSave('Alamat berhasil disimpan');
                  }}
                  onError={handleError}
                />
              </div>

              {/* Social Media Links */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Link Media Sosial</h3>
                <EditableText
                  label="Facebook URL"
                  value={contentStore.getField('footer', 'facebook_url') || 'https://www.facebook.com/dalban.speed.71/'}
                  section="footer"
                  field="facebook_url"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('footer', 'facebook_url', value);
                    handleSave('Facebook URL berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Instagram URL"
                  value={contentStore.getField('footer', 'instagram_url') || 'https://www.instagram.com/widymotretstudio/'}
                  section="footer"
                  field="instagram_url"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('footer', 'instagram_url', value);
                    handleSave('Instagram URL berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="WhatsApp URL"
                  value={contentStore.getField('footer', 'whatsapp_url') || 'https://api.whatsapp.com/send/?phone=62895351115777%3F&type=phone_number&app_absent=0'}
                  section="footer"
                  field="whatsapp_url"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('footer', 'whatsapp_url', value);
                    handleSave('WhatsApp URL berhasil disimpan');
                  }}
                  onError={handleError}
                />
              </div>

              {/* Quick Links */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Tautan Cepat</h3>
                <p class="text-sm text-gray-600 mb-6">Kelola link navigasi di bagian TAUTAN CEPAT di footer. Edit langsung, otomatis tersimpan saat Anda selesai mengetik.</p>
                
                <div class="space-y-6">
                  {['Home', 'Portfolio', 'Harga', 'Tentang', 'Hubungi'].map((label, idx) => {
                    const defaultUrls = ['/', '/#portfolio', '/', '/#about', '/#contact'];
                    return (
                      <div class="p-4 bg-white border border-gray-200 rounded-lg">
                        <h4 class="font-semibold text-gray-700 mb-3">{label}</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label class="block text-xs font-semibold text-gray-600 mb-2 uppercase">Label Tampil</label>
                            <input
                              type="text"
                              value={contentStore.getField('footer', `quick_link_${idx}_label`) || label}
                              onChange={(e) => contentStore.updateFieldLocal('footer', `quick_link_${idx}_label`, e.currentTarget.value)}
                              onBlur={(e) => {
                                updateContent('footer', `quick_link_${idx}_label`, e.currentTarget.value);
                                handleSave(`Label tautan "${label}" berhasil disimpan`);
                              }}
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#576250] text-sm"
                              placeholder="Misal: Halaman Utama"
                            />
                            <p class="text-xs text-gray-500 mt-1">Teks yang ditampilkan di footer</p>
                          </div>
                          <div>
                            <label class="block text-xs font-semibold text-gray-600 mb-2 uppercase">URL/Link</label>
                            <input
                              type="text"
                              value={contentStore.getField('footer', `quick_link_${idx}_url`) || defaultUrls[idx]}
                              onChange={(e) => contentStore.updateFieldLocal('footer', `quick_link_${idx}_url`, e.currentTarget.value)}
                              onBlur={(e) => {
                                updateContent('footer', `quick_link_${idx}_url`, e.currentTarget.value);
                                handleSave(`Link tautan "${label}" berhasil disimpan`);
                              }}
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#576250] text-sm font-mono"
                              placeholder="Misal: / atau /#portfolio atau https://..."
                            />
                            <p class="text-xs text-gray-500 mt-1">Gunakan / untuk halaman lokal, /#section untuk anchor, atau https://... untuk link eksternal</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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

      {/* Add Service Modal */}
      <Show when={showAddServiceModal()}>
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
          onClick={() => {
            setShowAddServiceModal(false);
            setServiceImageUploaded(false);
          }}
        >
          <div
            class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeInScale overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 class="text-2xl font-bold text-[#464C43] mb-6">{isEditingService() ? 'Edit Layanan' : 'Tambah Layanan Baru'}</h3>
            <div class="space-y-4">
              {/* Image Preview */}
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-semibold text-gray-700">Gambar Layanan</label>
                  <Show when={serviceImageUploaded()}>
                    <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      Uploaded
                    </span>
                  </Show>
                </div>
                <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 mb-3">
                  <img 
                    src={resolveMediaUrl(newServiceImage())} 
                    alt="Preview"
                    class="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = 'image/*';
                    fileInput.addEventListener('change', async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file) return;
                      
                      setUploadingServiceImage(true);
                      setServiceImageUploaded(false);
                      try {
                        const response = await uploadImageForPackage(file);
                        if (response.success && response.data?.url) {
                          setNewServiceImage(response.data.url);
                          setServiceImageUploaded(true);
                          handleSave('Gambar layanan berhasil diupload');
                        } else {
                          handleError(response.message || 'Upload gambar gagal');
                        }
                      } catch (err) {
                        handleError(err instanceof Error ? err.message : 'Gagal upload gambar');
                      } finally {
                        setUploadingServiceImage(false);
                      }
                    });
                    fileInput.click();
                  }}
                  disabled={uploadingServiceImage()}
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm disabled:opacity-60"
                >
                  {uploadingServiceImage() ? 'Uploading...' : 'Pilih Gambar'}
                </button>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Nama Layanan</label>
                <input
                  type="text"
                  value={newServiceName()}
                  onInput={(e) => setNewServiceName(e.currentTarget.value)}
                  placeholder="Contoh: Outdoor Photoshoot"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#576250]"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Slug (URL)</label>
                <input
                  type="text"
                  value={newServiceSlug()}
                  onInput={(e) => setNewServiceSlug(e.currentTarget.value)}
                  placeholder="Contoh: outdoor-photoshoot"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#576250]"
                />
                <p class="text-xs text-gray-500 mt-1">Gunakan huruf kecil dan strip (-) tanpa spasi</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                <textarea
                  value={newServiceDescription()}
                  onInput={(e) => setNewServiceDescription(e.currentTarget.value)}
                  placeholder="Deskripsi ringkas tentang layanan ini"
                  rows={3}
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#576250]"
                />
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddServiceModal(false);
                  setServiceImageUploaded(false);
                  setIsEditingService(false);
                  setEditingServiceSlug(null);
                }}
                class="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Batal
              </button>
              <button
                onClick={() => isEditingService() ? editService() : addNewService()}
                disabled={!newServiceName().trim() || !newServiceSlug().trim()}
                class="flex-1 py-3 px-4 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isEditingService() ? 'Simpan Perubahan' : 'Tambah Service'}
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Footer */}
      <footer class="bg-white border-t mt-auto py-4 px-6">
        <div class="container mx-auto text-center text-gray-500 text-sm">
          <p>(c) 2026 Widymotret Studio Admin Panel</p>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <ScrollToTop showThreshold={300} />
    </div>
  );
};

export default AdminHome;

