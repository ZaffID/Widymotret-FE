import { ApiResponse, EditableContent, BatchContentUpdate } from '../types/content';

// Mock content data for development
const mockContentStore = new Map<string, EditableContent>([
  // ===== HERO SECTION =====
  ['hero.title', {
    id: '1',
    section: 'hero',
    field: 'title',
    value: 'Setiap Momen Punya Cerita',
    updated_at: new Date().toISOString(),
  }],
  ['hero.subtitle', {
    id: '2',
    section: 'hero',
    field: 'subtitle',
    value: 'Kami mengabadikan momen melalui foto dan video dengan pendekatan yang sederhana, rapi, dan penuh perhatian pada detail.',
    updated_at: new Date().toISOString(),
  }],
  
  // ===== INTRODUCTION SECTION =====
  ['introduction.heading', {
    id: '3',
    section: 'introduction',
    field: 'heading',
    value: 'Halo, Anda sudah menemukan kami!',
    updated_at: new Date().toISOString(),
  }],
  ['introduction.description1', {
    id: '4',
    section: 'introduction',
    field: 'description1',
    value: 'Di antara perjalanan waktu dan berbagai pertemuan yang tak terduga, akhirnya kita dipertemukan di momen ini. Kami senang karya kami bisa menarik perhatian Anda.',
    updated_at: new Date().toISOString(),
  }],
  ['introduction.description2', {
    id: '5',
    section: 'introduction',
    field: 'description2',
    value: 'Melalui kecintaan kami pada fotografi dan videografi, kami berusaha menangkap setiap detail, rasa, dan emosi dari momen berharga, agar setiap kenangan penting dapat tersimpan dengan indah dan bermakna.',
    updated_at: new Date().toISOString(),
  }],
  
  // ===== ABOUT SECTION =====
  ['about.title', {
    id: '6',
    section: 'about',
    field: 'title',
    value: 'Widymotret',
    updated_at: new Date().toISOString(),
  }],
  ['about.description1', {
    id: '7',
    section: 'about',
    field: 'description1',
    value: 'Widymotret adalah studio fotografi yang berdiri sejak 2021 dan melayani berbagai kebutuhan pemotretan.',
    updated_at: new Date().toISOString(),
  }],
  ['about.description2', {
    id: '8',
    section: 'about',
    field: 'description2',
    value: 'Kami menyesuaikan gaya foto sesuai keinginan klien, mulai dari natural, elegan, hingga cinematic, dengan fokus pada kenyamanan dan hasil yang rapi serta berkesan.',
    updated_at: new Date().toISOString(),
  }],
  
  // ===== SERVICES SECTION =====
  ['services.title', {
    id: '9',
    section: 'services',
    field: 'title',
    value: 'Services',
    updated_at: new Date().toISOString(),
  }],
  ['services.subtitle', {
    id: '10',
    section: 'services',
    field: 'subtitle',
    value: 'untuk merencanakan dan mengatur acara spesial Anda',
    updated_at: new Date().toISOString(),
  }],
  
  // ===== BOOKING PROCESS SECTION =====
  ['booking.title', {
    id: '11',
    section: 'booking',
    field: 'title',
    value: 'Alur Booking',
    updated_at: new Date().toISOString(),
  }],
  ['booking.subtitle', {
    id: '12',
    section: 'booking',
    field: 'subtitle',
    value: 'Mulai dari konsultasi, pemilihan paket, hingga hari H — semua kami siapkan dengan profesional.',
    updated_at: new Date().toISOString(),
  }],
  ['booking.step1_title', {
    id: '13',
    section: 'booking',
    field: 'step1_title',
    value: 'Konsultasi & Cek Tanggal',
    updated_at: new Date().toISOString(),
  }],
  ['booking.step1_description', {
    id: '14',
    section: 'booking',
    field: 'step1_description',
    value: 'Klien menghubungi kami melalui WhatsApp untuk konsultasi awal dan memastikan ketersediaan tanggal acara.',
    updated_at: new Date().toISOString(),
  }],
  ['booking.step2_title', {
    id: '15',
    section: 'booking',
    field: 'step2_title',
    value: 'Pilih Paket Fotografi',
    updated_at: new Date().toISOString(),
  }],
  ['booking.step2_description', {
    id: '16',
    section: 'booking',
    field: 'step2_description',
    value: 'Klien memilih paket yang sesuai kebutuhan, konsep, dan budget yang diinginkan.',
    updated_at: new Date().toISOString(),
  }],
  ['booking.step3_title', {
    id: '17',
    section: 'booking',
    field: 'step3_title',
    value: 'Konfirmasi & Pembayaran DP',
    updated_at: new Date().toISOString(),
  }],
  ['booking.step3_description', {
    id: '18',
    section: 'booking',
    field: 'step3_description',
    value: 'Setelah paket disepakati, klien melakukan pembayaran DP untuk mengamankan jadwal.',
    updated_at: new Date().toISOString(),
  }],
  ['booking.step4_title', {
    id: '19',
    section: 'booking',
    field: 'step4_title',
    value: 'Persiapan & Briefing',
    updated_at: new Date().toISOString(),
  }],
  ['booking.step4_description', {
    id: '20',
    section: 'booking',
    field: 'step4_description',
    value: 'Kami melakukan briefing detail terkait rundown acara, konsep foto, lokasi, dan kebutuhan teknis lainnya.',
    updated_at: new Date().toISOString(),
  }],
  ['booking.step5_title', {
    id: '21',
    section: 'booking',
    field: 'step5_title',
    value: 'Hari Pernikahan (Shooting Day)',
    updated_at: new Date().toISOString(),
  }],
  ['booking.step5_description', {
    id: '22',
    section: 'booking',
    field: 'step5_description',
    value: 'Tim fotografer hadir tepat waktu dan mengabadikan setiap momen penting secara profesional.',
    updated_at: new Date().toISOString(),
  }],
  ['booking.step6_title', {
    id: '23',
    section: 'booking',
    field: 'step6_title',
    value: 'Editing & Penyerahan Hasil',
    updated_at: new Date().toISOString(),
  }],
  ['booking.step6_description', {
    id: '24',
    section: 'booking',
    field: 'step6_description',
    value: 'Proses editing dilakukan sesuai standar kualitas studio, lalu hasil diserahkan sesuai paket yang dipilih.',
    updated_at: new Date().toISOString(),
  }],
  
  // ===== PORTFOLIO SECTION =====
  ['portfolio.title', {
    id: '25',
    section: 'portfolio',
    field: 'title',
    value: 'Our portofolios',
    updated_at: new Date().toISOString(),
  }],
  
  // ===== FEATURED SHOTS SECTION =====
  ['featured.title', {
    id: '26',
    section: 'featured',
    field: 'title',
    value: 'Potret Unggulan',
    updated_at: new Date().toISOString(),
  }],
  ['featured.subtitle', {
    id: '27',
    section: 'featured',
    field: 'subtitle',
    value: 'Sekilas pandang dari beberapa karya terbaik kami.',
    updated_at: new Date().toISOString(),
  }],
  
  // ===== TESTIMONIALS SECTION =====
  ['testimonials.title', {
    id: '28',
    section: 'testimonials',
    field: 'title',
    value: 'Testimoni',
    updated_at: new Date().toISOString(),
  }],
  ['testimonials.quote1', {
    id: '48',
    section: 'testimonials',
    field: 'quote1',
    value: 'Cara kalian menangkap momen hari kami sungguh luar biasa. Setiap foto adalah harta karun.',
    updated_at: new Date().toISOString(),
  }],
  ['testimonials.author1', {
    id: '49',
    section: 'testimonials',
    field: 'author1',
    value: 'Racheal and Tim',
    updated_at: new Date().toISOString(),
  }],
  ['testimonials.quote2', {
    id: '50',
    section: 'testimonials',
    field: 'quote2',
    value: 'Profesional, sabar, dan sangat berbakat.',
    updated_at: new Date().toISOString(),
  }],
  ['testimonials.author2', {
    id: '51',
    section: 'testimonials',
    field: 'author2',
    value: 'Agency Lead, Numa Studio',
    updated_at: new Date().toISOString(),
  }],
  ['testimonials.quote3', {
    id: '52',
    section: 'testimonials',
    field: 'quote3',
    value: 'Portrait saya selalu terlihat menakjubkan ketika ditangani oleh kalian.',
    updated_at: new Date().toISOString(),
  }],
  ['testimonials.author3', {
    id: '53',
    section: 'testimonials',
    field: 'author3',
    value: 'Mary Jane',
    updated_at: new Date().toISOString(),
  }],
  
  // ===== HOME CTA SECTION =====
  ['home.cta_heading', {
    id: '54',
    section: 'home',
    field: 'cta_heading',
    value: 'Siap Mengabadikan Momen Spesial Anda?',
    updated_at: new Date().toISOString(),
  }],
  ['home.cta_subheading', {
    id: '55',
    section: 'home',
    field: 'cta_subheading',
    value: 'Hubungi kami sekarang dan jadwalkan sesi pemotretan Anda',
    updated_at: new Date().toISOString(),
  }],
  ['home.cta_button', {
    id: '56',
    section: 'home',
    field: 'cta_button',
    value: 'Booking Sekarang',
    updated_at: new Date().toISOString(),
  }],
  
  // ===== CONTACT/SETTINGS SECTION =====
  ['settings.phone', {
    id: '29',
    section: 'settings',
    field: 'phone',
    value: '+62 812-3456-7890',
    updated_at: new Date().toISOString(),
  }],
  ['settings.email', {
    id: '30',
    section: 'settings',
    field: 'email',
    value: 'hello@widymotret.com',
    updated_at: new Date().toISOString(),
  }],
  ['settings.address', {
    id: '31',
    section: 'settings',
    field: 'address',
    value: 'Jl. Soekarno Hatta No. 45, Jakarta Selatan 12345',
    updated_at: new Date().toISOString(),
  }],
  ['settings.whatsapp', {
    id: '32',
    section: 'settings',
    field: 'whatsapp',
    value: '628123456789',
    updated_at: new Date().toISOString(),
  }],
  ['settings.instagram', {
    id: '33',
    section: 'settings',
    field: 'instagram',
    value: '@widymotret_studio',
    updated_at: new Date().toISOString(),
  }],

  // ===== ABOUT PAGE SECTION =====
  ['about_page.tagline', {
    id: '34',
    section: 'about_page',
    field: 'tagline',
    value: 'A passionate photographer with an eye for honest, powerful moments',
    updated_at: new Date().toISOString(),
  }],
  ['about_page.story_paragraph1', {
    id: '35',
    section: 'about_page',
    field: 'story_paragraph1',
    value: 'My love for photography started with a borrowed camera and a sunset.',
    updated_at: new Date().toISOString(),
  }],
  ['about_page.story_paragraph2', {
    id: '36',
    section: 'about_page',
    field: 'story_paragraph2',
    value: "Since then, I've chased light, laughter, and the in-between moments that make life feel real.",
    updated_at: new Date().toISOString(),
  }],
  ['about_page.story_paragraph3', {
    id: '37',
    section: 'about_page',
    field: 'story_paragraph3',
    value: 'I photograph to preserve stories—the ones you\'re living right now.',
    updated_at: new Date().toISOString(),
  }],
  ['about_page.philosophy_quote', {
    id: '38',
    section: 'about_page',
    field: 'philosophy_quote',
    value: 'I believe great photography happens when people feel seen, not posed.',
    updated_at: new Date().toISOString(),
  }],
  ['about_page.behind_lens_description', {
    id: '39',
    section: 'about_page',
    field: 'behind_lens_description',
    value: 'Every moment captured is a story preserved for a lifetime.',
    updated_at: new Date().toISOString(),
  }],
  ['about_page.team_description', {
    id: '40',
    section: 'about_page',
    field: 'team_description',
    value: 'Meet the creative minds behind every stunning shot. Our dedicated team brings passion, expertise, and a commitment to capturing your most precious moments.',
    updated_at: new Date().toISOString(),
  }],
  ['about_page.cta_heading', {
    id: '41',
    section: 'about_page',
    field: 'cta_heading',
    value: 'Made up your mind yet?',
    updated_at: new Date().toISOString(),
  }],
  ['about_page.cta_subheading', {
    id: '42',
    section: 'about_page',
    field: 'cta_subheading',
    value: "Let's talk about your visions and how I can bring them to life",
    updated_at: new Date().toISOString(),
  }],
  ['about_page.story_heading', {
    id: '43',
    section: 'about_page',
    field: 'story_heading',
    value: 'My story',
    updated_at: new Date().toISOString(),
  }],
  ['about_page.behind_lens_heading', {
    id: '44',
    section: 'about_page',
    field: 'behind_lens_heading',
    value: 'Behind the Lens',
    updated_at: new Date().toISOString(),
  }],
  ['about_page.behind_lens_tagline', {
    id: '45',
    section: 'about_page',
    field: 'behind_lens_tagline',
    value: "When I'm not behind the camera, I'm hiking, sipping coffee, or chasing sunsets.",
    updated_at: new Date().toISOString(),
  }],
  ['about_page.team_heading', {
    id: '46',
    section: 'about_page',
    field: 'team_heading',
    value: 'Meet Our Team',
    updated_at: new Date().toISOString(),
  }],
  ['about_page.cta_button', {
    id: '47',
    section: 'about_page',
    field: 'cta_button',
    value: 'Contact me',
    updated_at: new Date().toISOString(),
  }],
]);

/**
 * Fetch single content field
 */
export const getContent = async (
  section: string,
  field: string
): Promise<ApiResponse<EditableContent>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const key = `${section}.${field}`;
  const content = mockContentStore.get(key);

  if (!content) {
    return {
      success: false,
      message: 'Konten tidak ditemukan',
      error: `Field ${key} tidak ada`,
    };
  }

  return {
    success: true,
    message: 'Konten berhasil diambil',
    data: content,
  };
};

/**
 * Fetch all content for a section
 */
export const getSectionContent = async (
  section: string
): Promise<ApiResponse<EditableContent[]>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const contents = Array.from(mockContentStore.values())
    .filter(item => item.section === section);

  return {
    success: true,
    message: 'Konten section berhasil diambil',
    data: contents,
  };
};

/**
 * Update single content field
 */
export const updateContent = async (
  section: string,
  field: string,
  value: string
): Promise<ApiResponse<EditableContent>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const key = `${section}.${field}`;
  const existing = mockContentStore.get(key);

  if (!existing) {
    return {
      success: false,
      message: 'Konten tidak ditemukan',
      error: `Field ${key} tidak bisa diupdate`,
    };
  }

  const updated = {
    ...existing,
    value,
    updated_at: new Date().toISOString(),
  };

  mockContentStore.set(key, updated);

  return {
    success: true,
    message: 'Konten berhasil diperbarui',
    data: updated,
  };
};

/**
 * Batch update multiple fields
 */
export const batchUpdateContent = async (
  updates: BatchContentUpdate['updates']
): Promise<ApiResponse<EditableContent[]>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const results: EditableContent[] = [];

  for (const update of updates) {
    const key = `${update.section}.${update.field}`;
    const existing = mockContentStore.get(key);

    if (existing) {
      const updated = {
        ...existing,
        value: update.value,
        updated_at: new Date().toISOString(),
      };
      mockContentStore.set(key, updated);
      results.push(updated);
    }
  }

  if (results.length === 0) {
    return {
      success: false,
      message: 'Tidak ada konten yang berhasil diupdate',
    };
  }

  return {
    success: true,
    message: `${results.length} konten berhasil diperbarui`,
    data: results,
  };
};

/**
 * Delete content (set to empty, not actual deletion)
 */
export const deleteContent = async (
  section: string,
  field: string
): Promise<ApiResponse<void>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const key = `${section}.${field}`;
  const existing = mockContentStore.get(key);

  if (!existing) {
    return {
      success: false,
      message: 'Konten tidak ditemukan',
      error: `Field ${key} tidak bisa dihapus`,
    };
  }

  mockContentStore.delete(key);

  return {
    success: true,
    message: 'Konten berhasil dihapus',
  };
};

/**
 * Get all content (for full backup/preview)
 */
export const getAllContent = async (): Promise<ApiResponse<EditableContent[]>> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const allContent = Array.from(mockContentStore.values());

  return {
    success: true,
    message: 'Semua konten berhasil diambil',
    data: allContent,
  };
};
