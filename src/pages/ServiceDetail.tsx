import { Component, For, Show, createSignal, createEffect, onMount } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { servicesData } from '../data/services';
import { contentStore } from '../stores/contentStore';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { useScrollReveal, useScrollRevealGroup } from '../hooks/useScrollReveal';
import '../styles/scroll-reveal.css';

interface ApiPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  features: string[];
  isPublished: boolean;
}

const ServiceDetail: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  
  // Scroll reveal refs
  const packagesTitleRef = useScrollReveal({ threshold: 0.3 });
  const packagesGridRef = useScrollRevealGroup({ threshold: 0.3, itemDelay: 80 });
  const detailSectionRef = useScrollReveal({ threshold: 0.2 });
  
  const service = () => servicesData.find(s => s.slug === params.slug);

  onMount(async () => {
    await contentStore.loadSection('service');
  });

  const serviceTitle = () => {
    const svc = service();
    if (!svc) return '';
    return contentStore.getField('service', `${svc.slug}_title`) || svc.title;
  };

  const serviceDescription = () => {
    const svc = service();
    if (!svc) return '';
    return contentStore.getField('service', `${svc.slug}_description`) || svc.description;
  };

  const serviceImage = () => {
    const svc = service();
    if (!svc) return '';
    return contentStore.getField('service', `${svc.slug}_image`) || svc.image;
  };

  // Determine WhatsApp number based on service type
  const getWhatsAppNumber = () => {
    const slug = params.slug?.toLowerCase() ?? '';
    const weddingServices = ['wedding', 'prewedding', 'engagement'];
    return weddingServices.includes(slug) 
      ? '62895632522949' 
      : '62895351115777';
  };

  const [packages, setPackages] = createSignal<ApiPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = createSignal<ApiPackage | null>(null);
  const [selectedIndex, setSelectedIndex] = createSignal<number | null>(null);
  const [isDetailVisible, setIsDetailVisible] = createSignal(false);
  const [galleryIndex, setGalleryIndex] = createSignal(0);
  const [isLoading, setIsLoading] = createSignal(true);
  const [loadError, setLoadError] = createSignal(false);

  const fallbackImages = [
    '/landscape/landscape (1).png',
    '/landscape/landscape (2).png',
    '/landscape/landscape (3).png',
    '/landscape/landscape (4).png',
  ];

  const getGalleryImages = (pkg: ApiPackage | null) => {
    if (pkg && Array.isArray(pkg.images) && pkg.images.length > 0) {
      return pkg.images;
    }
    return fallbackImages;
  };

  const categoryMap: Record<string, string> = {
    studio: 'studio',
    graduation: 'graduation',
    event: 'event',
    product: 'product',
    wedding: 'wedding',
    'studio-photoshoot': 'studio',
    'graduation-photoshoot': 'graduation',
    'event-photoshoot': 'event',
    'product-photography': 'product',
    'wedding-photography-videography': 'wedding',
  };

  const loadPackages = async () => {
    const slug = params.slug;
    if (!slug) return;

    setIsLoading(true);
    setLoadError(false);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://widymotret-be-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/packages`);
      if (!res.ok) throw new Error('API request failed');

      const data = await res.json();
      if (data.success) {
        const targetCategory = (categoryMap[slug] || slug).toLowerCase();
        const filtered = data.data.filter((p: ApiPackage) => p.category.toLowerCase() === targetCategory && p.isPublished);
        setPackages(filtered);
      }
    } catch (err) {
      console.error('Failed to load packages:', err);
      setPackages([]);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  createEffect(() => {
    loadPackages();
    setSelectedPackage(null);
    setSelectedIndex(null);
    setIsDetailVisible(false);
    setGalleryIndex(0);
  });

  // Clear storage when detail is closed
  const closeDetail = () => {
    setIsDetailVisible(false);
    setTimeout(() => {
      setSelectedPackage(null);
      setSelectedIndex(null);
    }, 300);
  };

  const handleCardClick = (pkg: ApiPackage, index: number) => {
    setSelectedPackage(pkg);
    setSelectedIndex(index);
    setIsDetailVisible(true);
    setGalleryIndex(0);

    // Smooth scroll ke detail section
    setTimeout(() => {
      const detailSection = document.getElementById('package-detail');
      if (detailSection) {
        detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Gallery navigation
  const nextImage = () => {
    const images = getGalleryImages(selectedPackage());
    setGalleryIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getGalleryImages(selectedPackage());
    setGalleryIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div class="min-h-screen bg-white">
      <Navbar />
      
      <Show when={!isLoading()} fallback={
        <div class="pt-32 pb-20 flex justify-center">
          <div class="animate-spin w-10 h-10 border-4 border-[#464C43] border-t-transparent rounded-full"></div>
        </div>
      }>
      <Show when={service()} fallback={
        <div class="pt-32 pb-20 px-6 text-center">
          <h1 class="text-4xl font-bold text-gray-800 mb-4">Service Not Found</h1>
          <button 
            onClick={() => navigate('/')}
            class="px-6 py-3 bg-[#464C43] text-white rounded-lg hover:bg-[#576250] transition"
          >
            Back to Home
          </button>
        </div>
      }>
        <div>
          {/* Hero Section - Compact */}
          <section class="relative h-[60vh] overflow-hidden">
            <img
              src={resolveMediaUrl(serviceImage())}
              alt={serviceTitle()}
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center pb-16">
              <div class="text-center text-white px-6">
                <h1 class="text-4xl md:text-5xl mb-3">{serviceTitle()}</h1>
                <p class="text-base md:text-lg max-w-2xl mx-auto opacity-90">{serviceDescription()}</p>
              </div>
            </div>
          </section>

          {/* Package Cards Grid */}
          <section class="py-16 px-6 bg-white">
            <div class="container mx-auto max-w-6xl">
              <div class="text-center mb-12 scroll-reveal" ref={packagesTitleRef}>
                <h2 class="text-3xl md:text-4xl text-[#464C43] mb-3">Pilih Paket</h2>
                <p class="text-gray-500">Klik untuk melihat detail dan benefit</p>
              </div>

              {/* Warning Banner - Unavailable */}
              <Show when={loadError() || (packages().length === 0 && !isLoading())}>
                <div class="mb-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg max-w-2xl mx-auto">
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 pt-0.5">
                      <svg class="w-6 h-6 text-yellow-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.981-1.742 2.981H4.42c-1.53 0-2.492-1.647-1.743-2.98l5.58-9.92zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-7a1 1 0 00-1 1v4a1 1 0 102 0V7a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-yellow-800 mb-1">Layanan Sementara Tidak Tersedia</h3>
                      <p class="text-yellow-700 text-sm mb-3">Server sedang dalam pemeliharaan. Silakan coba lagi dalam beberapa saat atau hubungi kami melalui WhatsApp untuk informasi lebih lanjut.</p>
                      <a 
                        href="https://wa.me/62895351115777?text=Halo,%20saya%20ingin%20menanyakan%20tentang%20paket%20layanan%20fotografi"
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

              {/* Image Cards Grid */}
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" ref={packagesGridRef}>
                <For each={packages()}>
                  {(pkg, index) => (
                    <div 
                      onClick={() => handleCardClick(pkg, index())}
                      class="group cursor-pointer scroll-reveal-item"
                    >
                      <div 
                        class="relative overflow-hidden rounded-xl shadow-lg transition-all duration-500 hover:shadow-2xl"
                        classList={{
                          'ring-4 ring-[#576250] ring-offset-2': selectedIndex() === index()
                        }}
                      >
                        {/* Card Image */}
                        <div class="aspect-[4/3] overflow-hidden">
                          <img
                            src={resolveMediaUrl(getGalleryImages(pkg)[0])}
                            alt={pkg.name}
                            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                        
                        {/* Gradient Overlay */}
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Card Content */}
                        <div class="absolute bottom-0 left-0 right-0 p-5 text-white">
                          <h3 class="text-xl md:text-2xl mb-1">{pkg.name}</h3>
                          <p class="text-sm opacity-80 mb-2">Mulai dari</p>
                          <p class="text-xl md:text-2xl font-bold text-[#B8C4A8]">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pkg.price)}</p>
                        </div>

                        {/* Hover Indicator */}
                        <div class="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </section>

          {/* Package Detail Section - Hidden by default */}
          <section 
            id="package-detail"
            class="overflow-hidden transition-all duration-500 ease-out"
            style={{
              'max-height': isDetailVisible() ? '2000px' : '0px',
              opacity: isDetailVisible() ? 1 : 0,
            }}
          >
            <Show when={selectedPackage()}>
              <div class="bg-[#FAFAFA] py-16 px-6">
                <div class="container mx-auto max-w-6xl">
                  {/* Close Button */}
                  <div class="flex justify-end mb-6">
                    <button 
                      onClick={closeDetail}
                      class="text-gray-500 hover:text-gray-700 transition flex items-center gap-2"
                    >
                      <span>Tutup Detail</span>
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 scroll-reveal" ref={detailSectionRef}>
                    {/* Left - Gallery Slider */}
                    <div class="relative">
                      <div class="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                        <img
                          src={resolveMediaUrl(getGalleryImages(selectedPackage())[galleryIndex()])}
                          alt={`Gallery ${galleryIndex() + 1}`}
                          class="w-full h-full object-cover transition-opacity duration-300"
                        />
                      </div>
                      
                      {/* Gallery Navigation */}
                      <button
                        onClick={prevImage}
                        class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition"
                      >
                        <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition"
                      >
                        <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      {/* Gallery Dots */}
                      <div class="flex justify-center gap-2 mt-4">
                        <For each={getGalleryImages(selectedPackage())}>
                          {(_, idx) => (
                            <button
                              onClick={() => setGalleryIndex(idx())}
                              class="w-2 h-2 rounded-full transition-all duration-300"
                              classList={{
                                'bg-[#464C43] w-6': galleryIndex() === idx(),
                                'bg-gray-300 hover:bg-gray-400': galleryIndex() !== idx()
                              }}
                            />
                          )}
                        </For>
                      </div>

                      {/* Thumbnail Strip */}
                      <div class="flex gap-2 mt-4 justify-center">
                        <For each={getGalleryImages(selectedPackage())}>
                          {(img, idx) => (
                            <button
                              onClick={() => setGalleryIndex(idx())}
                              class="w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300"
                              classList={{
                                'border-[#464C43] opacity-100': galleryIndex() === idx(),
                                'border-transparent opacity-60 hover:opacity-100': galleryIndex() !== idx()
                              }}
                            >
                              <img src={resolveMediaUrl(img)} alt="" class="w-full h-full object-cover" />
                            </button>
                          )}
                        </For>
                      </div>
                    </div>

                    {/* Right - Package Info */}
                    <div class="flex flex-col">
                      {/* Package Header */}
                      <div class="mb-6">
                        <p class="text-sm text-[#576250] uppercase tracking-wider mb-2">Paket Terpilih</p>
                        <h3 class="text-3xl md:text-4xl text-[#464C43] mb-2">{selectedPackage()!.name}</h3>
                        <p class="text-gray-600 italic">{selectedPackage()!.description}</p>
                      </div>

                      {/* Price */}
                      <div class="bg-white rounded-xl p-6 shadow-sm mb-6">
                        <p class="text-sm text-gray-500 mb-1">Harga</p>
                        <p class="text-3xl font-bold text-[#576250]">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedPackage()!.price)}</p>
                      </div>

                      {/* Benefits */}
                      <div class="flex-1 mb-8">
                        <h4 class="text-lg font-medium text-[#464C43] mb-4">Yang Anda Dapatkan:</h4>
                        <ul class="space-y-3">
                          <For each={selectedPackage()!.features}>
                            {(feature) => (
                              <li class="flex items-start gap-3">
                                <div class="w-6 h-6 rounded-full bg-[#576250]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <svg class="w-4 h-4 text-[#576250]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                  </svg>
                                </div>
                                <span class="text-gray-700">{feature}</span>
                              </li>
                            )}
                          </For>
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <a 
                        href={`https://wa.me/${getWhatsAppNumber()}?text=Halo,%20saya%20tertarik%20dengan%20paket%20${encodeURIComponent(selectedPackage()!.name)}%20dari%20layanan%20${encodeURIComponent(serviceTitle())}.%20Bisa%20minta%20informasi%20lebih%20lanjut?`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="w-full py-4 bg-[#464C43] text-white rounded-xl hover:bg-[#576250] transition font-medium text-center flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                      >
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Booking via WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Show>
          </section>

          {/* All Packages Quick View */}
          <Show when={packages().length > 1}>
            <section class="py-16 px-6 bg-white">
              <div class="container mx-auto max-w-4xl">
                <h3 class="text-2xl text-[#464C43] text-center mb-8">Perbandingan Semua Paket</h3>
                <div class="overflow-x-auto">
                  <table class="w-full border-collapse">
                    <thead>
                      <tr class="border-b-2 border-[#464C43]">
                        <th class="text-left py-4 px-4 text-[#464C43]">Paket</th>
                        <th class="text-right py-4 px-4 text-[#464C43]">Harga</th>
                        <th class="text-center py-4 px-4 text-[#464C43]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={packages()}>
                        {(pkg, index) => (
                          <tr 
                            class="border-b border-gray-200 hover:bg-gray-50 transition"
                            classList={{
                              'bg-[#576250]/5': selectedIndex() === index()
                            }}
                          >
                            <td class="py-4 px-4">
                              <p class="font-medium text-gray-800">{pkg.name}</p>
                              <p class="text-sm text-gray-500">{pkg.features.length} benefit</p>
                            </td>
                            <td class="py-4 px-4 text-right">
                              <p class="font-bold text-[#576250]">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pkg.price)}</p>
                            </td>
                            <td class="py-4 px-4 text-center">
                              <button
                                onClick={() => handleCardClick(pkg, index())}
                                class="px-4 py-2 text-sm bg-[#464C43] text-white rounded-lg hover:bg-[#576250] transition"
                              >
                                Lihat Detail
                              </button>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </Show>

          {/* Back Button */}
          <section class="py-12 px-6 bg-[#FAFAFA] text-center">
            <button 
              onClick={() => navigate('/')}
              class="px-6 py-3 bg-[#464C43] text-white rounded-lg hover:bg-[#576250] transition font-medium inline-flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Beranda
            </button>
          </section>
        </div>
      </Show>
      </Show>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTop showThreshold={400} />
    </div>
  );
};

export default ServiceDetail;
