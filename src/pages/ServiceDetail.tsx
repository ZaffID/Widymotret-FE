import { Component, For, Show, createSignal } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { BsInstagram, BsFacebook, BsWhatsapp } from 'solid-icons/bs';
import Navbar from '../components/Navbar';
import { servicesData } from '../data/services';

const ServiceDetail: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  
  const service = () => servicesData.find(s => s.slug === params.slug);

  // State untuk track expanded packages
  const [expandedPackage, setExpandedPackage] = createSignal<number | null>(null);

  // Example images dari landscape folder (konsisten, bukan random)
  const exampleImages = [
    '/landscape/landscape (1).png',
    '/landscape/landscape (2).png',
    '/landscape/landscape (3).png',
    '/landscape/landscape (4).png',
  ];

  // Function untuk get example images (konsisten)
  const getExampleImages = () => {
    return exampleImages;
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
          {/* Hero Section with Image */}
          <section class="relative h-screen overflow-hidden">
            <img
              src={service()!.image}
              alt={service()!.title}
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div class="text-center text-white px-6">
                <h1 class="text-5xl md:text-6xl font-serif mb-4">{service()!.title}</h1>
                <p class="text-lg md:text-xl max-w-3xl mx-auto">{service()!.description}</p>
              </div>
            </div>
          </section>

          {/* Packages Section */}
          <section class="py-20 px-6 bg-[#FAFAFA]">
            <div class="container mx-auto max-w-5xl">
              <div class="text-center mb-12">
                <h2 class="text-4xl font-serif text-[#464C43] mb-4">Paket yang Tersedia</h2>
                <p class="text-gray-600">Pilih paket yang paling sesuai dengan kebutuhan Anda</p>
              </div>

              <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
                <For each={service()!.packages}>
                  {(pkg, index) => {
                    const isLastAndOdd = service()!.packages.length % 2 === 1 && 
                                         (service()!.packages.length === 1 || index() === service()!.packages.length - 1);
                    const isExpanded = () => expandedPackage() === index();
                    const examplesForPackage = getExampleImages();
                    
                    return (
                      <div class="flex" classList={{
                        'md:col-span-2 md:justify-center': isLastAndOdd
                      }}>
                        <div class="w-full" classList={{
                          'md:max-w-xl': isLastAndOdd
                        }}>
                          <div class="bg-white rounded-lg shadow-md p-8">
                            <div class="flex justify-between items-baseline mb-4 pb-4 border-b border-gray-200">
                              <h3 class="text-2xl font-serif text-[#464C43]">{pkg.name}</h3>
                              <span class="text-xl font-bold text-[#576250]">{pkg.price}</span>
                            </div>
                            
                            <p class="text-gray-600 mb-6 italic">{pkg.description}</p>
                            
                            <ul class="space-y-3 mb-6">
                              <For each={pkg.features}>
                                {(feature) => (
                                  <li class="flex items-start gap-2 text-gray-700">
                                    <svg class="w-5 h-5 text-[#576250] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                    </svg>
                                    <span>{feature}</span>
                                  </li>
                                )}
                              </For>
                            </ul>

                            {/* Example Toggle Button */}
                            <button
                              onClick={() => setExpandedPackage(isExpanded() ? null : index())}
                              class="w-full py-2 px-4 border-t border-gray-200 text-[#464C43] hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium"
                            >
                              <svg
                                class="w-4 h-4 transition-transform duration-300"
                                classList={{ 'rotate-180': isExpanded() }}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                              {isExpanded() ? 'Tutup Contoh Foto' : 'Lihat Contoh Foto'}
                            </button>
                          </div>

                          {/* Example Gallery - Scrollable with Animation */}
                          <div
                            class="overflow-hidden transition-all duration-300 ease-in-out"
                            style={{
                              'max-height': isExpanded() ? '500px' : '0px',
                              opacity: isExpanded() ? 1 : 0,
                              'margin-top': isExpanded() ? '1rem' : '0rem',
                            }}
                          >
                            <div class="bg-white rounded-lg shadow-md p-6">
                              <h4 class="text-lg font-serif text-[#464C43] mb-4">Contoh Hasil</h4>
                              <div class="overflow-x-auto">
                                <div class="flex gap-4 pb-4" style="min-width: 100%">
                                  <For each={examplesForPackage}>
                                    {(img) => (
                                      <div class="flex-shrink-0">
                                        <img
                                          src={img}
                                          alt="Example"
                                          class="h-48 rounded-lg object-cover"
                                        />
                                      </div>
                                    )}
                                  </For>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>

              {/* WhatsApp CTA */}
              <div class="mt-12 text-center">
                <a 
                  href={`https://wa.me/6281234567890?text=Halo,%20saya%20tertarik%20dengan%20layanan%20${service()!.title}.%20Bisa%20minta%20informasi%20lebih%20lanjut?`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-block px-8 py-4 bg-[#464C43] text-white rounded-lg hover:bg-[#576250] transition font-medium"
                >
                  Pesan via WhatsApp
                </a>
              </div>
            </div>
          </section>

          {/* Back Button */}
          <section class="py-12 px-6 bg-white text-center">
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
      <footer class="bg-black text-white py-16 px-6">
        <div class="container mx-auto max-w-6xl">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Studio Info */}
            <div>
              <h3 class="text-sm font-serif tracking-widest mb-4 text-gray-300">STUDIO</h3>
              <p class="text-gray-400 text-sm leading-relaxed">
                Mengabadikan momen abadi dan menciptakan kenangan indah yang bertahan selamanya.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 class="text-sm font-serif tracking-widest mb-6 text-gray-300">TAUTAN CEPAT</h4>
              <ul class="space-y-3 text-gray-400 text-sm">
                <li><a href="/" class="hover:text-white transition">Home</a></li>
                <li><a href="/#portfolio" class="hover:text-white transition">Portfolio</a></li>
                <li><a href="/" class="hover:text-white transition">Harga</a></li>
                <li><a href="/#about" class="hover:text-white transition">Tentang</a></li>
                <li><a href="/#contact" class="hover:text-white transition">Hubungi</a></li>
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
                  <span>+6281234567890</span>
                </li>
                <li class="flex items-center gap-2">
                  <span>hello@photostudio.com</span>
                </li>
                <li class="flex items-center gap-2">
                  <span>Jl. Raya Pernasidi No.3, Banyumas, Jawa Tengah</span>
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

export default ServiceDetail;
