import { Component, createSignal, For, createMemo, createEffect } from 'solid-js';
import Navbar from '../components/Navbar';
import PriceList from '../components/PriceList';
import ImageCarousel from '../components/ImageCarousel';
import { servicesData } from '../data/services';
import { AiTwotonePhone } from 'solid-icons/ai';
import { AiTwotoneMail } from 'solid-icons/ai';
import { IoLocationOutline } from 'solid-icons/io';
import { BsInstagram, BsFacebook, BsWhatsapp } from 'solid-icons/bs';

const Home: Component = () => {
  const [currentPortraitIndex, setCurrentPortraitIndex] = createSignal(0);
  const [isPriceListOpen, setIsPriceListOpen] = createSignal(false);
  const [serviceCarouselIndex, setServiceCarouselIndex] = createSignal(0);
  
  const landscapeImages = [
    '/landscape/landscape (1).png',
    '/landscape/landscape (2).png',
    '/landscape/landscape (3).png',
    '/landscape/landscape (4).png',
  ];

  // Function untuk get random landscape image
  const getRandomLandscapeImage = () => {
    return landscapeImages[Math.floor(Math.random() * landscapeImages.length)];
  };

  // Service carousel navigation
  const nextService = () => {
    setServiceCarouselIndex((prev) => (prev + 1) % servicesData.length);
  };

  const prevService = () => {
    setServiceCarouselIndex((prev) => (prev - 1 + servicesData.length) % servicesData.length);
  };

  // Get visible services (3 per view on desktop, 1 on mobile)
  const getVisibleServices = createMemo(() => {
    const itemsPerPage = 3;
    const startIdx = serviceCarouselIndex();
    return Array.from({ length: itemsPerPage }).map((_, i) => 
      servicesData[(startIdx + i) % servicesData.length]
    );
  });
  
  const homeCarouselImages = [
    '/home (1).png',
    '/home (2).jpg',
    '/home (3).jpg',
    '/home (4).jpg',
  ];
  
  const portraitImages = [
    '/portrait/portrait (1).png',
    '/portrait/portrait (2).png',
    '/portrait/portrait (3).png',
    '/portrait/portrait (4).png',
    '/portrait/portrait (5).png',
  ];

  const portfolioImages = [
    { image: '/landscape/landscape (1).png', category: 'Wedding', name: 'Person #1 - Person #2' },
    { image: '/landscape/landscape (2).png', category: 'Couple Session', name: 'Person #3 - Person #4' },
    { image: '/landscape/landscape (3).png', category: 'Wedding', name: 'Person #5 - Person #6' },
    { image: '/landscape/landscape (4).png', category: 'Engagement', name: 'Person #7' },
  ];

  const testimonials = [
    {
      quote: 'Cara kalian menangkap momen hari kami sungguh luar biasa. Setiap foto adalah harta karun.',
      author: 'Racheal and Tim',
      avatar: '/portrait/portrait (1).png',
    },
    {
      quote: 'Profesional, sabar, dan sangat berbakat.',
      author: 'Agency Lead, Numa Studio',
      avatar: '/portrait/portrait (2).png',
    },
    {
      quote: 'Portrait saya selalu terlihat menakjubkan ketika ditangani oleh kalian.',
      author: 'Mary Jane',
      avatar: '/portrait/portrait (3).png',
    },
  ];

  // Single testimonial carousel state
  const [testiIndex, setTestiIndex] = createSignal(0);
  const [testiAnimate, setTestiAnimate] = createSignal(false);
  
  const nextTesti = () => setTestiIndex((p) => (p + 1) % testimonials.length);
  const prevTesti = () => setTestiIndex((p) => (p - 1 + testimonials.length) % testimonials.length);

  // Trigger animation on testimonial change
  createEffect(() => {
    testiIndex();
    setTestiAnimate(true);
    const timer = setTimeout(() => setTestiAnimate(false), 500);
    return () => clearTimeout(timer);
  });

  const nextPortrait = () => {
    setCurrentPortraitIndex((prev) => (prev + 1) % portraitImages.length);
  };

  const prevPortrait = () => {
    setCurrentPortraitIndex((prev) => (prev - 1 + portraitImages.length) % portraitImages.length);
  };

  const getPrevIndex = createMemo(() => {
    return (currentPortraitIndex() - 1 + portraitImages.length) % portraitImages.length;
  });

  const getNextIndex = createMemo(() => {
    return (currentPortraitIndex() + 1) % portraitImages.length;
  });

  return (
    <div class="min-h-screen bg-white">
      <Navbar />
      {/* PriceList modal masih ada tapi tidak diakses dari navbar */}
      <PriceList 
        isOpen={isPriceListOpen} 
        onClose={() => setIsPriceListOpen(false)} 
      />

      {/* Hero Section with Auto-Carousel */}
      <section class="relative h-screen flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 z-0">
          <ImageCarousel images={homeCarouselImages} autoPlayInterval={5000} />
        </div>
        <div class="relative z-10 text-center px-6 max-w-4xl">
          <h1 class="text-5xl md:text-6xl font-serif text-white drop-shadow-lg mb-6">
            Setiap Momen Punya Cerita
          </h1>
          <p class="text-lg md:text-xl text-white drop-shadow-md font-serif leading-relaxed">
            Kami mengabadikan momen melalui foto dan video dengan pendekatan yang sederhana, rapi, dan penuh perhatian pada detail.
          </p>
        </div>
      </section>

      {/* Hi, you've found us Section */}
      <section class="py-20 px-6 bg-white">
        <div class="container mx-auto max-w-4xl text-center">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-800 mb-8">
            Halo, Anda sudah menemukan kami!
          </h2>
          <p class="text-lg text-gray-700 leading-relaxed mb-6">
            Di antara perjalanan waktu dan berbagai pertemuan yang tak terduga, akhirnya kita dipertemukan di momen ini. Kami senang karya kami bisa menarik perhatian Anda.
          </p>
          <p class="text-lg text-gray-700 leading-relaxed">
            Melalui kecintaan kami pada fotografi dan videografi, kami berusaha menangkap setiap detail, rasa, dan emosi dari momen berharga, agar setiap kenangan penting dapat tersimpan dengan indah dan bermakna.
          </p>
          <div class="mt-12 border-t border-gray-300 w-132 mx-auto"></div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" class="py-20 px-6 bg-white">
        <div class="container mx-auto max-w-6xl">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Text Section */}
            <div>
              <h2 class="text-4xl md:text-5xl font-serif text-gray-800 mb-8">
                Widymotret
              </h2>
              <p class="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
                Widymotret adalah studio fotografi yang berdiri sejak 2021 dan melayani berbagai kebutuhan pemotretan.
              </p>
              <p class="text-base md:text-lg text-gray-700 leading-relaxed">
                Kami menyesuaikan gaya foto sesuai keinginan klien, mulai dari natural, elegan, hingga cinematic, dengan fokus pada kenyamanan dan hasil yang rapi serta berkesan.
              </p>
            </div>

            {/* Photo Grid Section */}
            <div class="grid grid-cols-2 gap-4">
              {/* Left column */}
              <div class="flex flex-col gap-4">
                {/* Left top - Square */}
                <div class="overflow-hidden rounded-lg h-48">
                  <img
                    src="/portrait/portrait (1).png"
                    alt="Widymotret Gallery 1"
                    class="w-full h-full object-cover"
                  />
                </div>
                {/* Left bottom - Portrait */}
                <div class="overflow-hidden rounded-lg flex-1 min-h-64">
                  <img
                    src="/portrait/portrait (3).png"
                    alt="Widymotret Gallery 3"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right column */}
              <div class="flex flex-col gap-4">
                {/* Right top - Portrait */}
                <div class="overflow-hidden rounded-lg flex-1 min-h-64">
                  <img
                    src="/portrait/portrait (2).png"
                    alt="Widymotret Gallery 2"
                    class="w-full h-full object-cover"
                  />
                </div>
                {/* Right bottom - Square */}
                <div class="overflow-hidden rounded-lg h-48">
                  <img
                    src="/portrait/portrait (4).png"
                    alt="Widymotret Gallery 4"
                    class="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section class="py-20 px-6 bg-white">
        <div class="container mx-auto max-w-6xl">
          <div class="flex flex-col md:flex-row gap-12 items-start">
            {/* Left Side - Text */}
            <div class="w-full md:w-2/5">
              <h2 class="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
                Services
              </h2>
              <p class="text-lg text-gray-600">
                untuk merencanakan dan mengatur acara spesial Anda
              </p>
            </div>

            {/* Right Side - Service Carousel */}
            <div class="w-full md:w-3/5">
              <div class="relative">
                {/* Cards Grid with Animation */}
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <For each={getVisibleServices()}>
                    {(service, idx) => (
                      <div 
                        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-500"
                        style={{
                          animation: `fadeInUp 0.5s ease-out ${idx() * 100}ms backwards`
                        }}
                      >
                        <div class="aspect-square overflow-hidden">
                          <img
                            src={getRandomLandscapeImage()}
                            alt={service.title}
                            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div class="p-4 text-center">
                          <p class="text-gray-800 font-medium">{service.title}</p>
                        </div>
                      </div>
                    )}
                  </For>
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevService}
                  class="absolute -left-12 top-1/2 transform -translate-y-1/2 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-[#464C43] text-white hover:bg-[#576250] transition"
                  aria-label="Previous services"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={nextService}
                  class="absolute -right-12 top-1/2 transform -translate-y-1/2 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-[#464C43] text-white hover:bg-[#576250] transition"
                  aria-label="Next services"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Dots Indicator */}
                <div class="flex justify-center gap-2 mt-6">
                  <For each={Array.from({ length: servicesData.length })}>
                    {(_, index) => (
                      <button
                        onClick={() => setServiceCarouselIndex(index())}
                        class={`transition-all duration-300 rounded-full ${
                          Math.floor(serviceCarouselIndex()) === index()
                            ? 'bg-[#464C43] w-3 h-3'
                            : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to service ${index() + 1}`}
                      />
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
          <div class="text-center mb-12">
            <h2 class="text-4xl md:text-5xl font-serif text-gray-800 mb-4">Alur Booking</h2>
            <p class="text-lg text-gray-600">Mulai dari konsultasi, pemilihan paket, hingga hari H — semua kami siapkan dengan profesional.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-[#FAFAFA] rounded-lg shadow-md p-6 text-center">
              <h3 class="font-serif text-xl text-[#464C43] mb-2">Konsultasi & Cek Tanggal</h3>
              <p class="text-gray-600 text-sm">Klien menghubungi kami melalui WhatsApp untuk konsultasi awal dan memastikan ketersediaan tanggal acara.</p>
            </div>
            <div class="bg-[#FAFAFA] rounded-lg shadow-md p-6 text-center">
              <h3 class="font-serif text-xl text-[#464C43] mb-2">Pilih Paket Fotografi</h3>
              <p class="text-gray-600 text-sm">Klien memilih paket yang sesuai kebutuhan, konsep, dan budget yang diinginkan.</p>
            </div>
            <div class="bg-[#FAFAFA] rounded-lg shadow-md p-6 text-center">
              <h3 class="font-serif text-xl text-[#464C43] mb-2">Konfirmasi & Pembayaran DP</h3>
              <p class="text-gray-600 text-sm">Setelah paket disepakati, klien melakukan pembayaran DP untuk mengamankan jadwal.</p>
            </div>
            <div class="bg-[#FAFAFA] rounded-lg shadow-md p-6 text-center">
              <h3 class="font-serif text-xl text-[#464C43] mb-2">Persiapan & Briefing</h3>
              <p class="text-gray-600 text-sm">Kami melakukan briefing detail terkait rundown acara, konsep foto, lokasi, dan kebutuhan teknis lainnya.</p>
            </div>
            <div class="bg-[#FAFAFA] rounded-lg shadow-md p-6 text-center">
              <h3 class="font-serif text-xl text-[#464C43] mb-2">Hari Pernikahan (Shooting Day)</h3>
              <p class="text-gray-600 text-sm">Tim fotografer hadir tepat waktu dan mengabadikan setiap momen penting secara profesional.</p>
            </div>
            <div class="bg-[#FAFAFA] rounded-lg shadow-md p-6 text-center">
              <h3 class="font-serif text-xl text-[#464C43] mb-2">Editing & Penyerahan Hasil</h3>
              <p class="text-gray-600 text-sm">Proses editing dilakukan sesuai standar kualitas studio, lalu hasil diserahkan sesuai paket yang dipilih.</p>
            </div>
          </div>

          <div class="mt-8 border-t border-gray-300 w-132 mx-auto"></div>
        </div>
      </section>

      {/* Portfolio Grid Section */}
      <section id="portfolio" class="py-20 px-6 bg-white">
        <div class="container mx-auto max-w-6xl">
          <div class="text-center mb-12">
            <h2 class="text-4xl md:text-5xl font-serif text-gray-800 mb-4">Our portofolios</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <For each={portfolioImages}>
              {(item) => (
                <div class="group relative overflow-hidden rounded-lg cursor-pointer">
                  <img
                    src={item.image}
                    alt={item.name}
                    class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <div class="text-white">
                      <p class="text-sm font-medium mb-1">{item.category}</p>
                      <p class="text-lg font-semibold">{item.name}</p>
                    </div>
                  </div>
                  <div class="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
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
      <section class="py-20 px-6 bg-white">
        <div class="container mx-auto max-w-5xl">
          <div class="text-center mb-12">
            <h2 class="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Potret Unggulan</h2>
            <p class="text-lg text-gray-600">Sekilas pandang dari beberapa karya terbaik kami.</p>
          </div>
          <div class="relative">
            <div class="flex items-center justify-center gap-4">
              {/* Left Arrow */}
              <button
                onClick={prevPortrait}
                class="z-20 p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex-shrink-0"
                aria-label="Previous image"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Image Container */}
              <div class="flex-1 flex justify-center items-center overflow-visible relative">
                <div class="relative w-full max-w-5xl h-64">
                  <For each={portraitImages}>
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
                            class="w-96 h-64 object-cover rounded-lg shadow-lg"
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
                class="z-20 p-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex-shrink-0"
                aria-label="Next image"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div class="text-center mt-8">
            <button class="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
              Lihat Portfolio Kami
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section class="py-32 px-6" style={{ 'background-color': '#464C43' }}>
        <div class="container mx-auto max-w-5xl">
          <div class="text-center mb-16 text-white">
            <h2 class="text-4xl md:text-5xl font-bold mb-4">Testimoni</h2>
            <p class="text-lg opacity-90 mb-8">dari pasangan bahagia dan puas</p>
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
                <p class="text-lg md:text-xl italic mb-6">"{testimonials[testiIndex()].quote}"</p>
                <p class="font-semibold">- {testimonials[testiIndex()].author}</p>
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
            <div>
              <h2 class="text-4xl font-serif text-gray-800 mb-6">Hubungi Kami</h2>
              <p class="text-gray-600 mb-8">Siap mengabadikan momen spesial Anda? Hubungi kami melalui WhatsApp atau isi formulir, dan kami akan merespons dalam 24 jam.</p>
              
              <div class="space-y-6">
                <div class="flex gap-4">
                  <AiTwotonePhone class="w-6 h-6 text-[#464C43] flex-shrink-0 mt-1" />
                  <div>
                    <p class="text-sm text-gray-500 uppercase tracking-wider">PHONE</p>
                    <p class="text-gray-800 font-medium">+62895351115777</p>
                  </div>
                </div>
                
                <div class="flex gap-4">
                  <AiTwotoneMail class="w-6 h-6 text-[#464C43] flex-shrink-0 mt-1" />
                  <div>
                    <p class="text-sm text-gray-500 uppercase tracking-wider">EMAIL</p>
                    <p class="text-gray-800 font-medium">widymotret@gmail.com</p>
                  </div>
                </div>
                
                <div class="flex gap-4">
                  <IoLocationOutline class="w-6 h-6 text-[#464C43] flex-shrink-0 mt-1" />
                  <div>
                    <p class="text-sm text-gray-500 uppercase tracking-wider">LOCATION</p>
                    <p class="text-gray-800 font-medium">Jl. Raya Pernasidi No.3, Banyumas, Jawa Tengah</p>
                  </div>
                </div>
                
                <div class="flex gap-4">
                  <BsInstagram class="w-6 h-6 text-[#464C43] flex-shrink-0 mt-1" />
                  <div>
                    <p class="text-sm text-gray-500 uppercase tracking-wider">INSTAGRAM</p>
                    <p class="text-gray-800 font-medium">@widymotret</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right - Google Map */}
            <div class="h-full min-h-96">
              <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15826.495597592279!2d109.1266704!3d-7.3959707!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6561af6175859b%3A0x29609b0d99d853cf!2sWidy%20Motret%20Studio!5e0!3m2!1sid!2sid!4v1770349406455!5m2!1sid!2sid" width="100%" height="100%" style={{ "border": "none", "border-radius": "0.5rem" }} allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer class="bg-black text-white py-16 px-6">
        <div class="container mx-auto max-w-6xl">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Studio Info */}
            <div>
              <h3 class="text-sm font-serif tracking-widest mb-4 text-gray-300">STUDIO</h3>
              <p class="text-gray-400 text-sm leading-relaxed">
                Capturing timeless moments and creating beautiful memories that last forever.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 class="text-sm font-serif tracking-widest mb-6 text-gray-300">TAUTAN CEPAT</h4>
              <ul class="space-y-3 text-gray-400 text-sm">
                <li><a href="#portfolio" class="hover:text-white transition">Portfolio</a></li>
                <li><a href="#pricelist/wedding" class="hover:text-white transition">Harga</a></li>
                <li><a href="#about" class="hover:text-white transition">Tentang</a></li>
                <li><a href="#contact" class="hover:text-white transition">Hubungi</a></li>
              </ul>
            </div>
            
            {/* Services */}
            <div>
              <h4 class="text-sm font-serif tracking-widest mb-6 text-gray-300">LAYANAN</h4>
              <ul class="space-y-3 text-gray-400 text-sm">
                <li><a href="/pricelist/studio" class="hover:text-white transition">Studio Photoshoot</a></li>
                <li><a href="/pricelist/graduation" class="hover:text-white transition">Graduation</a></li>
                <li><a href="/pricelist/event" class="hover:text-white transition">Event Photography</a></li>
                <li><a href="/pricelist/product" class="hover:text-white transition">Product Photography</a></li>
                <li><a href="/pricelist/wedding" class="hover:text-white transition">Wedding Photography</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 class="text-sm font-serif tracking-widest mb-6 text-gray-300">KONTAK</h4>
              <ul class="space-y-3 text-gray-400 text-sm">
                <li class="flex items-center gap-2">
                  <span>+62 895-3511-15777</span>
                </li>
                <li class="flex items-center gap-2">
                  <span>widymotret@gmail.com</span>
                </li>
                <li class="flex items-center gap-2">
                  <span>Jl. Raya Pernasidi No.3, Cilongok, Banyumas – Jawa Tengah</span>
                </li>
                <li class="flex gap-3 mt-6">
                  <a href="https://www.facebook.com/dalban.speed.71/" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-white transition border border-gray-600 rounded-lg p-2 hover:border-white">
                    <BsFacebook class="w-4 h-4" />
                  </a>
                  <a href="https://www.instagram.com/widymotretstudio/" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-white transition border border-gray-600 rounded-lg p-2 hover:border-white">
                    <BsInstagram class="w-4 h-4" />
                  </a>
                  <a href="https://api.whatsapp.com/send/?phone=62895351115777%3F&type=phone_number&app_absent=0" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-white transition border border-gray-600 rounded-lg p-2 hover:border-white">
                    <BsWhatsapp class="w-4 h-4" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>© 2026 Studio Photography. All rights reserved.</p>
            <p class="mt-4 md:mt-0">Made with <span class="text-red-500">♥</span> for capturing love</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
