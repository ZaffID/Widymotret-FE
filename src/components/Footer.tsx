import { Component, createMemo, createSignal, onMount, For } from 'solid-js';
import { BsInstagram, BsFacebook, BsWhatsapp } from 'solid-icons/bs';
import { servicesData } from '../data/services';
import { contentStore } from '../stores/contentStore';

// Footer mengambil data dinamis dari contentStore (CMS) dan daftar layanan dari data paket.
// Hasilnya: kontak, tautan cepat, dan link layanan bisa diupdate tanpa ubah layout komponen.

interface ServiceCategory {
  name: string;
  category: string;
}

const Footer: Component = () => {
  // Load footer content from backend on mount
  onMount(async () => {
    try {
      console.log('ðŸ“¥ Loading footer content from contentStore...');
      await contentStore.loadSection('footer');
      console.log('âœ… Footer section loaded');
    } catch (error) {
      console.error('âŒ Failed to load footer section:', error);
    }
  });

  // Create memos for footer data to track changes from contentStore
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
    contentStore.getField('footer', 'address') || 'Jl. Raya Pernasidi No.3, Cilongok, Banyumas â€“ Jawa Tengah'
  );
  
  const copyrightText = createMemo(() => 
    contentStore.getField('footer', 'copyright_text') || 'Â© 2026 Studio Photography. All rights reserved.'
  );
  
  const tagline = createMemo(() => 
    contentStore.getField('footer', 'tagline') || 'Made with â™¥ for capturing love'
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

  // Quick links from contentStore
  const quickLinks = createMemo(() => {
    const defaultLinks = [
      { label: 'Home', url: '/' },
      { label: 'Portfolio', url: '/#portfolio' },
      { label: 'Harga', url: '/' },
      { label: 'Tentang', url: '/#about' },
      { label: 'Hubungi', url: '/#contact' },
    ];
    
    return defaultLinks.map((link, idx) => ({
      label: contentStore.getField('footer', `quick_link_${idx}_label`) || link.label,
      url: contentStore.getField('footer', `quick_link_${idx}_url`) || link.url,
    }));
  });

  const footerServices = createMemo(() => {
    return servicesData.slice(0, 5).map((service, idx) => {
      const customLabel = contentStore.getField('footer', `footer_service_${idx}_label`);
      const customSlug = contentStore.getField('footer', `footer_service_${idx}_slug`);
      const serviceTitle = contentStore.getField('service', `${service.slug}_title`) || service.title;

      return {
        label: customLabel || serviceTitle,
        slug: (customSlug || service.slug).trim() || service.slug,
      };
    });
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
              <For each={quickLinks()}>
                {(link) => (
                  <li><a href={link.url} class="hover:text-white transition">{link.label}</a></li>
                )}
              </For>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h4 class="text-sm tracking-widest mb-6 text-gray-300">LAYANAN</h4>
            <ul class="space-y-3 text-gray-400 text-sm">
              <For each={footerServices()}>
                {(service) => (
                  <li><a href={`/pricelist/${service.slug}`} class="hover:text-white transition">{service.label}</a></li>
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

