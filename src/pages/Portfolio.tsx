import { Component, createSignal, createMemo, For, Show, createEffect, onMount } from 'solid-js';
import { useSearchParams } from '@solidjs/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import { GalleryModal } from '../components/portfolio/GalleryModal';
import { portfolioCategories, portfolioImages, getImagesByCategory, PortfolioImage } from '../data/portfolio';
import { useScrollRevealGroup } from '../hooks/useScrollReveal';
import '../styles/scroll-reveal.css';
import './Portfolio.css';

const Portfolio: Component = () => {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = createSignal<'portrait' | 'event' | 'editorial' | 'retouching'>('portrait');
  const [selectedImageIndex, setSelectedImageIndex] = createSignal<number | null>(null);
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [isContactModalOpen, setIsContactModalOpen] = createSignal(false);
  const [loadError, setLoadError] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(true);

  // Check BE health on mount
  onMount(async () => {
    setIsLoading(true);
    try {
      // Try fetch from BE - if fails, show warning
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/packages`, { method: 'HEAD' });
      if (!res.ok) throw new Error('BE unavailable');
      setLoadError(false);
    } catch (err) {
      console.error('Backend unavailable:', err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  });

  // Scroll reveal ref for image grid
  const portfolioGridRef = useScrollRevealGroup({ threshold: 0.3, itemDelay: 80 });

  // Read category from query parameter
  createEffect(() => {
    const category = searchParams.category as 'portrait' | 'event' | 'editorial' | 'retouching' | undefined;
    if (category && ['portrait', 'event', 'editorial', 'retouching'].includes(category)) {
      setActiveCategory(category);
    }
  });

  // Get images for active category
  const currentImages = createMemo(() => {
    return getImagesByCategory(activeCategory());
  });

  // Reset animation when category changes
  createEffect(() => {
    currentImages(); // Dependency on images
    
    // Reset animation state untuk items baru
    queueMicrotask(() => {
      const items = document.querySelectorAll('.scroll-reveal-item');
      items.forEach(item => {
        item.classList.remove('reveal-visible');
        item.classList.add('scroll-reveal-hidden');
      });
      console.log('[Portfolio] Animation reset for new category');
      
      // Manually trigger animation if container is visible
      const container = document.querySelector('.grid[class*="gap-6"]');
      if (container) {
        const rect = container.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible) {
          // Container visible - manually animate
          console.log('[Portfolio] Container visible, trigger animation manually');
          items.forEach((item: any, index: number) => {
            const delay = index * 80;
            item.style.setProperty('--reveal-delay', `${delay}ms`);
            item.style.setProperty('--reveal-duration', '800ms');
            item.classList.remove('scroll-reveal-hidden');
            item.classList.add('reveal-visible');
          });
        }
      }
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

  return (
    <div class="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section - Similar to ServiceDetail */}
      <section class="relative h-[60vh] overflow-hidden">
        <img
          src="/landscape/landscape (1).png"
          alt="Portfolio"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center pb-16">
          <div class="text-center text-white px-6">
            <h1 class="text-4xl md:text-5xl mb-3 font-bold">Our Portfolio</h1>
            <p class="text-base md:text-lg max-w-2xl mx-auto opacity-90">Jelajahi koleksi karya terbaik kami dari berbagai kategori fotografi</p>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section class="py-8 px-6 bg-white shadow-sm">
        <div class="container mx-auto max-w-6xl">
          <div class="flex flex-wrap gap-3 justify-center md:justify-start">
            <For each={portfolioCategories}>
              {(category) => (
                <button
                  onClick={() => setActiveCategory(category.slug)}
                  class="px-6 py-2 rounded-lg font-medium transition-all duration-300 text-sm md:text-base"
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

          {/* Category Description */}
          <div class="text-center mt-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">
              {portfolioCategories.find(c => c.slug === activeCategory())?.name}
            </h2>
            <p class="text-gray-600">
              {portfolioCategories.find(c => c.slug === activeCategory())?.description}
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
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" ref={portfolioGridRef}>
            <For each={currentImages()}>
              {(image, index) => (
                <div 
                  class="group relative overflow-hidden rounded-lg cursor-pointer w-full h-80 bg-gray-100 scroll-reveal-item scroll-reveal-hidden"
                  onClick={() => handleImageClick(index())}
                >
                  {/* Image */}
                  <img
                    src={image.url}
                    alt={image.title}
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 class="text-white font-medium text-sm md:text-base mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {image.title}
                    </h3>
                    <div class="flex items-center gap-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 13H7" />
                      </svg>
                      <span>Click to view</span>
                    </div>
                  </div>

                  {/* Corner Icon */}
                  <div class="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-4l6-6m0 0H9m7 0v7" />
                    </svg>
                  </div>
                </div>
              )}
            </For>
            </div>
          </Show>

        </div>
      </section>

      {/* Stats Section */}
      <section class="py-16 px-6 bg-gray-50">
        <div class="container mx-auto max-w-6xl">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div class="text-center">
              <div class="text-4xl font-bold text-[#576250] mb-2">
                {portfolioImages.length}+
              </div>
              <p class="text-gray-600">Total Photos</p>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-[#576250] mb-2">
                {portfolioCategories.length}
              </div>
              <p class="text-gray-600">Categories</p>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-[#576250] mb-2">
                500+
              </div>
              <p class="text-gray-600">Happy Clients</p>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-[#576250] mb-2">
                5+
              </div>
              <p class="text-gray-600">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section class="py-20 px-6 bg-[#464C43]">
        <div class="container mx-auto max-w-4xl text-center">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
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
    </div>
  );
};

export default Portfolio;
