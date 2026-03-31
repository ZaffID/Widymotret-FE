import { Component, createMemo, createSignal, onMount, For } from 'solid-js';
import { BsInstagram, BsFacebook, BsWhatsapp } from 'solid-icons/bs';
import { contentStore } from '../stores/contentStore';

interface ServiceCategory {
  name: string;
  category: string;
}

const Footer: Component = () => {
  const [services, setServices] = createSignal<ServiceCategory[]>([]);

  // Create memos for footer data to track changes
  const studioDescription = createMemo(() => 
    contentStore.getField('footer', 'studio_description') || 'Mengabadikan momen abadi dan menciptakan kenangan indah yang bertahan selamanya.'
  );
  
  const contactEmail = createMemo(() => 
    contentStore.getField('footer', 'email') || 'widymotret@gmail.com'
  );
  
  const contactPhone = createMemo(() => 
    contentStore.getField('footer', 'phone') || '+62 895-3511-15777'
  );
  
  const contactAddress = createMemo(() => 
    contentStore.getField('footer', 'address') || 'Jl. Raya Pernasidi No.3, Cilongok, Banyumas – Jawa Tengah'
  );
  
  const copyrightText = createMemo(() => 
    contentStore.getField('footer', 'copyright_text') || '© 2026 Studio Photography. All rights reserved.'
  );
  
  const tagline = createMemo(() => 
    contentStore.getField('footer', 'tagline') || 'Made with ♥ for capturing love'
  );

  // Social media links from contentStore
  const facebookUrl = createMemo(() => 
    contentStore.getField('footer', 'facebook_url') || 'https://www.facebook.com/dalban.speed.71/'
  );

  const instagramUrl = createMemo(() => 
    contentStore.getField('footer', 'instagram_url') || 'https://www.instagram.com/widymotretstudio/'
  );

  const whatsappUrl = createMemo(() => 
    contentStore.getField('footer', 'whatsapp_url') || 'https://api.whatsapp.com/send/?phone=62895351115777%3F&type=phone_number&app_absent=0'
  );

  // Fetch unique service categories from backend
  onMount(async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://widymotret-be-production.up.railway.app';
      const response = await fetch(`${API_BASE}/api/packages`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Get unique categories with first package name from each
        const uniqueCategories = new Map<string, ServiceCategory>();
        data.forEach((pkg: any) => {
          if (!uniqueCategories.has(pkg.category)) {
            uniqueCategories.set(pkg.category, {
              name: pkg.name,
              category: pkg.category,
            });
          }
        });
        setServices(Array.from(uniqueCategories.values()).slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      // Fallback to default services
      setServices([
        { name: 'Studio Photoshoot', category: 'studio' },
        { name: 'Graduation', category: 'graduation' },
        { name: 'Event Photography', category: 'event' },
        { name: 'Product Photography', category: 'product' },
        { name: 'Wedding Photography', category: 'wedding' },
      ]);
    }
  });
  return (
    <footer class="bg-black text-white py-16 px-6">
      <div class="container mx-auto max-w-6xl">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Studio Info */}
          <div>
            <h3 class="text-sm tracking-widest mb-4 text-gray-300">STUDIO</h3>
            <p class="text-gray-400 text-sm leading-relaxed">
              {studioDescription()}
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 class="text-sm tracking-widest mb-6 text-gray-300">TAUTAN CEPAT</h4>
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
            <h4 class="text-sm tracking-widest mb-6 text-gray-300">LAYANAN</h4>
            <ul class="space-y-3 text-gray-400 text-sm">
              <For each={services()}>
                {(service) => (
                  <li><a href={`/pricelist/${service.category}`} class="hover:text-white transition">{service.name}</a></li>
                )}
              </For>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 class="text-sm tracking-widest mb-6 text-gray-300">KONTAK</h4>
            <ul class="space-y-3 text-gray-400 text-sm">
              <li class="flex items-center gap-2">
                <span>{contactPhone()}</span>
              </li>
              <li class="flex items-center gap-2">
                <span>{contactEmail()}</span>
              </li>
              <li class="flex items-center gap-2">
                <span>{contactAddress()}</span>
              </li>
              <li class="flex gap-3 mt-6">
                <a href={facebookUrl()} target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-white transition border border-gray-600 rounded-lg p-2 hover:border-white">
                  <BsFacebook class="w-4 h-4" />
                </a>
                <a href={instagramUrl()} target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-white transition border border-gray-600 rounded-lg p-2 hover:border-white">
                  <BsInstagram class="w-4 h-4" />
                </a>
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-white transition border border-gray-600 rounded-lg p-2 hover:border-white">
                  <BsWhatsapp class="w-4 h-4" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>{copyrightText()}</p>
          <p class="mt-4 md:mt-0">{tagline()}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
