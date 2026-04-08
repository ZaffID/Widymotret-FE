import { Component, createSignal, createMemo, For, Show, createEffect, onMount } from 'solid-js';
import { useSearchParams } from '@solidjs/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import ScrollToTop from '../components/ScrollToTop';
import { GalleryModal } from '../components/portfolio/GalleryModal';
import { portfolioImages, getImagesByCategory, PortfolioImage } from '../data/portfolio';
import { contentStore } from '../stores/contentStore';
import { resolveMediaUrl } from '../utils/mediaUrl';
import './Portfolio.css';

interface PortfolioCategory {
  id?: number;
  name: string;
  slug: string;
  description: string;
  tagExample?: string;
  examplePhotoUrl?: string;
}

const Portfolio: Component = () => {
  const API_BASE = `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://widymotret-be-production-00a0.up.railway.app'}/api`;
  const [searchParams] = useSearchParams();
  const [portfolioCategories, setPortfolioCategories] = createSignal<PortfolioCategory[]>([]);
  const [activeCategory, setActiveCategory] = createSignal<string>('portrait');
  const [selectedImageIndex, setSelectedImageIndex] = createSignal<number | null>(null);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [isContactModalOpen, setIsContactModalOpen] = createSignal(false);
  const [loadError, setLoadError] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(true);

  // Check BE health and load all portfolio data on mount
  const fetchCategories = async () => {
    try {
      console.log('[Portfolio] Fetching categories from API...');
      const catRes = await fetch(`${API_BASE}/portfolio-categories`);
      if (!catRes.ok) throw new Error('Failed to fetch categories');
      const catData = await catRes.json();
      
      if (catData.success && Array.isArray(catData.data)) {
        console.log('[Portfolio] Categories fetched:', catData.data);
        // Sort categories by createdAt ascending (oldest first, newest last)
        const sortedCategories = [...catData.data].sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateA - dateB;
        });
        setPortfolioCategories(sortedCategories);
        // Set first category as active if available
        if (sortedCategories.length > 0 && !activeCategory()) {
          setActiveCategory(sortedCategories[0].slug);
        }
      } else {
        console.warn('[Portfolio] No categories found in response');
      }
      setLoadError(false);
    } catch (err) {
      console.error('[Portfolio] Failed to fetch categories:', err);
      setLoadError(true);
    }
  };

  onMount(async () => {
    setIsLoading(true);
    try {
      await fetchCategories();

      // Try fetch from BE - if fails, show warning
      const res = await fetch(`${API_BASE}/packages`, { method: 'HEAD' });
      if (!res.ok) throw new Error('BE unavailable');

      // Load portfolio section - gets ALL fields including new items added by admin
      await contentStore.loadSection('portfolio');
      console.log('[Portfolio] Loaded all portfolio fields from backend');

      // Re-fetch categories every 3 seconds to sync tag changes
      const interval = setInterval(() => {
        console.log('[Portfolio] Auto-refreshing categories...');
        fetchCategories();
      }, 3000);

      return () => clearInterval(interval);
    } catch (err) {
      console.error('Backend unavailable:', err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  });

  // Category filter initialization
  createEffect(() => {
    const category = searchParams.category as 'portrait' | 'event' | 'editorial' | 'retouching' | undefined;
    if (category && ['portrait', 'event', 'editorial', 'retouching'].includes(category)) {
      setActiveCategory(category);
    }
  });

  // Get images for active category (defaults + any new items from backend)
  const currentImages = createMemo(() => {
    const category = activeCategory();
    
    // Get default images
    const defaultImages = getImagesByCategory(category);
    
    // Get all portfolio fields for this category from contentStore
    const allFields = contentStore.getSectionFields('portfolio');
    const categoryFields = allFields.filter(f => f.field.startsWith(`${category}_`));
    
    // Start with defaults
    const allImages = [...defaultImages];
    
    // Add any new items that aren't in defaults
    categoryFields.forEach(field => {
      if (field.field.startsWith(`${category}_new_`)) {
        const id = field.field.replace(`${category}_`, '');
        const value = field.value;
        if (value && !allImages.find(img => img.id === id)) {
          allImages.push({
            id,
            url: value,
            category: category as any,
            title: `Photo #${id}`,
          });
        }
      }
    });
    
    // Map to get saved values from contentStore
    return allImages.map((img) => {
      const fieldName = `${category}_${img.id}`;
      const savedValue = contentStore.getField('portfolio', fieldName);
      
      // Get label from DB tagExample, replace #X with actual index
      const getImageLabel = () => {
        const dbCategory = portfolioCategories().find(c => c.slug === category);
        if (!dbCategory?.tagExample) return img.title;
        // tagExample format: "Wedding #X" - replace X with index
        const allCategoryImages = allImages;
        const imageIndex = allCategoryImages.findIndex(i => i.id === img.id);
        return dbCategory.tagExample.replace(/#X$/i, `#${imageIndex + 1}`);
      };
      
      return {
        ...img,
        url: resolveMediaUrl(savedValue || img.url),
        title: getImageLabel(),
      } as PortfolioImage;
    });
  });

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImageIndex(null);
  };

  // Stats from contentStore (editable in admin)
  const happyClients = createMemo(() => 
    contentStore.getField('portfolio', 'happy_clients') || '500+'
  );

  const yearsExperience = createMemo(() => 
    contentStore.getField('portfolio', 'years_experience') || '5+'
  );

  // Count total photos from ALL categories in admin tab portfolio (keseluruhan foto)
  const totalPhotosCount = createMemo(() => {
    // Depend on lastUpdated to ensure memo re-runs when refresh button clicked
    const _refreshTrigger = contentStore.state().lastUpdated?.getTime() || 0;
    
    const allFields = contentStore.getSectionFields('portfolio');
    let totalCount = 0;
    
    // Count all images for each category (ALL fields, not just defaults+new)
    portfolioCategories().forEach(cat => {
      const categorySlug = cat.slug;
      // Count ALL fields for this category that have values (portrait_p1, portrait_p2, portrait_new_1, etc)
      const categoryImages = allFields.filter(f => 
        f.field.startsWith(`${categorySlug}_`) && 
        f.value && 
        !f.field.endsWith('_count') // exclude meta fields
      );
      totalCount += categoryImages.length;
    });
    
    // Return string without '+', will add '+' in display template if > 31
    return totalCount > 31 ? '31' : totalCount.toString();
  });

  // Get categories count from contentStore (actual DB value, with fallback to actual count)
  const categoriesCount = createMemo(() => {
    // Depend on lastUpdated to ensure memo re-runs when refresh button clicked
    const _refreshTrigger = contentStore.state().lastUpdated?.getTime() || 0;
    
    const fromStore = contentStore.getField('portfolio', 'categories');
    const actualCount = portfolioCategories().length.toString();
    
    // If store has value, validate it's reasonable (not 0, not negative)
    if (fromStore && parseInt(fromStore) > 0) {
      return fromStore;
    }
    
    // Fallback to actual portfolio categories length
    return actualCount;
  });

  return (
    <div class="wm-brand-page min-h-screen bg-white">
      <Navbar />

      {/* Hero Section - Similar to ServiceDetail */}
      <section class="relative h-[60vh] overflow-hidden">
        <img
          src={resolveMediaUrl(contentStore.getField('portfolio', 'hero_image') || '/landscape/landscape (1).png')}
          alt="Portfolio"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center pb-16">
          <div class="text-center text-white px-6">
            <h1 class="text-3xl md:text-4xl mb-3 font-bold">Our Portfolio</h1>
            <p class="text-base md:text-lg max-w-2xl mx-auto opacity-90">Jelajahi koleksi karya terbaik kami dari berbagai kategori fotografi</p>
          </div>
        </div>
      </section>

      {/* Category Tabs - Horizontal Scroll */}
      <section class="py-8 px-6 bg-white shadow-sm">
        <div class="container mx-auto max-w-6xl">
          <div class="portfolio-category-tabs overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {/* Horizontal Scroll Buttons - All Screen Sizes */}
            <div class="flex gap-2 pb-2 w-max min-w-full justify-center mx-auto">
              <For each={portfolioCategories()}>
                {(category) => (
                  <button
                    onClick={() => setActiveCategory(category.slug)}
                    class="px-4 md:px-6 py-2 rounded-lg font-medium transition-all duration-300 text-xs md:text-sm whitespace-nowrap flex-shrink-0"
                    classList={{
                      'bg-[#576250] text-white shadow-md': activeCategory() === category.slug,
                      'bg-gray-200 text-gray-700 hover:bg-gray-300': activeCategory() !== category.slug,
                    }}
                  >
                    {category.name}
                  </button>
                )}
              </For>
            </div>
          </div>

          {/* Category Description */}
          <div class="w-full text-center mt-6">
            <h2 class="text-xl font-bold text-gray-800 mb-2 inline-block">
              {portfolioCategories().find(c => c.slug === activeCategory())?.name}
            </h2>
            <p class="text-gray-600 inline-block w-full">
              {portfolioCategories().find(c => c.slug === activeCategory())?.description}
            </p>
          </div>
        </div>
      </section>

      {/* Image Grid */}
      <section class="py-16 px-6 bg-white">
        <div class="container mx-auto max-w-6xl">
          {/* Warning Banner - Server Error */}
          <Show when={loadError()}>
            <div class="mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg max-w-2xl mx-auto">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 pt-0.5">
                  <svg class="w-6 h-6 text-yellow-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.981-1.742 2.981H4.42c-1.53 0-2.492-1.647-1.743-2.98l5.58-9.92zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-7a1 1 0 00-1 1v4a1 1 0 102 0V7a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-yellow-800 mb-1">Galeri Sementara Tidak Tersedia</h3>
                  <p class="text-yellow-700 text-sm mb-3">Server sedang dalam pemeliharaan. Silakan coba lagi dalam beberapa saat atau hubungi kami melalui WhatsApp untuk informasi lebih lanjut.</p>
                  <a 
                    href="https://wa.me/62895351115777?text=Halo,%20saya%20ingin%20melihat%20portfolio%20terbaru"
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm font-medium"
                  >
                    Hubungi via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </Show>

          {/* Warning Banner - No Images for Category */}
          <Show when={!loadError() && currentImages().length === 0}>
            <div class="mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg max-w-2xl mx-auto">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 pt-0.5">
                  <svg class="w-6 h-6 text-yellow-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.981-1.742 2.981H4.42c-1.53 0-2.492-1.647-1.743-2.98l5.58-9.92zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-7a1 1 0 00-1 1v4a1 1 0 102 0V7a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-yellow-800 mb-1">Tidak Ada Foto</h3>
                  <p class="text-yellow-700 text-sm">Kategori ini belum memiliki foto. Silakan pilih kategori lain atau hubungi kami untuk info lebih lanjut.</p>
                </div>
              </div>
            </div>
          </Show>

          <Show when={!loadError()}>
            {/* Instagram-style vertical feed */}
            <div class="max-w-3xl mx-auto space-y-6">
              <For each={currentImages()}>
                {(image, index) => (
                  <button
                    type="button"
                    class="w-full overflow-hidden rounded-lg bg-gray-100 text-left"
                    onClick={() => handleImageClick(index())}
                  >
                    <img
                      src={image.url}
                      alt={image.title}
                      loading="lazy"
                      class="w-full h-auto object-cover"
                    />
                    <div class="px-4 py-3 bg-white">
                      <p class="text-sm md:text-base text-gray-800">{image.title}</p>
                    </div>
                  </button>
                )}
              </For>
            </div>
          </Show>

        </div>
      </section>

      {/* Stats Section - Only Total Photos & Categories (No Title) */}
      <section class="py-16 px-6 bg-gray-50">
        <div class="container mx-auto max-w-6xl">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div class="text-center">
              <div class="text-4xl font-bold text-[#576250] mb-2">
                {totalPhotosCount()}{parseInt(totalPhotosCount()) > 31 ? '' : '+'}
              </div>
              <p class="text-gray-600 text-sm">Total Photos</p>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-[#576250] mb-2">
                {categoriesCount()}
              </div>
              <p class="text-gray-600 text-sm">Categories</p>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-[#576250] mb-2">
                {happyClients()}
              </div>
              <p class="text-gray-600 text-sm">Happy Clients</p>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-[#576250] mb-2">
                {yearsExperience()}
              </div>
              <p class="text-gray-600 text-sm">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section class="py-20 px-6 bg-[#464C43]">
        <div class="container mx-auto max-w-4xl text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
            Suka dengan karya kami?
          </h2>
          <p class="text-xl text-white/80 mb-8">
            Mari kita ciptakan momen istimewa Anda bersama tim Widymotret
          </p>
          <button 
            onClick={() => setIsContactModalOpen(true)}
            class="px-8 py-4 bg-white text-[#464C43] rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            Hubungi Kami
          </button>
        </div>
      </section>

      {/* Gallery Modal */}
      <Show when={selectedImageIndex() !== null}>
        <GalleryModal
          isOpen={isModalOpen()}
          images={currentImages()}
          initialIndex={selectedImageIndex() ?? 0}
          onClose={handleCloseModal}
        />
      </Show>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />

      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTop showThreshold={400} />
    </div>
  );
};

export default Portfolio;

