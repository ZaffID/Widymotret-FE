import { Component, createSignal, onMount, Show, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { authStore } from '../../stores/authStore';
import { contentStore } from '../../stores/contentStore';
import { EditableText } from '../../components/admin/EditableText';
import { EditableImage } from '../../components/admin/EditableImage';
import { servicesData } from '../../data/services';
import { portfolioCategories, getImagesByCategory } from '../../data/portfolio';

const AdminHome: Component = () => {
  const navigate = useNavigate();
  const admin = () => authStore.getAdmin();
  const [currentPage, setCurrentPage] = createSignal<'home' | 'pricelist' | 'portfolio' | 'about'>('home');
  const [activeServicePricelist, setActiveServicePricelist] = createSignal<string>('studio');
  const [activeServicePortfolio, setActiveServicePortfolio] = createSignal<string>('portrait');
  const [saveMessage, setSaveMessage] = createSignal<{type: 'success' | 'error'; text: string} | null>(null);

  onMount(async () => {
    // Load all content on component mount
    await contentStore.loadAll();
  });

  const handleLogout = () => {
    authStore.logout();
    navigate('/admin', { replace: true });
  };

  const handleSave = (message: string) => {
    setSaveMessage({ type: 'success', text: message });
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleError = (message: string) => {
    setSaveMessage({ type: 'error', text: message });
  };

  return (
    <div class="min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <nav class="bg-[#464C43] text-white shadow-lg">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            {/* Logo */}
            <div class="flex items-center gap-3">
              <span class="text-xl font-bold">WIDYMOTRET</span>
              <span class="text-sm text-white/70 border-l border-white/30 pl-3">
                {currentPage() === 'home' && 'Halaman Utama'}
                {currentPage() === 'pricelist' && 'Pricelist'}
                {currentPage() === 'portfolio' && 'Portfolio'}
                {currentPage() === 'about' && 'Halaman About'}
              </span>
            </div>

            {/* User Menu */}
            <div class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium">{admin()?.name || 'Admin'}</p>
                <p class="text-xs text-white/70">{admin()?.email}</p>
              </div>
              
              {/* Avatar */}
              <div class="w-10 h-10 rounded-full bg-[#576250] flex items-center justify-center">
                <span class="text-lg font-bold">
                  {admin()?.name?.charAt(0) || 'A'}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main class="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-800">
            Selamat Datang, {admin()?.name?.split(' ')[0] || 'Admin'}! 👋
          </h1>
          <p class="text-gray-600 mt-2">
            Kelola konten website Widymotret Studio dari sini.
          </p>
        </div>

        {/* Success/Error Message */}
        <Show when={saveMessage()}>
          <div class={`mb-6 p-4 rounded-lg ${saveMessage()?.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {saveMessage()?.text}
          </div>
        </Show>

      {/* Tab Navigation */}
        <div class="bg-white rounded-xl shadow-sm p-1 mb-8 flex gap-2 flex-wrap">
          <button
            onClick={() => setCurrentPage('home')}
            class={`px-6 py-2 rounded-lg font-medium transition-all ${
              currentPage() === 'home'
                ? 'bg-[#576250] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🏠 Halaman Utama
          </button>
          <button
            onClick={() => setCurrentPage('pricelist')}
            class={`px-6 py-2 rounded-lg font-medium transition-all ${
              currentPage() === 'pricelist'
                ? 'bg-[#576250] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            💰 Pricelist
          </button>
          <button
            onClick={() => setCurrentPage('portfolio')}
            class={`px-6 py-2 rounded-lg font-medium transition-all ${
              currentPage() === 'portfolio'
                ? 'bg-[#576250] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📸 Portfolio
          </button>
          <button
            onClick={() => setCurrentPage('about')}
            class={`px-6 py-2 rounded-lg font-medium transition-all ${
              currentPage() === 'about'
                ? 'bg-[#576250] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📖 Halaman About
          </button>
        </div>

        {/* Content Management */}
        <div class="bg-white rounded-xl shadow-sm p-8">
          {/* HOME PAGE */}
          <Show when={currentPage() === 'home'}>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-8">Kelola Halaman Utama</h2>
              
              {/* Hero Section */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">🎬 Hero Section</h3>
                <EditableText
                  label="Hero Title"
                  value={contentStore.getField('hero', 'title')}
                  section="hero"
                  field="title"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('hero', 'title', value);
                    handleSave('Hero title berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Hero Subtitle"
                  value={contentStore.getField('hero', 'subtitle')}
                  section="hero"
                  field="subtitle"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('hero', 'subtitle', value);
                    handleSave('Hero subtitle berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <h4 class="text-sm font-semibold text-gray-600 mt-6 mb-3">Hero Carousel Images (4 gambar)</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <For each={[
                    { path: '/home (1).png', label: 'Hero Slide 1' },
                    { path: '/home (2).jpg', label: 'Hero Slide 2' },
                    { path: '/home (3).jpg', label: 'Hero Slide 3' },
                    { path: '/home (4).jpg', label: 'Hero Slide 4' },
                  ]}>
                    {(img, idx) => (
                      <EditableImage
                        label={img.label}
                        value={img.path}
                        section="hero"
                        field={`carousel_${idx()}`}
                        aspectClass="aspect-[4/3]"
                        onSave={(v) => handleSave(`Hero slide ${idx() + 1} berhasil diupdate`)}
                        onError={handleError}
                      />
                    )}
                  </For>
                </div>
              </div>

              {/* Introduction Section */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">📝 Introduction Section</h3>
                <EditableText
                  label="Heading"
                  value={contentStore.getField('introduction', 'heading')}
                  section="introduction"
                  field="heading"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('introduction', 'heading', value);
                    handleSave('Introduction heading berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Description 1"
                  value={contentStore.getField('introduction', 'description1')}
                  section="introduction"
                  field="description1"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('introduction', 'description1', value);
                    handleSave('Introduction description 1 berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Description 2"
                  value={contentStore.getField('introduction', 'description2')}
                  section="introduction"
                  field="description2"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('introduction', 'description2', value);
                    handleSave('Introduction description 2 berhasil disimpan');
                  }}
                  onError={handleError}
                />
              </div>

              {/* Services Section */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">🎯 Services Section</h3>
                <p class="text-sm text-gray-500 mb-4">Gambar service mengikuti data dari tab <strong>Pricelist</strong>. Edit gambar service di sana.</p>
                <EditableText
                  label="Title"
                  value={contentStore.getField('services', 'title')}
                  section="services"
                  field="title"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('services', 'title', value);
                    handleSave('Services title berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Subtitle"
                  value={contentStore.getField('services', 'subtitle')}
                  section="services"
                  field="subtitle"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('services', 'subtitle', value);
                    handleSave('Services subtitle berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                  <For each={servicesData}>
                    {(s) => (
                      <div class="text-center">
                        <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <img src={s.image} alt={s.title} class="w-full h-full object-cover" />
                        </div>
                        <p class="text-xs text-gray-500 mt-1">{s.title}</p>
                      </div>
                    )}
                  </For>
                </div>
              </div>

              {/* Portfolio Grid Preview */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">🖼️ Portfolio Grid (4 gambar)</h3>
                <p class="text-sm text-gray-500 mb-4">4 foto landscape yang tampil di homepage</p>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <For each={[
                    { path: '/landscape/landscape (1).png', label: 'Portfolio 1' },
                    { path: '/landscape/landscape (2).png', label: 'Portfolio 2' },
                    { path: '/landscape/landscape (3).png', label: 'Portfolio 3' },
                    { path: '/landscape/landscape (4).png', label: 'Portfolio 4' },
                  ]}>
                    {(img, idx) => (
                      <EditableImage
                        label={img.label}
                        value={img.path}
                        section="home"
                        field={`portfolio_grid_${idx()}`}
                        aspectClass="aspect-video"
                        onSave={(v) => handleSave(`Portfolio grid ${idx() + 1} berhasil diupdate`)}
                        onError={handleError}
                      />
                    )}
                  </For>
                </div>
              </div>

              {/* Potret Unggulan (Featured Shots) - ADDABLE */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">✨ Potret Unggulan (Featured Shots)</h3>
                <p class="text-sm text-gray-500 mb-4">Foto portrait yang ditampilkan di carousel. Bisa ditambah/hapus.</p>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <For each={[
                    '/portrait/portrait (1).png',
                    '/portrait/portrait (2).png',
                    '/portrait/portrait (3).png',
                    '/portrait/portrait (4).png',
                    '/portrait/portrait (5).png',
                  ]}>
                    {(img, idx) => (
                      <EditableImage
                        label={`Potret ${idx() + 1}`}
                        value={img}
                        section="home"
                        field={`featured_${idx()}`}
                        aspectClass="aspect-[3/4]"
                        onSave={(v) => handleSave(`Potret ${idx() + 1} berhasil diupdate`)}
                        onError={handleError}
                        onDelete={() => handleSave(`Potret ${idx() + 1} would be deleted`)}
                      />
                    )}
                  </For>
                </div>
                <button
                  onClick={() => handleSave('New potret unggulan would be added')}
                  class="mt-4 px-5 py-2.5 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium text-sm flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Potret Unggulan
                </button>
              </div>

              {/* Alur Booking Section */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">📅 Alur Booking (6 Steps)</h3>
                <EditableText
                  label="Section Title"
                  value={contentStore.getField('booking', 'title')}
                  section="booking"
                  field="title"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('booking', 'title', value);
                    handleSave('Booking title berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Section Subtitle"
                  value={contentStore.getField('booking', 'subtitle')}
                  section="booking"
                  field="subtitle"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('booking', 'subtitle', value);
                    handleSave('Booking subtitle berhasil disimpan');
                  }}
                  onError={handleError}
                />
                
                <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <For each={[1, 2, 3, 4, 5, 6]}>
                    {(step) => (
                      <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 class="font-bold text-gray-800 mb-3 text-sm">Step {step}</h4>
                        <EditableText
                          label={`Step ${step} Title`}
                          value={contentStore.getField('booking', `step${step}_title`)}
                          section="booking"
                          field={`step${step}_title`}
                          multiline={false}
                          onSave={(value) => {
                            contentStore.updateFieldLocal('booking', `step${step}_title`, value);
                            handleSave(`Step ${step} title berhasil disimpan`);
                          }}
                          onError={handleError}
                        />
                        <EditableText
                          label={`Step ${step} Description`}
                          value={contentStore.getField('booking', `step${step}_description`)}
                          section="booking"
                          field={`step${step}_description`}
                          multiline={true}
                          onSave={(value) => {
                            contentStore.updateFieldLocal('booking', `step${step}_description`, value);
                            handleSave(`Step ${step} description berhasil disimpan`);
                          }}
                          onError={handleError}
                        />
                      </div>
                    )}
                  </For>
                </div>
              </div>

              {/* Testimonials Section */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">⭐ Testimoni</h3>
                <EditableText
                  label="Judul Bagian"
                  value={contentStore.getField('testimonials', 'title')}
                  section="testimonials"
                  field="title"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('testimonials', 'title', value);
                    handleSave('Testimoni title berhasil disimpan');
                  }}
                  onError={handleError}
                />
                
                <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <For each={[1, 2, 3]}>
                    {(idx) => (
                      <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 class="font-bold text-gray-800 mb-3 text-sm">Testimoni {idx}</h4>
                        <EditableText
                          label={`Kutipan ${idx}`}
                          value={contentStore.getField('testimonials', `quote${idx}`)}
                          section="testimonials"
                          field={`quote${idx}`}
                          multiline={true}
                          onSave={(value) => {
                            contentStore.updateFieldLocal('testimonials', `quote${idx}`, value);
                            handleSave(`Kutipan ${idx} berhasil disimpan`);
                          }}
                          onError={handleError}
                        />
                        <EditableText
                          label={`Nama ${idx}`}
                          value={contentStore.getField('testimonials', `author${idx}`)}
                          section="testimonials"
                          field={`author${idx}`}
                          multiline={false}
                          onSave={(value) => {
                            contentStore.updateFieldLocal('testimonials', `author${idx}`, value);
                            handleSave(`Nama ${idx} berhasil disimpan`);
                          }}
                          onError={handleError}
                        />
                      </div>
                    )}
                  </For>
                </div>
              </div>

              {/* Contact Info Section */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">📞 Contact Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <EditableText
                    label="Phone"
                    value={contentStore.getField('settings', 'phone')}
                    section="settings"
                    field="phone"
                    multiline={false}
                    onSave={(value) => {
                      contentStore.updateFieldLocal('settings', 'phone', value);
                      handleSave('Nomor telepon berhasil disimpan');
                    }}
                    onError={handleError}
                  />
                  <EditableText
                    label="Email"
                    value={contentStore.getField('settings', 'email')}
                    section="settings"
                    field="email"
                    multiline={false}
                    onSave={(value) => {
                      contentStore.updateFieldLocal('settings', 'email', value);
                      handleSave('Email berhasil disimpan');
                    }}
                    onError={handleError}
                  />
                  <EditableText
                    label="WhatsApp Number"
                    value={contentStore.getField('settings', 'whatsapp')}
                    section="settings"
                    field="whatsapp"
                    multiline={false}
                    onSave={(value) => {
                      contentStore.updateFieldLocal('settings', 'whatsapp', value);
                      handleSave('Nomor WhatsApp berhasil disimpan');
                    }}
                    onError={handleError}
                  />
                  <EditableText
                    label="Instagram Handle"
                    value={contentStore.getField('settings', 'instagram')}
                    section="settings"
                    field="instagram"
                    multiline={false}
                    onSave={(value) => {
                      contentStore.updateFieldLocal('settings', 'instagram', value);
                      handleSave('Instagram handle berhasil disimpan');
                    }}
                    onError={handleError}
                  />
                </div>
                <EditableText
                  label="Address"
                  value={contentStore.getField('settings', 'address')}
                  section="settings"
                  field="address"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('settings', 'address', value);
                    handleSave('Alamat berhasil disimpan');
                  }}
                  onError={handleError}
                />
              </div>

              {/* CTA Section */}
              <div>
                <h3 class="text-lg font-bold text-gray-800 mb-4">🚀 Call To Action (CTA)</h3>
                <EditableText
                  label="CTA Heading"
                  value={contentStore.getField('home', 'cta_heading')}
                  section="home"
                  field="cta_heading"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('home', 'cta_heading', value);
                    handleSave('CTA heading berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="CTA Subheading"
                  value={contentStore.getField('home', 'cta_subheading')}
                  section="home"
                  field="cta_subheading"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('home', 'cta_subheading', value);
                    handleSave('CTA subheading berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="CTA Button Text"
                  value={contentStore.getField('home', 'cta_button')}
                  section="home"
                  field="cta_button"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('home', 'cta_button', value);
                    handleSave('CTA button text berhasil disimpan');
                  }}
                  onError={handleError}
                />
              </div>
            </div>
          </Show>

          {/* PRICELIST PAGE */}
          <Show when={currentPage() === 'pricelist'}>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-8">💰 Kelola Pricelist</h2>
              <p class="text-gray-600 mb-6">Edit paket dan harga untuk setiap jenis layanan fotografi.</p>

              {/* Service Type Tabs */}
              <div class="bg-gray-50 rounded-xl p-1 mb-8 flex gap-2 flex-wrap">
                <For each={servicesData}>
                  {(service) => (
                    <button
                      onClick={() => setActiveServicePricelist(service.slug)}
                      class={`px-6 py-2 rounded-lg font-medium transition-all ${
                        activeServicePricelist() === service.slug
                          ? 'bg-[#576250] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {service.title}
                    </button>
                  )}
                </For>
              </div>

              <Show when={servicesData.find(s => s.slug === activeServicePricelist())}>
                {(service) => (
                  <div>
                    <h3 class="text-xl font-bold text-gray-800 mb-6">{service().title}</h3>

                    {/* Service Cover Image + Details */}
                    <div class="mb-8 pb-8 border-b-2 border-gray-200">
                      <h4 class="text-sm font-bold text-gray-800 mb-4">📋 Detail Layanan</h4>
                      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div class="md:col-span-1">
                          <EditableImage
                            label="Gambar Cover"
                            value={service().image}
                            section="service"
                            field={`${service().slug}_image`}
                            aspectClass="aspect-[4/5]"
                            onSave={(v) => handleSave('Gambar layanan berhasil diupdate')}
                            onError={handleError}
                          />
                        </div>
                        <div class="md:col-span-3">
                          <EditableText
                            label="Nama Layanan"
                            value={service().title}
                            section="service"
                            field={`${service().slug}_title`}
                            multiline={false}
                            onSave={(v) => handleSave('Nama layanan berhasil diupdate')}
                            onError={handleError}
                          />
                          <EditableText
                            label="Deskripsi Layanan"
                            value={service().description}
                            section="service"
                            field={`${service().slug}_description`}
                            multiline={true}
                            onSave={(v) => handleSave('Deskripsi layanan berhasil diupdate')}
                            onError={handleError}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Packages */}
                    <h4 class="text-sm font-bold text-gray-800 mb-4">📦 Paket Harga</h4>
                    <div class="space-y-4">
                      <For each={service().packages}>
                        {(pkg, idx) => (
                          <div class="p-5 bg-gray-50 rounded-lg border border-gray-200">
                            <div class="flex items-center justify-between mb-3">
                              <h5 class="font-bold text-gray-800 text-sm">Paket {idx() + 1}</h5>
                              <button class="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition text-xs">
                                ✕ Hapus
                              </button>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                              <EditableText
                                label="Nama Paket"
                                value={pkg.name}
                                section="service"
                                field={`${service().slug}_pkg${idx()}_name`}
                                multiline={false}
                                onSave={(v) => handleSave(`Nama paket berhasil diupdate`)}
                                onError={handleError}
                              />
                              <EditableText
                                label="Harga"
                                value={pkg.price}
                                section="service"
                                field={`${service().slug}_pkg${idx()}_price`}
                                multiline={false}
                                onSave={(v) => handleSave(`Harga paket berhasil diupdate`)}
                                onError={handleError}
                              />
                            </div>
                            <EditableText
                              label="Deskripsi"
                              value={pkg.description}
                              section="service"
                              field={`${service().slug}_pkg${idx()}_description`}
                              multiline={true}
                              onSave={(v) => handleSave(`Deskripsi paket berhasil diupdate`)}
                              onError={handleError}
                            />
                            <EditableText
                              label="Fitur (satu baris per fitur)"
                              value={pkg.features.join('\n')}
                              section="service"
                              field={`${service().slug}_pkg${idx()}_features`}
                              multiline={true}
                              onSave={(v) => handleSave(`Fitur paket berhasil diupdate`)}
                              onError={handleError}
                            />
                          </div>
                        )}
                      </For>
                    </div>
                    <button class="mt-4 px-5 py-2.5 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium text-sm">
                      + Tambah Paket Baru
                    </button>
                  </div>
                )}
              </Show>
            </div>
          </Show>

          {/* PORTFOLIO PAGE */}
          <Show when={currentPage() === 'portfolio'}>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-2">📸 Manajemen Portfolio</h2>
              <p class="text-gray-600 mb-6">Kelola foto galeri per kategori. Unlimited, tapi disarankan max 20 per kategori.</p>

              {/* Tabs Kategori */}
              <div class="bg-gray-50 rounded-xl p-1 mb-8 flex gap-2 flex-wrap">
                <For each={portfolioCategories}>
                  {(cat) => (
                    <button
                      onClick={() => setActiveServicePortfolio(cat.slug)}
                      class={`px-6 py-2 rounded-lg font-medium transition-all ${
                        activeServicePortfolio() === cat.slug
                          ? 'bg-[#576250] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  )}
                </For>
              </div>

              {/* Portfolio Images for selected category */}
              {(() => {
                const images = () => getImagesByCategory(activeServicePortfolio());
                const cat = () => portfolioCategories.find(c => c.slug === activeServicePortfolio());
                return (
                  <Show when={cat()}>
                    {(category) => (
                      <div>
                        <div class="flex items-center justify-between mb-4">
                          <div>
                            <h3 class="text-lg font-bold text-gray-800">{category().name}</h3>
                            <p class="text-sm text-gray-500">{category().description}</p>
                          </div>
                          <span class={`text-sm font-medium px-3 py-1 rounded-full ${
                            images().length > 20 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {images().length} foto
                            {images().length > 20 && ' ⚠️'}
                          </span>
                        </div>

                        {images().length > 20 && (
                          <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                            ⚠️ Kategori ini memiliki lebih dari 20 foto. Pertimbangkan untuk mengurangi agar performa tetap optimal.
                          </div>
                        )}

                        {/* Grid Foto */}
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <For each={images()}>
                            {(img, idx) => (
                              <EditableImage
                                label={img.title}
                                value={img.url}
                                section="portfolio"
                                field={`${category().slug}_${img.id}`}
                                aspectClass="aspect-square"
                                onSave={(v) => handleSave(`${img.title} berhasil diupdate`)}
                                onError={handleError}
                                onDelete={() => handleSave(`${img.title} akan dihapus`)}
                              />
                            )}
                          </For>
                        </div>

                        {/* Tambah Foto Baru */}
                        <button
                          onClick={() => handleSave(`Foto baru akan ditambah ke ${category().name}`)}
                          class="mt-6 w-full py-3 px-4 bg-[#576250] text-white rounded-lg hover:bg-[#464C43] transition font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Tambah Foto ke {category().name}
                        </button>
                      </div>
                    )}
                  </Show>
                );
              })()}
            </div>
          </Show>

          {/* ABOUT PAGE */}
          <Show when={currentPage() === 'about'}>
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-2">Kelola Halaman Tentang</h2>
              <p class="text-gray-500 text-sm mb-8">Edit teks dan gambar pada halaman <code class="bg-gray-100 px-1 rounded">/about</code></p>

              {/* Hero Gallery - ADDABLE (max 3 photos with specific layout) */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-2">🖼️ Galeri Hero (bagian atas halaman)</h3>
                <p class="text-sm text-gray-500 mb-4">Layout: 1 foto portrait (kiri) + 2 foto landscape (kanan atas & bawah).</p>
                <div class="grid grid-cols-2 gap-2 max-w-2xl">
                  <div class="md:row-span-2">
                    <EditableImage
                      label="Foto Utama"
                      value="/portrait/portrait (1).png"
                      section="about"
                      field="hero_main"
                      aspectClass="aspect-[3/4]"
                      onSave={(v) => handleSave('Foto utama berhasil diupdate')}
                      onError={handleError}
                    />
                  </div>
                  <div>
                    <EditableImage
                      label="Foto 2"
                      value="/landscape/landscape (2).png"
                      section="about"
                      field="hero_right_top"
                      aspectClass="aspect-[3/2]"
                      onSave={(v) => handleSave('Foto 2 berhasil diupdate')}
                      onError={handleError}
                    />
                  </div>
                  <div>
                    <EditableImage
                      label="Foto 3"
                      value="/landscape/landscape (3).png"
                      section="about"
                      field="hero_right_bottom"
                      aspectClass="aspect-[3/2]"
                      onSave={(v) => handleSave('Foto 3 berhasil diupdate')}
                      onError={handleError}
                    />
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Tagline</h3>
                <EditableText
                  label="Tagline (di bawah judul)"
                  value={contentStore.getField('about_page', 'tagline')}
                  section="about_page"
                  field="tagline"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'tagline', value);
                    handleSave('Tagline berhasil disimpan');
                  }}
                  onError={handleError}
                />
              </div>

              {/* My Story */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4\">Cerita Saya</h3>
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div class="md:col-span-3">
                    <EditableText
                      label="Judul"
                      value={contentStore.getField('about_page', 'story_heading')}
                      section="about_page"
                      field="story_heading"
                      multiline={false}
                      onSave={(value) => {
                        contentStore.updateFieldLocal('about_page', 'story_heading', value);
                        handleSave('Judul berhasil disimpan');
                      }}
                      onError={handleError}
                    />
                    <For each={[1, 2, 3]}>
                      {(idx) => (
                        <EditableText
                          label={`Paragraf ${idx}`}
                          value={contentStore.getField('about_page', `story_paragraph${idx}`)}
                          section="about_page"
                          field={`story_paragraph${idx}`}
                          multiline={true}
                          onSave={(value) => {
                            contentStore.updateFieldLocal('about_page', `story_paragraph${idx}`, value);
                            handleSave(`Paragraf ${idx} berhasil disimpan`);
                          }}
                          onError={handleError}
                        />
                      )}
                    </For>
                  </div>
                  <div class="md:col-span-2">
                    <h4 class="text-sm font-semibold text-gray-600 mb-2">Galeri (2 Foto)</h4>
                    <EditableImage
                      label="Foto 1"
                      value="/portrait/portrait (2).png"
                      section="about"
                      field="story_img1"
                      aspectClass="aspect-[3/4]"
                      onSave={(v) => handleSave('Foto 1 berhasil diupdate')}
                      onError={handleError}
                    />
                    <EditableImage
                      label="Foto 2"
                      value="/portrait/portrait (3).png"
                      section="about"
                      field="story_img2"
                      aspectClass="aspect-[3/4]"
                      onSave={(v) => handleSave('Foto 2 berhasil diupdate')}
                      onError={handleError}
                    />
                  </div>
                </div>
              </div>

              {/* Philosophy Quote */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Filosofi</h3>
                <EditableText
                  label="Kutipan"
                  value={contentStore.getField('about_page', 'philosophy_quote')}
                  section="about_page"
                  field="philosophy_quote"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'philosophy_quote', value);
                    handleSave('Kuipan filosofi berhasil disimpan');
                  }}
                  onError={handleError}
                />
              </div>

              {/* Behind the Lens */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Di Balik Lensa</h3>
                <EditableText
                  label="Judul"
                  value={contentStore.getField('about_page', 'behind_lens_heading')}
                  section="about_page"
                  field="behind_lens_heading"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'behind_lens_heading', value);
                    handleSave('Judul berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Tagline"
                  value={contentStore.getField('about_page', 'behind_lens_tagline')}
                  section="about_page"
                  field="behind_lens_tagline"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'behind_lens_tagline', value);
                    handleSave('Tagline berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Deskripsi"
                  value={contentStore.getField('about_page', 'behind_lens_description')}
                  section="about_page"
                  field="behind_lens_description"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'behind_lens_description', value);
                    handleSave('Deskripsi berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <h4 class="text-sm font-semibold text-gray-600 mt-4 mb-2">Galeri Foto (7 foto)</h4>
                <div class="grid grid-cols-3 md:grid-cols-7 gap-2">
                  <For each={[
                    { path: '/landscape/landscape (1).png', label: '1', field: 'btl_left1' },
                    { path: '/landscape/landscape (2).png', label: '2', field: 'btl_left2' },
                    { path: '/landscape/landscape (3).png', label: '3', field: 'btl_left3' },
                    { path: '/portrait/portrait (2).png', label: '4', field: 'btl_center' },
                    { path: '/landscape/landscape (4).png', label: '5', field: 'btl_right1' },
                    { path: '/portrait/portrait (3).png', label: '6', field: 'btl_right2' },
                    { path: '/portrait/portrait (4).png', label: '7', field: 'btl_right3' },
                  ]}>
                    {(img) => (
                      <EditableImage
                        label={`Foto ${img.label}`}
                        value={img.path}
                        section="about"
                        field={img.field}
                        aspectClass="aspect-square"
                        onSave={(v) => handleSave(`Foto ${img.label} berhasil diupdate`)}
                        onError={handleError}
                      />
                    )}
                  </For>
                </div>
              </div>

              {/* Team */}
              <div class="mb-10 pb-10 border-b-2 border-gray-200">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Tim Kami</h3>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <EditableImage
                      label="Foto Tim"
                      value="/landscape/landscape (2).png"
                      section="about"
                      field="team_photo"
                      aspectClass="aspect-video"
                      onSave={(v) => handleSave('Foto tim berhasil diupdate')}
                      onError={handleError}
                    />
                  </div>
                  <div class="md:col-span-3">
                    <EditableText
                      label="Judul"
                      value={contentStore.getField('about_page', 'team_heading')}
                      section="about_page"
                      field="team_heading"
                      multiline={false}
                      onSave={(value) => {
                        contentStore.updateFieldLocal('about_page', 'team_heading', value);
                        handleSave('Judul berhasil disimpan');
                      }}
                      onError={handleError}
                    />
                    <EditableText
                      label="Deskripsi"
                      value={contentStore.getField('about_page', 'team_description')}
                      section="about_page"
                      field="team_description"
                      multiline={true}
                      onSave={(value) => {
                        contentStore.updateFieldLocal('about_page', 'team_description', value);
                        handleSave('Deskripsi berhasil disimpan');
                      }}
                      onError={handleError}
                    />
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div>
                <h3 class="text-lg font-bold text-gray-800 mb-4">Call to Action</h3>
                <EditableText
                  label="Judul"
                  value={contentStore.getField('about_page', 'cta_heading')}
                  section="about_page"
                  field="cta_heading"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'cta_heading', value);
                    handleSave('Judul berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Deskripsi"
                  value={contentStore.getField('about_page', 'cta_subheading')}
                  section="about_page"
                  field="cta_subheading"
                  multiline={true}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'cta_subheading', value);
                    handleSave('Deskripsi berhasil disimpan');
                  }}
                  onError={handleError}
                />
                <EditableText
                  label="Teks Tombol"
                  value={contentStore.getField('about_page', 'cta_button')}
                  section="about_page"
                  field="cta_button"
                  multiline={false}
                  onSave={(value) => {
                    contentStore.updateFieldLocal('about_page', 'cta_button', value);
                    handleSave('Teks tombol berhasil disimpan');
                  }}
                  onError={handleError}
                />
              </div>
            </div>
          </Show>

          {/* Info Note */}
          <div class="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p class="text-sm text-blue-800">
              💡 <strong>Tips:</strong> Klik pensil untuk edit teks. Hover gambar untuk edit/hapus/upload file lokal.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer class="bg-white border-t mt-auto py-4 px-6">
        <div class="container mx-auto text-center text-gray-500 text-sm">
          <p>© 2026 Widymotret Studio Admin Panel</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminHome;
