import { Component } from 'solid-js';
import { BsInstagram, BsFacebook, BsWhatsapp } from 'solid-icons/bs';

const Footer: Component = () => {
  return (
    <footer class="bg-black text-white py-16 px-6">
      <div class="container mx-auto max-w-6xl">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Studio Info */}
          <div>
            <h3 class="text-sm tracking-widest mb-4 text-gray-300">STUDIO</h3>
            <p class="text-gray-400 text-sm leading-relaxed">
              Mengabadikan momen abadi dan menciptakan kenangan indah yang bertahan selamanya.
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
              <li><a href="/pricelist/studio" class="hover:text-white transition">Studio Photoshoot</a></li>
              <li><a href="/pricelist/graduation" class="hover:text-white transition">Graduation</a></li>
              <li><a href="/pricelist/event" class="hover:text-white transition">Event Photography</a></li>
              <li><a href="/pricelist/product" class="hover:text-white transition">Product Photography</a></li>
              <li><a href="/pricelist/wedding" class="hover:text-white transition">Wedding Photography</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 class="text-sm tracking-widest mb-6 text-gray-300">KONTAK</h4>
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
  );
};

export default Footer;
