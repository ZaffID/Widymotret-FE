# 📷 Widymotret Studio — Project Context & Reference

> **Dokumen ini berisi ringkasan lengkap project Widymotret-FE.**
> Bisa digunakan sebagai README, referensi onboarding, atau konteks untuk AI di session baru.

---

## 1. Gambaran Umum

| Aspek | Detail |
|---|---|
| **Nama** | Widymotret Studio |
| **Jenis** | Website portfolio & booking untuk studio fotografi |
| **Lokasi** | Jl. Raya Pernasidi No.3, Cilongok, Banyumas – Jawa Tengah |
| **Kontak** | Phone: +62 895-3511-15777 · Email: widymotret@gmail.com · IG: @widymotretstudio |
| **Framework** | SolidJS + TypeScript |
| **Bundler** | Vite 7 (port 3000) |
| **CSS** | Tailwind CSS 4 + custom CSS files |
| **Router** | @solidjs/router |
| **Package Manager** | pnpm |
| **Backend** | Belum ada — mock API di frontend |
| **Brand Colors** | `#576250` (olive green), `#464C43` (dark olive) |
| **Fonts** | Boska (Playfair Display) for headings, Switzer for body, Poppins for nav/buttons |

---

## 2. Tech Stack & Dependencies

```json
{
  "solid-js": "^1.9.9",
  "@solidjs/router": "^0.15.4",
  "solid-icons": "^1.2.0",
  "tailwindcss": "^4.1.13",
  "@tailwindcss/vite": "^4.1.13",
  "vite": "^7.1.4",
  "vite-plugin-solid": "^2.11.8",
  "solid-devtools": "^0.34.3",
  "typescript": "^5.9.2"
}
```

Scripts: `pnpm dev` (port 3000), `pnpm build`, `pnpm serve`

---

## 3. Folder Structure

```
Widymotret-FE/
├── index.html                    # Entry HTML, mounts #root
├── package.json
├── vite.config.ts                # Vite + SolidJS + Tailwind + devtools
├── tsconfig.json                 # strict, ESNext, jsx preserve, jsxImportSource: solid-js
├── API_INTEGRATION_GUIDE.md      # Panduan integrasi backend API
├── PRICELIST_GUIDE.md            # Panduan mengelola data pricelist
├── PROJECT_CONTEXT.md            # << Dokumen ini
│
├── public/
│   ├── home (1).png ... (4).jpg  # 4 hero carousel images
│   ├── landscape/                # landscape (1-4).png
│   ├── portrait/                 # portrait (1-6).png
│   ├── fonts/                    # PlayfairDisplay, Switzer, Poppins
│   ├── photography.png           # Service cover: studio, product
│   ├── ceremony.png              # Service cover: graduation
│   ├── birthday party pl.jpg     # Service cover: event
│   ├── wedding-design.png
│   └── diagonal (1-2).png
│
└── src/
    ├── index.tsx                 # Entry point — render(<App />, #root)
    ├── index.css                 # @import tailwindcss + font-face + animations
    ├── App.tsx                   # Router (6 routes)
    │
    ├── types/
    │   └── content.ts            # EditableContent, ApiResponse<T>, dll
    │
    ├── data/
    │   ├── services.ts           # servicesData[] — 5 layanan + packages
    │   ├── portfolio.ts          # portfolioCategories[] + portfolioImages[]
    │   └── about.ts              # aboutData — default data halaman About
    │
    ├── services/
    │   └── contentApi.ts         # Mock API (in-memory Map) — CRUD content
    │
    ├── stores/
    │   ├── contentStore.ts       # Singleton store (createRoot) for editable content
    │   └── authStore.ts          # Singleton store for admin auth (mock login)
    │
    ├── components/
    │   ├── Navbar.tsx            # Fixed navbar + pricelist dropdown
    │   ├── Footer.tsx            # Black footer 4-column
    │   ├── ImageCarousel.tsx     # Auto-play carousel (drag + touch + keyboard)
    │   ├── PriceList.tsx         # Legacy modal (Wedding Collections) — unused?
    │   ├── AdminGuard.tsx        # Route protection, redirect to /admin if !auth
    │   ├── admin/
    │   │   ├── EditableText.tsx  # Inline text editor (input/textarea) + API save
    │   │   ├── EditableText.css
    │   │   ├── EditableImage.tsx # Image editor: URL input OR file upload (FileReader)
    │   └── portfolio/
    │       ├── GalleryModal.tsx  # Lightbox modal (arrows, thumbnails, keyboard)
    │       └── GalleryModal.css
    │
    └── pages/
        ├── Home.tsx              # Landing page (574 lines, 10+ sections)
        ├── About.tsx             # About page (headings English, content Indonesian)
        ├── About.css
        ├── Portfolio.tsx         # Gallery with 4 categories + lightbox
        ├── Portfolio.css
        ├── ServiceDetail.tsx     # Dynamic /pricelist/:slug — packages + gallery
        └── admin/
            ├── AdminLogin.tsx    # Login form (mock: admin@example.com / 123456)
            └── AdminHome.tsx     # Central admin (1103 lines, 4 tabs)
```

---

## 4. Routing

Didefinisikan di `App.tsx`:

| Route | Component | Deskripsi |
|---|---|---|
| `/` | `Home` | Landing page utama |
| `/pricelist/:slug` | `ServiceDetail` | Detail layanan per slug |
| `/portfolio` | `Portfolio` | Galeri foto per kategori |
| `/about` | `About` | Halaman tentang studio |
| `/admin` | `AdminLogin` | Login admin |
| `/admin/home` | `AdminGuard > AdminHome` | Dashboard admin (dilindungi) |

---

## 5. Halaman Publik

### 5.1 Home (`Home.tsx` — 574 lines)

Halaman utama dengan 10+ section:

1. **Hero** — `ImageCarousel` (4 gambar dari `/public/home *`) + title + subtitle dari contentStore
2. **Introduction** — Heading + 2 paragraf deskripsi studio
3. **Services Carousel** — 3 service card terlihat, slider kiri/kanan dari `servicesData`
4. **Alur Booking** — 6 langkah (Konsultasi → Editing & Penyerahan) dari contentStore
5. **Portfolio Grid** — 4 foto landscape (2×2 grid) dengan hover overlay
6. **Potret Unggulan (Featured Shots)** — 5 portrait dalam carousel (prev/next/blur effect)
7. **Testimonials** — 3 testimoni dalam carousel auto-rotate, background `#464C43`
8. **Contact (Hubungi Kami)** — Info kontak (phone, email, location, IG) + Google Maps embed
9. **CTA Booking** — Gradient section + modal: "Cek Pricelist" atau "Booking via WhatsApp"
10. **Footer**

**Data pattern**: `t(section, field, fallback)` — ambil dari contentStore, fallback ke hardcoded value.

Sections yang di-load dari contentStore: `hero`, `introduction`, `services`, `booking`, `testimonials`, `settings`, `home`, `featured`

### 5.2 About (`About.tsx` — ~225 lines)

| Section | Heading (English) | Content (Indonesian, hardcoded) |
|---|---|---|
| Hero | "I'M WIDYMOTRET" | Tagline dari contentStore |
| My Story | "Our Story" | 3 paragraf hardcoded |
| Filosofi | "Filosofi" (Indonesia) | Quote dari contentStore |
| Behind the Lens | "Behind the Lens" | Tagline hardcoded + 7 foto gallery (3-1-3 layout) |
| Our Team | "Our Team" | Deskripsi hardcoded + 1 team photo |
| CTA | "Made up your mind yet?" | Subtitle hardcoded + "Contact me" button |

**Catatan penting**: Headings tetap English (kecuali "Filosofi"), konten/paragraf hardcoded dalam bahasa Indonesia langsung di JSX, **bukan** dari contentStore.

### 5.3 Portfolio (`Portfolio.tsx`)

- 4 kategori: **Portrait**, **Event & Wedding**, **Editorial & Brand Shots**, **Image Retouching**
- Tab navigation untuk filter kategori
- Grid layout dengan hover overlay (title + category)
- `GalleryModal` lightbox: arrows, keyboard nav, thumbnail strip, counter
- Stats section: total photos, categories, clients (50+), years (3+)
- CTA ke WhatsApp

### 5.4 ServiceDetail (`ServiceDetail.tsx` — 357 lines)

- Route: `/pricelist/:slug` — slug match dari `servicesData`
- Hero section dengan service image
- **Package Cards Grid**: Click card → smooth scroll ke detail view
- **Detail View**: Gallery slider + thumbnail strip + package info + features (checkmarks) + "Booking via WhatsApp" CTA
- **Comparison Table**: Semua paket side-by-side (nama, harga, "Lihat Detail")
- Semua CTA WhatsApp mengarah ke `wa.me/62895351115777` dengan pre-filled message

---

## 6. Data Layer

### 6.1 Services (`src/data/services.ts`)

5 layanan dengan total 30+ paket:

| Slug | Title | Packages | Harga Range |
|---|---|---|---|
| `studio` | Studio Photoshoot | 7 paket | Rp 25.000 – Rp 500.000 |
| `graduation` | Graduation Photoshoot | 3 paket | Rp 300.000 – Rp 500.000 |
| `event` | Event Photoshoot | 1 paket | Rp 350.000 |
| `product` | Product Photography | 1 paket | Rp 50.000/pcs |
| `wedding` | Wedding Photography & Videography | 14 paket | Rp 1.200.000 – Rp 6.500.000 |

Setiap `Package` punya: `name`, `price`, `description`, `features[]`

**Cara tambah layanan / paket** → lihat `PRICELIST_GUIDE.md`

### 6.2 Portfolio (`src/data/portfolio.ts`)

4 kategori, 21 foto total:
- Portrait: 5 images (p1-p5)
- Event: 5 images (e1-e5)
- Editorial: 5 images (ed1-ed5)
- Retouching: 6 images (r1-r6)

Helper: `getImagesByCategory(slug)`, `getCategoryBySlug(slug)`

### 6.3 About (`src/data/about.ts`)

Structured data: `title`, `tagline`, `heroImage`, `heroGallery[2]`, `myStory` (heading, paragraphs[3], galleryImages[2]), `philosophyQuote`, `behindTheLens` (heading, tagline, leftImages[3], centerImage, rightImages[3], description), `teamPhoto`, `teamDescription`, `cta`

**⚠ Catatan**: About.tsx sekarang hardcode konten Indonesia langsung di JSX. Data di `about.ts` hanya dipakai untuk path gambar, bukan teks.

---

## 7. State Management

### 7.1 Content Store (`src/stores/contentStore.ts` — 210 lines)

**Pattern**: `createRoot(createContentStore)` — singleton SolidJS store

**State**: `Map<string, EditableContent>` + `isLoading` + `error` + `lastUpdated`

**Methods**:
| Method | Fungsi |
|---|---|
| `getField(section, field)` | Ambil value dari store (empty string jika tidak ada) |
| `loadField(section, field)` | Load 1 field dari API |
| `loadSection(section)` | Load semua field dalam 1 section |
| `loadAll()` | Load semua content |
| `updateFieldLocal(section, field, value)` | Update local store (tanpa API call) |
| `clearError()` | Reset error state |
| `clear()` | Reset seluruh store |

### 7.2 Auth Store (`src/stores/authStore.ts` — 120 lines)

**Pattern**: `createRoot(createAuthStore)` — singleton

**Mock credentials**: `admin@example.com` / `123456`

**Methods**: `login(email, password)`, `logout()`, `isAuthenticated()`, `getAdmin()`, `getToken()`

**Persistence**: `localStorage` (adminToken + adminData)

---

## 8. Content API (Mock)

File: `src/services/contentApi.ts` (588 lines)

**Mode**: In-memory `Map<string, EditableContent>` — data hilang saat refresh.

**Sections tersedia di mock**:
- `hero` (title, subtitle)
- `introduction` (heading, description1, description2)
- `about` (title, description1, description2)
- `services` (title, subtitle)
- `booking` (title, subtitle, step1-6 title+description)
- `portfolio` (title)
- `featured` (title, subtitle)
- `testimonials` (title, quote1-3, author1-3)
- `home` (cta_heading, cta_subheading, cta_button)
- `settings` (phone, email, address, whatsapp, instagram)
- `about_page` (tagline, story_heading, story_paragraph1-3, philosophy_quote, behind_lens_heading, behind_lens_tagline, behind_lens_description, team_heading, team_description, cta_heading, cta_subheading, cta_button)

**API Functions**:
| Function | Deskripsi |
|---|---|
| `getContent(section, field)` | Fetch 1 field |
| `getSectionContent(section)` | Fetch semua field dalam section |
| `updateContent(section, field, value)` | Update 1 field |
| `batchUpdateContent(updates[])` | Update multiple fields sekaligus |
| `deleteContent(section, field)` | Hapus field |
| `getAllContent()` | Fetch semua content |

**Panduan integrasi backend** → lihat `API_INTEGRATION_GUIDE.md`

---

## 9. Admin Panel

### 9.1 Login (`AdminLogin.tsx` — 201 lines)

- Route: `/admin`
- Email + password form dengan validasi (regex email, min 6 char password)
- Mock: `admin@example.com` / `123456`
- Auto-redirect ke `/admin/home` jika sudah login
- Dark gradient background (`#464C43` → `#576250`)

### 9.2 Dashboard (`AdminHome.tsx` — 1103 lines)

Single-page admin dengan **4 tab** (navigasi via state `currentPage` signal, bukan routing):

#### Tab 1: 🏠 Halaman Utama
| Section | Komponen | Jumlah Field |
|---|---|---|
| Hero Section | 2 EditableText + 4 EditableImage (carousel) | 6 |
| Introduction | 3 EditableText (heading, desc1, desc2) | 3 |
| Services Preview | 2 EditableText + service image thumbnails (read-only) | 2 |
| Portfolio Grid | 4 EditableImage (landscape) | 4 |
| Potret Unggulan | 5 EditableImage + add/delete buttons | 5+ |
| Alur Booking | 2 EditableText + 6×(title+desc) = 14 total | 14 |
| Testimoni | 1 EditableText + 3×(quote+name) = 7 total | 7 |
| Contact | 5 EditableText (phone, email, WA, IG, address) | 5 |
| CTA | 3 EditableText (heading, sub, button) | 3 |

#### Tab 2: 💰 Pricelist
- Sub-tabs per service (5 tabs: Studio, Graduation, Event, Product, Wedding)
- Per service: 1 EditableImage (cover, aspect-[4/5]) + 2 EditableText (nama, deskripsi)
- Per package: 4 EditableText (nama, harga, deskripsi, fitur) + delete button
- Tombol "+ Tambah Paket Baru"

#### Tab 3: 📸 Portfolio
- Sub-tabs per kategori (4: Portrait, Event, Editorial, Retouching)
- Image count badge (hijau/kuning jika >20 foto)
- Grid EditableImage per foto + delete button
- Tombol "Tambah Foto"

#### Tab 4: 📖 Halaman About
| Section | Layout Detail |
|---|---|
| Galeri Hero | grid-cols-2 max-w-2xl: 1 portrait (row-span-2) + 2 landscape |
| Tagline | 1 EditableText |
| Cerita Saya | grid 3+2: 3 paragraf + judul (kiri), 2 EditableImage portrait (kanan) |
| Filosofi | 1 EditableText (kutipan) |
| Di Balik Lensa | heading + tagline + deskripsi + 7 foto (7-col grid) |
| Tim Kami | grid 1+3: 1 EditableImage + judul + deskripsi |
| CTA | 3 EditableText (judul, deskripsi, teks tombol) |

**Info tip**: "Klik pensil untuk edit teks. Hover gambar untuk edit/hapus/upload file lokal."

---

## 10. Komponen Reusable

### EditableText (`components/admin/EditableText.tsx`)

- **Mode tampilan**: Teks + tombol pensil (BiRegularPencil)
- **Mode edit**: Input/textarea + Simpan/Batal
- **Props**: `label`, `value`, `section`, `field`, `multiline?`, `onSave?`, `onError?`
- **Behavior**: Panggil `updateContent()` API saat simpan

### EditableImage (`components/admin/EditableImage.tsx`)

- **Mode tampilan**: Thumbnail + hover overlay (Edit/Delete)
- **Mode edit**: URL text input + file upload button
- **File upload**: FileReader → data URL (FE-only) atau `onUpload` callback untuk backend
- **Validasi**: image/* only, max 5MB
- **Props**: `label`, `value`, `section`, `field`, `aspectClass?`, `onSave?`, `onError?`, `onDelete?`, `onUpload?`

### ImageCarousel (`components/ImageCarousel.tsx`)

- Auto-play (default 5000ms)
- Mouse drag + touch support + keyboard arrows
- Fade transition between images
- Navigation dots

### GalleryModal (`components/portfolio/GalleryModal.tsx`)

- Fullscreen overlay lightbox
- Arrow navigation (prev/next) + keyboard (Arrow keys, Escape)
- Image counter + thumbnail strip
- Click outside to close

### AdminGuard (`components/AdminGuard.tsx`)

- Wraps admin routes
- `<Show when={isAuthenticated()} fallback={<Navigate href="/admin" />}>`

### Navbar (`components/Navbar.tsx`)

- Fixed position, transparent → opaque on scroll
- Logo "WIDYMOTRET"
- Links: Home, Tentang, Portfolio, Pricelist (dropdown), Contact
- Pricelist dropdown auto-generated dari `servicesData`
- `hasWhiteBackground` prop untuk halaman dengan bg putih

### Footer (`components/Footer.tsx`)

- 4-column black footer
- Column 1: Studio description
- Column 2: Quick Links (Home, About, Portfolio, Pricelist, Contact)
- Column 3: Services (5 links dari servicesData slugs)
- Column 4: Contact info + social links (FB, IG, WA)

---

## 11. Aset Gambar (public/)

| Folder | Isi | Digunakan di |
|---|---|---|
| `/` (root) | home (1-4), photography.png, ceremony.png, birthday party pl.jpg | Hero carousel, service covers |
| `/landscape/` | landscape (1-4).png | Portfolio, About gallery, homepage |
| `/portrait/` | portrait (1-6).png | Featured shots, About sections, portfolio |
| `/fonts/` | PlayfairDisplay (2), Switzer (2), Poppins (2) | Global typography |

---

## 12. CSS Files

| File | Fungsi |
|---|---|
| `src/index.css` | Tailwind import, @font-face (3 font families), keyframe animations (fadeInUp, fadeInOut, fadeInScale) |
| `src/pages/About.css` | Styles khusus About page |
| `src/pages/Portfolio.css` | Styles khusus Portfolio page |
| `src/components/PriceList.css` | Styles modal PriceList (legacy?) |
| `src/components/admin/EditableText.css` | Styles EditableText component |
| `src/components/portfolio/GalleryModal.css` | Styles lightbox modal |

---

## 13. Keputusan Arsitektur Penting

1. **Admin single-page** — Semua admin management di 1 file `AdminHome.tsx` (1103 lines) dengan tab navigation via `currentPage` signal, bukan sub-routes. Ini dipilih untuk menghindari lag navigasi antar tab.

2. **contentStore singleton pattern** — `createRoot(createContentStore)` membuat store global yang accessible dari komponen manapun tanpa prop drilling.

3. **Mock API** — `contentApi.ts` pakai in-memory Map. Saat backend siap, cukup ganti implementasi function di file ini. Panduan: `API_INTEGRATION_GUIDE.md`.

4. **About.tsx hardcoded text** — Teks About page di-hardcode langsung di JSX (bukan dari contentStore) karena masalah override bahasa. Content yang masih dari contentStore: tagline + philosophy_quote.

5. **EditableImage dual-mode** — Support URL input manual + file upload. Default: FileReader data URL (FE-only). Optional: `onUpload` callback untuk upload ke backend.

6. **Pricelist data-driven** — Semua data layanan + paket di `services.ts`. Komponen (Navbar dropdown, ServiceDetail, Admin pricelist tab) semuanya membaca dari sini secara otomatis.

---

## 14. Panduan Pengembangan

### Menambah Layanan Baru
1. Edit `src/data/services.ts` → tambah objek ke `servicesData[]`
2. Otomatis muncul di: Navbar dropdown, `/pricelist/:slug`, Footer, Admin pricelist tab

### Menambah Kategori Portfolio
1. Tambah ke `portfolioCategories[]` di `src/data/portfolio.ts`
2. Tambah images ke `portfolioImages[]` dengan category baru
3. Otomatis muncul di Portfolio page + Admin portfolio tab

### Integrasi Backend
1. Baca `API_INTEGRATION_GUIDE.md`
2. Ganti mock implementation di `src/services/contentApi.ts`
3. Ganti mock auth di `src/stores/authStore.ts`
4. Set `VITE_API_BASE_URL` di `.env`

### Dev Server
```bash
pnpm install
pnpm dev        # http://localhost:3000
```

### Build
```bash
pnpm build      # Output: dist/
pnpm serve      # Preview build
```

---

## 15. Status & Catatan

- ✅ Semua halaman publik fungsional (Home, About, Portfolio, ServiceDetail)
- ✅ Admin panel fungsional (login, 4 tab, text/image editing)
- ✅ Zero compilation errors
- ⚠️ Backend belum ada — semua data mock & hilang saat refresh
- ⚠️ `PriceList.tsx` (modal Wedding Collections) kemungkinan legacy — halaman ServiceDetail sudah menggantikan fungsinya
- ⚠️ Admin "add/delete" buttons menampilkan success message tapi belum mengubah state data
- ⚠️ Admin `AdminPortfolio.tsx` dan `AdminPricelist.tsx` ada tapi **UNUSED** — sudah dikonsolidasi ke `AdminHome.tsx`

---

*Dokumen ini dibuat otomatis berdasarkan pembacaan semua file source. Terakhir diperbarui: Maret 2026.*
