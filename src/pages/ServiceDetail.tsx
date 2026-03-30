import { Component, For, Show, createSignal } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { servicesData, Package } from '../data/services';

const ServiceDetail: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  
  const service = () => servicesData.find(s => s.slug === params.slug);

  // State untuk selected package
  const [selectedPackage, setSelectedPackage] = createSignal<Package | null>(null);
  const [selectedIndex, setSelectedIndex] = createSignal<number | null>(null);
  const [isDetailVisible, setIsDetailVisible] = createSignal(false);
  const [galleryIndex, setGalleryIndex] = createSignal(0);

  // Gallery images untuk setiap paket (bisa dikustomisasi per paket nanti)
  const galleryImages = [
    '/landscape/landscape (1).png',
    '/landscape/landscape (2).png',
    '/landscape/landscape (3).png',
    '/landscape/landscape (4).png',
  ];

  // Handle card click
  const handleCardClick = (pkg: Package, index: number) => {
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
    setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Close detail
  const closeDetail = () => {
    setIsDetailVisible(false);
    setTimeout(() => {
      setSelectedPackage(null);
      setSelectedIndex(null);
    }, 300);
  };

  return (
    <div class="min-h-screen bg-white">
      <Navbar />
      
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
              src={service()!.image}
              alt={service()!.title}
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center pb-16">
              <div class="text-center text-white px-6">
                <h1 class="text-4xl md:text-5xl mb-3">{service()!.title}</h1>
                <p class="text-base md:text-lg max-w-2xl mx-auto opacity-90">{service()!.description}</p>
              </div>
            </div>
          </section>

          {/* Package Cards Grid */}
          <section class="py-16 px-6 bg-white">
            <div class="container mx-auto max-w-6xl">
              <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl text-[#464C43] mb-3">Pilih Paket</h2>
                <p class="text-gray-500">Klik untuk melihat detail dan benefit</p>
              </div>

              {/* Image Cards Grid */}
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <For each={service()!.packages}>
                  {(pkg, index) => (
                    <div 
                      onClick={() => handleCardClick(pkg, index())}
                      class="group cursor-pointer"
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
                            src={galleryImages[index() % galleryImages.length]}
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
                          <p class="text-xl md:text-2xl font-bold text-[#B8C4A8]">{pkg.price}</p>
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

                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left - Gallery Slider */}
                    <div class="relative">
                      <div class="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                        <img
                          src={galleryImages[galleryIndex()]}
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
                        <For each={galleryImages}>
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
                        <For each={galleryImages}>
                          {(img, idx) => (
                            <button
                              onClick={() => setGalleryIndex(idx())}
                              class="w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300"
                              classList={{
                                'border-[#464C43] opacity-100': galleryIndex() === idx(),
                                'border-transparent opacity-60 hover:opacity-100': galleryIndex() !== idx()
                              }}
                            >
                              <img src={img} alt="" class="w-full h-full object-cover" />
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
                        <p class="text-3xl font-bold text-[#576250]">{selectedPackage()!.price}</p>
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
                        href={`https://wa.me/62895351115777?text=Halo,%20saya%20tertarik%20dengan%20paket%20${encodeURIComponent(selectedPackage()!.name)}%20dari%20layanan%20${encodeURIComponent(service()!.title)}.%20Bisa%20minta%20informasi%20lebih%20lanjut?`}
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
          <Show when={service()!.packages.length > 1}>
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
                      <For each={service()!.packages}>
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
                              <p class="font-bold text-[#576250]">{pkg.price}</p>
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
              class="text-[#464C43] hover:text-[#576250] transition font-medium"
            >
              ← Kembali ke Beranda
            </button>
          </section>
        </div>
      </Show>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ServiceDetail;
