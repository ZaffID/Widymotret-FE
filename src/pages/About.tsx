import { Component, For, Show, createSignal, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import ScrollToTop from '../components/ScrollToTop';
import { aboutData } from '../data/about';
import { contentStore } from '../stores/contentStore';
import { resolveMediaUrl } from '../utils/mediaUrl';
import { FiImage } from 'solid-icons/fi';
import { useScrollReveal } from '../hooks/useScrollReveal';
import '../styles/scroll-reveal.css';
import './About.css';

// Halaman Tentang: layout visual tetap, tetapi teks dan media diisi dari content section `about_page` dan `about`.
// Tujuannya agar admin bisa update narasi profil/tim tanpa perlu ubah struktur desain halaman.

const About: Component = () => {
  const navigate = useNavigate();
  const [isContactModalOpen, setIsContactModalOpen] = createSignal(false);

  // Scroll reveal refs
  const storyRef = useScrollReveal({ threshold: 0.5 });
  const philosophyRef = useScrollReveal({ threshold: 0.5 });
  const behindTheLensRef = useScrollReveal({ threshold: 0.5 });
  const teamRef = useScrollReveal({ threshold: 0.5 });
  const ctaRef = useScrollReveal({ threshold: 0.5 });

  onMount(async () => {
    await Promise.all([
      contentStore.loadSection('about_page'),
      contentStore.loadSection('about'),
    ]);
  });

  // Helper: returns contentStore value, falls back to aboutData default
  const t = (field: string, fallback: string): string =>
    contentStore.getField('about_page', field) || fallback;

  const aboutImage = (field: string, fallback: string): string => {
    const value = contentStore.getField('about', field) || '';
    return resolveMediaUrl(value);
  };

  const AboutImage: Component<{ src: string; alt: string; class?: string }> = (props) => (
    <Show
      when={props.src}
      fallback={
        <div class={`w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 ${props.class || ''}`}>
          <FiImage size={36} class="text-gray-400" />
          <p class="text-sm font-medium">no image</p>
        </div>
      }
    >
      <img
        src={props.src}
        alt={props.alt}
        class={props.class || 'w-full h-full object-cover'}
      />
    </Show>
  );

  return (
    <div class="wm-brand-page min-h-screen bg-white">
      <Navbar hasWhiteBackground={true} />

      {/* Hero Section */}
      <section class="relative pt-28 md:pt-32 pb-12 md:pb-16 px-4 md:px-6 bg-white overflow-hidden">
        <div class="container mx-auto max-w-6xl">
          {/* Title and Tagline */}
          <div class="mb-10 md:mb-12 text-center">
            <h1 class="text-3xl sm:text-4xl md:text-6xl leading-tight font-bold mb-4 text-gray-900">
              <span class="opacity-70">I'M</span> <span>WIDYMOTRET</span>
            </h1>
            <p class="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('tagline', aboutData.tagline)}
            </p>
          </div>

          {/* Hero Gallery - 1 square left + 2 landscape right */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8">
            {/* Square image on left - tall */}
            <div class="rounded-2xl overflow-hidden shadow-lg h-[360px] sm:h-[420px] md:h-[480px]">
              <AboutImage
                src={aboutImage('hero_main', aboutData.heroImage)}
                alt="Photographer"
                class="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
            </div>

            {/* Right side - 2 landscape stacked vertically */}
            <div class="flex flex-col gap-4">
              <div class="rounded-2xl overflow-hidden shadow-lg h-[170px] sm:h-[200px] md:h-[232px]">
                <AboutImage
                  src={aboutImage('hero_right_top', aboutData.heroGallery[0])}
                  alt="Gallery"
                  class="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>
              <div class="rounded-2xl overflow-hidden shadow-lg h-[170px] sm:h-[200px] md:h-[232px]">
                <AboutImage
                  src={aboutImage('hero_right_bottom', aboutData.heroGallery[1])}
                  alt="Gallery"
                  class="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Story Section */}
      <section class="py-14 md:py-20 px-4 md:px-6 bg-white">
        <div class="container mx-auto max-w-6xl">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center scroll-reveal" ref={storyRef}>
            {/* Left: Text */}
            <div>
              <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">{t('story_heading', 'Our Story')}</h2>
              <div class="space-y-5 md:space-y-6">
                <p class="text-gray-700 text-base md:text-lg leading-relaxed">{t('story_paragraph0', 'Cinta saya pada fotografi dimulai dengan kamera pinjaman dan matahari terbenam.')}</p>
                <p class="text-gray-700 text-base md:text-lg leading-relaxed">{t('story_paragraph1', 'Sejak saat itu, saya mengejar cahaya, tawa, dan momen-momen di antara yang membuat hidup terasa nyata.')}</p>
                <p class="text-gray-700 text-base md:text-lg leading-relaxed">{t('story_paragraph2', 'Saya memotret untuk melestarikan cerita—cerita yang sedang Anda jalani sekarang.')}</p>
              </div>
            </div>

            {/* Right: Stacked/Overlapping Images */}
            <div class="relative h-[300px] sm:h-[360px] md:h-[400px] flex items-center justify-center">
              {/* First image - slightly rotated, behind */}
              <div class="absolute top-0 right-4 sm:right-12 md:right-20 w-[160px] sm:w-[200px] md:w-[220px] h-[210px] sm:h-[255px] md:h-[280px] rounded-2xl overflow-hidden shadow-xl transform rotate-2 sm:rotate-6 hover:rotate-3 transition-transform duration-300 z-10">
                <AboutImage
                  src={aboutImage('story_img1', aboutData.myStory.galleryImages[0])}
                  alt="Story 1"
                  class="w-full h-full object-cover"
                />
              </div>
              {/* Second image - slightly rotated opposite, in front */}
              <div class="absolute bottom-0 left-4 sm:left-12 md:left-20 w-[160px] sm:w-[200px] md:w-[220px] h-[210px] sm:h-[255px] md:h-[280px] rounded-2xl overflow-hidden shadow-xl transform -rotate-2 sm:-rotate-6 hover:-rotate-3 transition-transform duration-300 z-20">
                <AboutImage
                  src={aboutImage('story_img2', aboutData.myStory.galleryImages[1])}
                  alt="Story 2"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Quote Section */}
      <section class="py-20 px-6 bg-gray-50">
        <div class="container mx-auto max-w-3xl text-center scroll-reveal" ref={philosophyRef}>
          <h2 class="text-3xl font-bold text-gray-900 mb-8">{t('philosophy_title', 'Filosofi')}</h2>
          <p class="text-2xl md:text-3xl font-bold text-gray-900 leading-relaxed">
            {t('philosophy_quote', aboutData.philosophyQuote)}
          </p>
        </div>
      </section>

      {/* Behind the Lens Gallery Section */}
      <section class="py-14 md:py-20 px-4 md:px-6 bg-white">
        <div class="container mx-auto max-w-6xl">
          <div class="text-center mb-12 scroll-reveal" ref={behindTheLensRef}>
            <h2 class="text-3xl font-bold text-gray-900 mb-4">{t('behind_lens_heading', 'Behind the Lens')}</h2>
            <p class="text-lg text-gray-600 mb-4">{t('behind_lens_tagline', 'Ketika kami tidak berada di belakang kamera, kami mendaki, menyeruput kopi, atau mengejar matahari terbenam.')}</p>
            <p class="text-gray-600">{t('behind_lens_description', 'Setiap momen yang tertangkap adalah cerita yang terpelihara seumur hidup.')}</p>
          </div>

          {/* 3-Column Layout: Left (3 landscape) - Center (1 portrait) - Right (3 landscape) */}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Left Column - 3 landscape photos */}
            <div class="flex flex-col gap-4">
              <For each={[
                { field: 'btl_left1', fallback: aboutData.behindTheLens.leftImages[0] },
                { field: 'btl_left2', fallback: aboutData.behindTheLens.leftImages[1] },
                { field: 'btl_left3', fallback: aboutData.behindTheLens.leftImages[2] },
              ]}>
                {(image) => (
                  <div class="rounded-2xl overflow-hidden shadow-lg h-[180px] sm:h-[200px]">
                    <AboutImage
                      src={aboutImage(image.field, image.fallback)}
                      alt="Behind the lens left"
                      class="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
              </For>
            </div>

            {/* Center Column - 1 portrait photo (tall) */}
            <div class="rounded-2xl overflow-hidden shadow-lg h-[420px] sm:h-[520px] md:h-[616px]">
              <AboutImage
                src={aboutImage('btl_center', aboutData.behindTheLens.centerImage)}
                alt="Behind the lens center"
                class="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
            </div>

            {/* Right Column - 3 landscape photos */}
            <div class="flex flex-col gap-4">
              <For each={[
                { field: 'btl_right1', fallback: aboutData.behindTheLens.rightImages[0] },
                { field: 'btl_right2', fallback: aboutData.behindTheLens.rightImages[1] },
                { field: 'btl_right3', fallback: aboutData.behindTheLens.rightImages[2] },
              ]}>
                {(image) => (
                  <div class="rounded-2xl overflow-hidden shadow-lg h-[180px] sm:h-[200px]">
                    <AboutImage
                      src={aboutImage(image.field, image.fallback)}
                      alt="Behind the lens right"
                      class="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
              </For>
            </div>
          </div>

          <div class="text-center">
            <p class="text-gray-600 text-lg">{t('btl_closing_text', 'Setiap momen yang tertangkap adalah cerita yang terpelihara seumur hidup.')}</p>
          </div>
        </div>
      </section>

      {/* Team Section - Single Photo */}
      <section class="py-20 px-6 bg-gray-50">
        <div class="container mx-auto max-w-4xl">
          <div class="text-center mb-12 scroll-reveal" ref={teamRef}>
            <h2 class="text-3xl font-bold text-gray-900 mb-4">{t('team_heading', 'Our Team')}</h2>
            <p class="text-lg text-gray-600">{t('team_description', 'Temui pikiran kreatif di balik setiap bidikan yang menakjubkan. Tim dedicated kami membawa passion, expertise, dan komitmen untuk mengabadikan momen paling berharga Anda.')}</p>
          </div>

          {/* Team Photo - Full Width */}
          <div class="rounded-2xl overflow-hidden shadow-xl">
            <AboutImage
              src={aboutImage('team_photo', aboutData.teamPhoto)}
              alt="Our Team"
              class="w-full h-auto object-cover hover:scale-105 transition duration-300"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section class="py-20 px-6 bg-white">
        <div class="container mx-auto max-w-3xl text-center scroll-reveal" ref={ctaRef}>
          <h2 class="text-3xl font-bold text-gray-900 mb-4">{t('cta_heading', 'Made up your mind yet?')}</h2>
          <p class="text-lg text-gray-600 mb-10">{t('cta_subheading', 'Mari kita bicarakan visi Anda dan bagaimana saya bisa mewujudkannya')}</p>
          <button
            onClick={() => setIsContactModalOpen(true)}
            class="px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition duration-300 shadow-lg"
          >
            {t('cta_button', 'Contact me')}
          </button>
        </div>
      </section>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />

      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTop showThreshold={300} />
    </div>
  );
};

export default About;
