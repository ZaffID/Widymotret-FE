import { Component, For, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { aboutData } from '../data/about';
import { contentStore } from '../stores/contentStore';
import './About.css';

const About: Component = () => {
  const navigate = useNavigate();

  onMount(async () => {
    await contentStore.loadSection('about_page');
  });

  // Helper: returns contentStore value, falls back to aboutData default
  const t = (field: string, fallback: string): string =>
    contentStore.getField('about_page', field) || fallback;

  return (
    <div class="min-h-screen bg-white">
      <Navbar hasWhiteBackground={true} />

      {/* Hero Section */}
      <section class="relative pt-32 pb-16 px-6 bg-white overflow-hidden">
        <div class="container mx-auto max-w-6xl">
          {/* Title and Tagline */}
          <div class="mb-12 text-center">
            <h1 class="text-5xl md:text-6xl font-bold mb-4 text-gray-900">
              <span class="opacity-70">I'M</span> <span>WIDYMOTRET</span>
            </h1>
            <p class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('tagline', aboutData.tagline)}
            </p>
          </div>

          {/* Hero Gallery - 1 square left + 2 landscape right */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Square image on left - tall */}
            <div class="rounded-2xl overflow-hidden shadow-lg h-[480px]">
              <img
                src={aboutData.heroImage}
                alt="Photographer"
                class="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
            </div>

            {/* Right side - 2 landscape stacked vertically */}
            <div class="flex flex-col gap-4">
              <div class="rounded-2xl overflow-hidden shadow-lg h-[232px]">
                <img
                  src={aboutData.heroGallery[0]}
                  alt="Gallery"
                  class="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>
              <div class="rounded-2xl overflow-hidden shadow-lg h-[232px]">
                <img
                  src={aboutData.heroGallery[1]}
                  alt="Gallery"
                  class="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Story Section */}
      <section class="py-20 px-6 bg-white">
        <div class="container mx-auto max-w-6xl">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <h2 class="text-4xl font-bold text-gray-900 mb-8">Our Story</h2>
              <div class="space-y-6">
                <p class="text-gray-700 text-lg leading-relaxed">Cinta saya pada fotografi dimulai dengan kamera pinjaman dan matahari terbenam.</p>
                <p class="text-gray-700 text-lg leading-relaxed">Sejak saat itu, saya mengejar cahaya, tawa, dan momen-momen di antara yang membuat hidup terasa nyata.</p>
                <p class="text-gray-700 text-lg leading-relaxed">Saya memotret untuk melestarikan cerita—cerita yang sedang Anda jalani sekarang.</p>
              </div>
            </div>

            {/* Right: Stacked/Overlapping Images */}
            <div class="relative h-[400px] flex items-center justify-center">
              {/* First image - slightly rotated, behind */}
              <div class="absolute top-0 right-12 md:right-20 w-[220px] h-[280px] rounded-2xl overflow-hidden shadow-xl transform rotate-6 hover:rotate-3 transition-transform duration-300 z-10">
                <img
                  src={aboutData.myStory.galleryImages[0]}
                  alt="Story 1"
                  class="w-full h-full object-cover"
                />
              </div>
              {/* Second image - slightly rotated opposite, in front */}
              <div class="absolute bottom-0 left-12 md:left-20 w-[220px] h-[280px] rounded-2xl overflow-hidden shadow-xl transform -rotate-6 hover:-rotate-3 transition-transform duration-300 z-20">
                <img
                  src={aboutData.myStory.galleryImages[1]}
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
        <div class="container mx-auto max-w-3xl text-center">
          <h2 class="text-4xl font-bold text-gray-900 mb-8">Filosofi</h2>
          <p class="text-3xl md:text-4xl font-bold text-gray-900 leading-relaxed">
            {t('philosophy_quote', aboutData.philosophyQuote)}
          </p>
        </div>
      </section>

      {/* Behind the Lens Gallery Section */}
      <section class="py-20 px-6 bg-white">
        <div class="container mx-auto max-w-6xl">
          <div class="text-center mb-12">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">Behind the Lens</h2>
            <p class="text-lg text-gray-600 mb-4">Ketika kami tidak berada di belakang kamera, kami mendaki, menyeruput kopi, atau mengejar matahari terbenam.</p>
          </div>

          {/* 3-Column Layout: Left (3 landscape) - Center (1 portrait) - Right (3 landscape) */}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Left Column - 3 landscape photos */}
            <div class="flex flex-col gap-4">
              <For each={aboutData.behindTheLens.leftImages}>
                {(image) => (
                  <div class="rounded-2xl overflow-hidden shadow-lg h-[200px]">
                    <img
                      src={image}
                      alt="Behind the lens left"
                      class="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
              </For>
            </div>

            {/* Center Column - 1 portrait photo (tall) */}
            <div class="rounded-2xl overflow-hidden shadow-lg h-[616px]">
              <img
                src={aboutData.behindTheLens.centerImage}
                alt="Behind the lens center"
                class="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
            </div>

            {/* Right Column - 3 landscape photos */}
            <div class="flex flex-col gap-4">
              <For each={aboutData.behindTheLens.rightImages}>
                {(image) => (
                  <div class="rounded-2xl overflow-hidden shadow-lg h-[200px]">
                    <img
                      src={image}
                      alt="Behind the lens right"
                      class="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                )}
              </For>
            </div>
          </div>

          <div class="text-center">
            <p class="text-gray-600 text-lg">Setiap momen yang tertangkap adalah cerita yang terpelihara seumur hidup.</p>
          </div>
        </div>
      </section>

      {/* Team Section - Single Photo */}
      <section class="py-20 px-6 bg-gray-50">
        <div class="container mx-auto max-w-4xl">
          <div class="text-center mb-12">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p class="text-lg text-gray-600">Temui pikiran kreatif di balik setiap bidikan yang menakjubkan. Tim dedicated kami membawa passion, expertise, dan komitmen untuk mengabadikan momen paling berharga Anda.</p>
          </div>

          {/* Team Photo - Full Width */}
          <div class="rounded-2xl overflow-hidden shadow-xl">
            <img
              src={aboutData.teamPhoto}
              alt="Our Team"
              class="w-full h-auto object-cover hover:scale-105 transition duration-300"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section class="py-20 px-6 bg-white">
        <div class="container mx-auto max-w-3xl text-center">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Made up your mind yet?</h2>
          <p class="text-lg text-gray-600 mb-10">Mari kita bicarakan visi Anda dan bagaimana saya bisa mewujudkannya</p>
          <button
            onClick={() => navigate('/#contact')}
            class="px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition duration-300 shadow-lg"
          >
            Contact me
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
