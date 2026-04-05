import { Component, createSignal, For, createMemo, createEffect, Show, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import Navbar from '../components/Navbar';
import PriceList from '../components/PriceList';
import ImageCarousel from '../components/ImageCarousel';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import ScrollToTop from '../components/ScrollToTop';
import { servicesData } from '../data/services';
import { contentStore } from '../stores/contentStore';
import { useScrollReveal, useScrollRevealGroup } from '../hooks/useScrollReveal';
import '../styles/scroll-reveal.css';
import { AiTwotonePhone, AiTwotoneMail, AiTwotoneCheckCircle } from 'solid-icons/ai';
import { IoLocationOutline } from 'solid-icons/io';
import { BsInstagram } from 'solid-icons/bs';
import { resolveMediaUrl } from '../utils/mediaUrl';

const Home: Component = () => {
  const navigate = useNavigate();
  const [currentPortraitIndex, setCurrentPortraitIndex] = createSignal(0);
  const [isPriceListOpen, setIsPriceListOpen] = createSignal(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = createSignal(false);
  const [isContactModalOpen, setIsContactModalOpen] = createSignal(false);
  const [allServices, setAllServices] = createSignal<Array<{ slug: string; title: string; description: string; image: string }>>(servicesData);

  // Scroll reveal refs for each section
  const introRef = useScrollReveal({ threshold: 0.5 });
  const servicesRef = useScrollReveal({ threshold: 0.5 });
  const bookingTitleRef = useScrollReveal({ threshold: 0.5 });
  const bookingItemsRef = useScrollRevealGroup({ threshold: 0.5, itemDelay: 100 });
  const portfolioGridRef = useScrollRevealGroup({ threshold: 0.5, itemDelay: 80 });
  const contactRef = useScrollReveal({ threshold: 0.5 });
  const ctaRef = useScrollReveal({ threshold: 0.5 });

  // Helper: fetch dari contentStore, fallback ke mock data
  const t = (section: string, field: string, fallback: string): string =>
    contentStore.getField(section, field) || fallback;

  const serviceImage = (slug: string, fallback: string): string =>
    resolveMediaUrl(contentStore.getField('service', `${slug}_image`) || fallback);

  const serviceTitle = (slug: string, fallback: string): string =>
    contentStore.getField('service', `${slug}_title`) || fallback;

  // Load all services: hardcoded + API-fetched from packages
  const loadServices = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://widymotret-be-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/packages`);
      
      if (!res.ok) throw new Error(`Failed to fetch packages: ${res.status}`);
      
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Build: hardcoded + unique categories from API
        const servicesMap = new Map(servicesData.map(s => [s.slug, { 
          slug: s.slug, 
          title: s.title, 
          description: s.description, 
          image: s.image 
        }]));
        
        // Add API categories not in hardcoded
        data.data.forEach((pkg: any) => {
          const category = pkg.category?.toLowerCase();
          if (category && !servicesMap.has(category)) {
            servicesMap.set(category, {
              slug: category,
              title: category.charAt(0).toUpperCase() + category.slice(1),
              description: 'Layanan fotografi',
              image: '/photography.png'
            });
          }
        });
        
        setAllServices(Array.from(servicesMap.values()));
      } else {
        setAllServices(servicesData);
      }
    } catch (err) {
      console.error('[Home] Error loading services:', err);
      setAllServices(servicesData);
    }
  };

  onMount(async () => {
    await Promise.all([
      contentStore.loadSection('hero'),
      contentStore.loadSection('introduction'),
      contentStore.loadSection('services'),
      contentStore.loadSection('booking'),
      contentStore.loadSection('testimonials'),
      contentStore.loadSection('settings'),
      contentStore.loadSection('home'),
      contentStore.loadSection('featured'),
      contentStore.loadSection('service'),
      contentStore.loadSection('portfolio'),
    ]);
    // Load services after content store is ready
    await loadServices();
  });

  
  const defaultCarouselImages = [
    '/home (1).png',
    '/home (2).jpg',
    '/home (3).jpg',
    '/home (4).jpg',
  ];

  const homeCarouselImages = createMemo(() => [
    resolveMediaUrl(contentStore.getField('hero', 'carousel_0') || defaultCarouselImages[0]),
    resolveMediaUrl(contentStore.getField('hero', 'carousel_1') || defaultCarouselImages[1]),
    resolveMediaUrl(contentStore.getField('hero', 'carousel_2') || defaultCarouselImages[2]),
    resolveMediaUrl(contentStore.getField('hero', 'carousel_3') || defaultCarouselImages[3]),
  ]);
  
  const defaultPortraitImages = [
    '/portrait/portrait (1).png',
    '/portrait/portrait (2).png',
    '/portrait/portrait (3).png',
    '/portrait/portrait (4).png',
    '/portrait/portrait (5).png',
  ];

  const portraitImages = createMemo(() => [
    resolveMediaUrl(contentStore.getField('featured', 'portrait_0') || defaultPortraitImages[0]),
    resolveMediaUrl(contentStore.getField('featured', 'portrait_1') || defaultPortraitImages[1]),
    resolveMediaUrl(contentStore.getField('featured', 'portrait_2') || defaultPortraitImages[2]),
    resolveMediaUrl(contentStore.getField('featured', 'portrait_3') || defaultPortraitImages[3]),
    resolveMediaUrl(contentStore.getField('featured', 'portrait_4') || defaultPortraitImages[4]),
  ]);

  const defaultPortfolioImages = [
    { image: '/portrait/portrait (1).png', category: 'Portrait Photography', slug: 'portrait', name: 'Studio Portrait Session #1' },
    { image: '/landscape/landscape (1).png', category: 'Event and Wedding Coverage', slug: 'event', name: 'Wedding Ceremony Moments' },
    { image: '/landscape/landscape (2).png', category: 'Editorial and Brand Shots', slug: 'editorial', name: 'Brand Campaign #1' },
    { image: '/portrait/portrait (2).png', category: 'Image Retouching and Editing', slug: 'retouching', name: 'Professional Editing Results' },
  ];

  const portfolioPrimaryFieldBySlug: Record<string, string> = {
    portrait: 'portrait_p1',
    event: 'event_e1',
    editorial: 'editorial_ed1',
    retouching: 'retouching_r1',
  };

  const portfolioImages = createMemo(() => 
    defaultPortfolioImages.map((item, idx) => ({
      ...item,
      image: resolveMediaUrl(
        contentStore.getField('portfolio', portfolioPrimaryFieldBySlug[item.slug]) ||
        contentStore.getField('home', `portfolio_grid_${idx}`) ||
        item.image
      ),
      category: contentStore.getField('home', `portfolio_grid_category_${idx}`) || item.category
    }))
  );

  const testimonials = createMemo(() => {
    const testi: Array<{ quote: string; author: string; avatar: string }> = [];
    for (let i = 1; i <= 7; i++) {
      const quote = contentStore.getField('testimonials', `quote${i}`);
      const author = contentStore.getField('testimonials', `author${i}`);
      if (quote && author) {
        testi.push({
          quote,
          author,
          avatar: `/portrait/portrait (${i}).png`,
        });
      }
    }
    return testi.length > 0 ? testi : [
      {
        quote: 'Cara kalian menangkap momen hari kami sungguh luar biasa. Setiap foto adalah harta karun.',
        author: 'Racheal and Tim',
        avatar: '/portrait/portrait (1).png',
      },
    ];
  });

  // Single testimonial carousel state
  const [testiIndex, setTestiIndex] = createSignal(0);
  const [testiAnimate, setTestiAnimate] = createSignal(false);
  const [showPortfolioInfo, setShowPortfolioInfo] = createSignal<string | null>(null);
  const [isAnimatingPortrait, setIsAnimatingPortrait] = createSignal(false);
  let serviceScrollContainer!: HTMLDivElement;
  
  const nextTesti = () => setTestiIndex((p) => (p + 1) % testimonials().length);
  const prevTesti = () => setTestiIndex((p) => (p - 1 + testimonials().length) % testimonials().length);

  // Handle portfolio click - show info on first click (mobile), navigate on second click
  const handlePortfolioClick = (slug: string) => {
    if (window.innerWidth < 768) {
      // Mobile: first click shows info
      setShowPortfolioInfo(slug);
      setTimeout(() => {
        // Auto-hide after 1 second if not clicked
        if (showPortfolioInfo() === slug) {
          // Will be overridden on second click
        }
      }, 300);
    }
  };

  const handlePortfolioNavigate = (slug: string) => {
    navigate(`/portfolio?category=${slug}`);
  };

  // Trigger animation on testimonial change
  createEffect(() => {
    testiIndex();
    setTestiAnimate(true);
    const timer = setTimeout(() => setTestiAnimate(false), 500);
    return () => clearTimeout(timer);
  });

  const nextPortrait = () => {
    if (isAnimatingPortrait()) return;
    setIsAnimatingPortrait(true);
    setCurrentPortraitIndex((prev) => (prev + 1) % portraitImages().length);
    setTimeout(() => setIsAnimatingPortrait(false), 500);
  };

  const prevPortrait = () => {
    if (isAnimatingPortrait()) return;
    setIsAnimatingPortrait(true);
    setCurrentPortraitIndex((prev) => (prev - 1 + portraitImages().length) % portraitImages().length);
    setTimeout(() => setIsAnimatingPortrait(false), 500);
  };

  const getPrevIndex = createMemo(() => {
    return (currentPortraitIndex() - 1 + portraitImages().length) % portraitImages().length;
  });

  const getNextIndex = createMemo(() => {
    return (currentPortraitIndex() + 1) % portraitImages().length;
  });

  return (
    <div class="min-h-screen bg-white">
      <style>{`
        .service-scroll-container {
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: #464C43 #f0f0f0;
        }
        
        .service-scroll-container::-webkit-scrollbar {
          height: 6px;
        }
        
        .service-scroll-container::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 3px;
        }
        
        .service-scroll-container::-webkit-scrollbar-thumb {
          background: #464C43;
          border-radius: 3px;
        }
        
        .service-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #576250;
        }
      `}</style>
      <Navbar />
      {/* PriceList modal masih ada tapi tidak diakses dari navbar */}
      <PriceList 
        isOpen={isPriceListOpen} 
        onClose={() => setIsPriceListOpen(false)} 
      />

      {/* Hero Section with Auto-Carousel */}
      <section class="relative h-screen flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 z-0">
          <ImageCarousel images={homeCarouselImages()} autoPlayInterval={5000} />
        </div>
        <div class="relative z-10 text-center px-6 max-w-4xl">
          <h1 class="text-5xl md:text-6xl text-white drop-shadow-lg mb-6">
            {t('hero', 'title', 'Setiap Momen Punya Cerita')}
          </h1>
          <p class="text-lg md:text-xl text-white drop-shadow-md leading-relaxed">
            {t('hero', 'subtitle', 'Kami mengabadikan momen melalui foto dan video dengan pendekatan yang sederhana, rapi, dan penuh perhatian pada detail.')}
          </p>
        </div>
      </section>

      {/* Hi, you've found us Section */}
      <section class="py-20 px-6 bg-white">
        <div class="container mx-auto max-w-4xl text-center scroll-reveal" ref={introRef}>
          <h2 class="text-4xl md:text-5xl font-bold text-gray-800 mb-8">
            {t('introduction', 'heading', 'Halo, Anda sudah menemukan kami!')}
          </h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            {t('introduction', 'description1', 'Di antara perjalanan waktu dan berbagai pertemuan yang tak terduga, akhirnya kita dipertemukan di momen ini. Kami senang karya kami bisa menarik perhatian Anda.')}
          </p>
          <p class="text-lg text-gray-700 leading-relaxed">
            {t('introduction', 'description2', 'Melalui kecintaan kami pada fotografi dan videografi, kami berusaha menangkap setiap detail, rasa, dan emosi dari momen berharga, agar setiap kenangan penting dapat tersimpan dengan indah dan bermakna.')}
          </p>
          <div class="mt-12 border-t border-gray-300 w-70 mx-auto"></div>
        </div>
      </section>


      {/* Services Section */}
      <section class="py-20 px-6 bg-white">
        <div class="container mx-auto max-w-6xl">
          <div class="flex flex-col md:flex-row gap-12 items-start" ref={servicesRef}>
            {/* Left Side - Text */}
            <div class="w-full md:w-2/5 scroll-reveal">
              <h2 class="text-4xl md:text-5xl text-gray-800 mb-4">
                {t('services', 'title', 'Services')}
              </h2>
              <p class="text-lg text-gray-600">
                {t('services', 'subtitle', 'untuk merencanakan dan mengatur acara spesial Anda')}
              </p>
            </div>

            {/* Right Side - Service Carousel */}
            <div class="w-full md:w-3/5 scroll-reveal">
              <div class="relative">
                {/* Cards Scroll Container */}
                <div 
                  ref={serviceScrollContainer!}
                  class="service-scroll-container flex gap-4 md:gap-6 overflow-x-auto pb-4 px-1"
                >
                  <For each={allServices()}>
                    {(service) => (
                      <div 
                        class="flex-shrink-0 w-[84%] sm:w-[68%] md:w-1/3 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                      >
                        <div class="aspect-square overflow-hidden">
                          <img
                            src={serviceImage(service.slug, service.image)}
                            alt={serviceTitle(service.slug, service.title)}
                            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div class="p-4 text-center">
                          <p class="text-gray-800 font-medium">{serviceTitle(service.slug, service.title)}</p>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alur Booking Section */}
      <section class="py-20 px-6 bg-white">
        <div class="container mx-auto max-w-6xl">
          <div class="text-center mb-12 scroll-reveal" ref={bookingTitleRef}>
            <h2 class="text-3xl md:text-4xl text-gray-800 mb-4">{t('booking', 'title', 'Alur Booking')}</h2>
            <p class="text-lg text-gray-600">{t('booking', 'subtitle', 'Mulai dari konsultasi, pemilihan paket, hingga hari H — semua kami siapkan dengan profesional.')}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8" ref={bookingItemsRef}>
            <For each={Array.from({ length: 6 })}>
              {(_, idx) => {
                const stepNum = idx() + 1;
                const titleField = `step${stepNum}_title`;
                const descField = `step${stepNum}_description`;
                const bookingSteps = [
                  { title: 'Konsultasi & Cek Tanggal', desc: 'Klien menghubungi kami melalui WhatsApp untuk konsultasi awal dan memastikan ketersediaan tanggal acara.' },
                  { title: 'Pilih Paket Fotografi', desc: 'Klien memilih paket yang sesuai kebutuhan, konsep, dan budget yang diinginkan.' },
                  { title: 'Konfirmasi & Pembayaran DP', desc: 'Setelah paket disepakati, klien melakukan pembayaran DP untuk mengamankan jadwal.' },
                  { title: 'Persiapan & Briefing', desc: 'Kami melakukan briefing detail terkait rundown acara, konsep foto, lokasi, dan kebutuhan teknis lainnya.' },
                  { title: 'Hari Pernikahan (Shooting Day)', desc: 'Tim fotografer hadir tepat waktu dan mengabadikan setiap momen penting secara profesional.' },
                  { title: 'Editing & Penyerahan Hasil', desc: 'Proses editing dilakukan sesuai standar kualitas studio, lalu hasil diserahkan sesuai paket yang dipilih.' },
                ];
                return (
                  <div class="bg-[#FAFAFA] rounded-lg shadow-md p-6 text-center scroll-reveal-item">
                    <h3 class="text-xl text-[#464C43] mb-2">
                      {t('booking', titleField, bookingSteps[idx()].title)}
                    </h3>
                    <p class="text-gray-600 text-sm">
                      {t('booking', descField, bookingSteps[idx()].desc)}
                    </p>
                  </div>
                );
              }}
            </For>
          </div>

          <div class="mt-8 border-t border-gray-300 w-80 mx-auto"></div>
        </div>
      </section>

      {/* Portfolio Grid Section */}
      <section id="portfolio" class="py-20 px-6 bg-white">
        <div class="container mx-auto max-w-6xl">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl text-gray-800 mb-4">Our portofolios</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6" ref={portfolioGridRef}>
            <For each={portfolioImages()}>
              {(item, idx) => (
                <div 
                  class="group relative overflow-hidden rounded-lg cursor-pointer"
                  classList={{
                    'scroll-reveal-item': idx() >= 3
                  }}
                  onClick={() => {
                    handlePortfolioClick(item.slug);
                    // On desktop, also navigate on click
                    if (window.innerWidth >= 768) {
                      handlePortfolioNavigate(item.slug);
                    } else if (showPortfolioInfo() === item.slug) {
                      handlePortfolioNavigate(item.slug);
                    }
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div 
                    class="absolute inset-0 bg-black/40 transition-opacity duration-300 flex flex-col justify-end p-6"
                    classList={{
                      'opacity-100 md:group-hover:opacity-100': showPortfolioInfo() === item.slug || window.innerWidth >= 768,
                      'opacity-0 md:opacity-0': showPortfolioInfo() !== item.slug && window.innerWidth < 768
                    }}
                  >
                    <div class="text-white">
                      <p class="text-sm font-medium mb-1">{item.category}</p>
                      <p class="text-lg font-semibold">{item.name}</p>
                    </div>
                  </div>
                  <div 
                    class="absolute top-4 right-4 text-white transition-opacity"
                    classList={{
                      'opacity-100 md:group-hover:opacity-100': showPortfolioInfo() === item.slug || window.innerWidth >= 768,
                      'opacity-0 md:opacity-0': showPortfolioInfo() !== item.slug && window.innerWidth < 768
                    }}
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </section>

      {/* Featured Shots Section */}
      <section class="py-20 md:py-28 px-4 md:px-6 bg-white">
        <div class="container mx-auto max-w-5xl">
          <div class="text-center mb-12 md:mb-16">
            <h2 class="text-2xl md:text-4xl font-bold text-gray-800 mb-4">{t('featured', 'title', 'Potret Unggulan')}</h2>
            <p class="text-base md:text-lg text-gray-600">{t('featured', 'subtitle', 'Sekilas pandang dari beberapa karya terbaik kami.')}</p>
          </div>
          <div class="relative mt-2 md:mt-4">
            <div class="flex items-center justify-center gap-2 md:gap-4">
              {/* Left Arrow */}
              <button
                onClick={prevPortrait}
                disabled={isAnimatingPortrait()}
                class="z-20 p-2 md:p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous image"
              >
                <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Image Container */}
              <div class="flex-1 flex justify-center items-center overflow-visible relative">
                <div class="relative w-full h-64 sm:h-72 md:h-[30rem]">
                  <For each={portraitImages()}>
                    {(image, index) => {
                      return (
                        <div
                          class="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out"
                          classList={{
                            'left-1/2 -translate-x-1/2 opacity-100 scale-100 z-20': index() === currentPortraitIndex(),
                            'left-[10%] opacity-50 scale-80 z-10 blur-sm': index() === getPrevIndex(),
                            'right-[10%] opacity-50 scale-80 z-10 blur-sm': index() === getNextIndex(),
                            'opacity-0 scale-0 z-0 pointer-events-none': index() !== currentPortraitIndex() && index() !== getPrevIndex() && index() !== getNextIndex()
                          }}
                        >
                          <img
                            src={image}
                            alt={`Featured shot ${index() + 1}`}
                            class="w-44 h-64 sm:w-52 sm:h-72 md:w-72 md:h-96 object-cover rounded-lg shadow-lg"
                          />
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>

              {/* Right Arrow */}
              <button
                onClick={nextPortrait}
                disabled={isAnimatingPortrait()}
                class="z-20 p-2 md:p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next image"
              >
                <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div class="text-center mt-6 md:mt-8">
            <button onClick={() => navigate('/portfolio')} class="px-6 md:px-8 py-2 md:py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm md:text-base">
              Lihat Portfolio Kami
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section class="py-32 px-6" style={{ 'background-color': '#464C43' }}>
        <div class="container mx-auto max-w-5xl">
          <div class="text-center mb-16 text-white">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">{t('testimonials', 'title', 'Testimoni')}</h2>
            <p class="text-lg opacity-90 mb-8">{t('testimonials', 'subtitle', 'dari pasangan bahagia dan puas')}</p>
          </div>

          <div class="relative px-8">
            <button
              onClick={prevTesti}
              class="absolute left-0 top-1/2 -translate-y-1/2 p-3 text-white opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Previous testimonial"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div class="max-w-4xl mx-auto text-center text-white px-6">
              <div class="testi-item" classList={{ 'animate': testiAnimate() }}>
                <p class="text-lg md:text-xl italic mb-6">"{t('testimonials', `quote${testiIndex() + 1}`, testimonials()[testiIndex()].quote)}"
                </p>
                <p class="font-semibold">- {t('testimonials', `author${testiIndex() + 1}`, testimonials()[testiIndex()].author)}</p>
              </div>
            </div>

            <button
              onClick={nextTesti}
              class="absolute right-0 top-1/2 -translate-y-1/2 p-3 text-white opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Next testimonial"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Get In Touch Section */}
      <section id="contact" class="py-20 px-6 bg-white">
        <div class="container mx-auto max-w-6xl">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left - Contact Info */}
            <div class="scroll-reveal" ref={contactRef}>
              <h2 class="text-4xl text-gray-800 mb-6">Hubungi Kami</h2>
              <p class="text-gray-600 mb-8">Siap mengabadikan momen spesial Anda? Hubungi kami melalui WhatsApp atau isi formulir, dan kami akan merespons dalam 24 jam.</p>
              
              <div class="space-y-6">
                <div class="flex gap-4">
                  <AiTwotonePhone class="w-6 h-6 text-[#464C43] flex-shrink-0 mt-1" />
                  <div>
                    <p class="text-sm text-gray-500 uppercase tracking-wider">PHONE</p>
                    <p class="text-gray-800 font-medium">{t('settings', 'phone', '+62895351115777')}</p>
                  </div>
                </div>
                
                <div class="flex gap-4">
                  <AiTwotoneMail class="w-6 h-6 text-[#464C43] flex-shrink-0 mt-1" />
                  <div>
                    <p class="text-sm text-gray-500 uppercase tracking-wider">EMAIL</p>
                    <p class="text-gray-800 font-medium">{t('settings', 'email', 'widymotret@gmail.com')}</p>
                  </div>
                </div>
                
                <div class="flex gap-4">
                  <IoLocationOutline class="w-6 h-6 text-[#464C43] flex-shrink-0 mt-1" />
                  <div>
                    <p class="text-sm text-gray-500 uppercase tracking-wider">LOCATION</p>
                    <p class="text-gray-800 font-medium">{t('settings', 'address', 'Jl. Raya Pernasidi No.3, Banyumas, Jawa Tengah')}</p>
                  </div>
                </div>
                
                <div class="flex gap-4">
                  <BsInstagram class="w-6 h-6 text-[#464C43] flex-shrink-0 mt-1" />
                  <div> 
                    <p class="text-sm text-gray-500 uppercase tracking-wider">INSTAGRAM</p>
                    <p class="text-gray-800 font-medium">{t('settings', 'instagram', '@widymotretstudio')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right - Google Map */}
            <div class="h-full min-h-96 scroll-reveal">
              <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15826.495597592279!2d109.1266704!3d-7.3959707!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6561af6175859b%3A0x29609b0d99d853cf!2sWidy%20Motret%20Studio!5e0!3m2!1sid!2sid!4v1770349406455!5m2!1sid!2sid" width="100%" height="100%" style={{ "border": "none", "border-radius": "0.5rem" }} allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Booking Section */}
      <section class="py-20 px-6 bg-gradient-to-r from-[#464C43] to-[#576250]">
        <div class="container mx-auto max-w-4xl text-center scroll-reveal" ref={ctaRef}>
          <h2 class="text-3xl md:text-4xl text-white mb-4">{t('home', 'cta_heading', 'Siap Mengabadikan Momen Spesial Anda?')}</h2>
          <p class="text-white/90 text-lg mb-8">{t('home', 'cta_subheading', 'Hubungi kami sekarang dan jadwalkan sesi pemotretan Anda')}</p>
          <button
            onClick={() => setIsBookingModalOpen(true)}
            class="px-10 py-4 bg-white text-[#464C43] rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {t('home', 'cta_button', 'Booking Sekarang')}
          </button>
        </div>
      </section>

      {/* Booking Modal */}
      <Show when={isBookingModalOpen()}>
        <div 
          class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
          onClick={() => setIsBookingModalOpen(false)}
        >
          <div 
            class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeInScale"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div class="flex justify-end mb-4">
              <button 
                onClick={() => setIsBookingModalOpen(false)}
                class="text-gray-400 hover:text-gray-600 transition"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div class="text-center mb-8">
              <h3 class="text-2xl font-bold text-[#464C43] mb-2">Pilih Langkah Anda</h3>
              <p class="text-gray-600">Ingin cek paket terlebih dahulu atau booking langsung?</p>
            </div>

            {/* Option 1: Check Pricelist */}
            <button
              onClick={() => {
                setIsBookingModalOpen(false);
                navigate('/pricelist/studio');
              }}
              class="w-full py-3 px-6 mb-4 bg-[#FAFAFA] hover:bg-gray-100 border-2 border-[#576250] text-[#464C43] rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-3"
            >
              <AiTwotoneCheckCircle class="w-6 h-6" />
              Cek Pricelist & Paket Dulu
            </button>

            {/* Option 2: Booking Now */}
            <button
              onClick={() => {
                setIsBookingModalOpen(false);
                setIsContactModalOpen(true);
              }}
              class="w-full py-3 px-6 bg-[#464C43] hover:bg-[#576250] text-white rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-3"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Booking via WhatsApp Sekarang
            </button>
          </div>
        </div>
      </Show>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTop showThreshold={500} />
    </div>
  );
};

export default Home;
