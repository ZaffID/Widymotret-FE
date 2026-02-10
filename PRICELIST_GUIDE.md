# Panduan Mengelola Pricelist

## Struktur Data

Semua data pricelist disimpan di **`src/data/services.ts`**

### Format Data

```typescript
{
  slug: 'nama-layanan',           // URL: /pricelist/nama-layanan
  title: 'Nama Layanan',          // Judul yang tampil
  description: 'Deskripsi...',    // Deskripsi layanan
  image: '/path/to/image.png',    // Gambar hero section
  packages: [                     // Array paket-paket
    {
      name: 'Nama Paket',
      price: 'Rp 100.000',
      description: 'Deskripsi paket',
      features: [
        'Fitur 1',
        'Fitur 2',
        'Fitur 3'
      ]
    }
  ]
}
```

## Cara Menambah Layanan Baru

1. Buka file **`src/data/services.ts`**
2. Tambahkan objek baru di array `servicesData`
3. Ikuti format di atas
4. Simpan file
5. ✅ **Otomatis muncul di:**
   - Dropdown navbar "Pricelist"
   - Halaman `/pricelist/[slug-anda]`
   - Footer services list

## Cara Menambah Paket dalam Layanan

Tambahkan objek baru di array `packages` dalam layanan yang ingin ditambah:

```typescript
{
  slug: 'studio',
  title: 'Studio Photoshoot',
  // ... data lainnya
  packages: [
    // ... paket yang sudah ada
    {
      name: 'Paket Baru',
      price: 'Rp 500.000',
      description: 'Deskripsi paket baru',
      features: [
        'Fitur 1',
        'Fitur 2'
      ]
    }
  ]
}
```

## Cara Mengedit Harga/Fitur

1. Buka **`src/data/services.ts`**
2. Cari layanan berdasarkan `slug`
3. Edit bagian yang diinginkan:
   - `price`: Harga paket
   - `features`: Array fitur-fitur
   - `description`: Deskripsi paket
4. Simpan file

## Contoh: Menambah Layanan "Maternity"

```typescript
{
  slug: 'maternity',
  title: 'Maternity Photoshoot',
  description: 'Abadikan momen kehamilan dengan foto maternity yang indah dan memukau.',
  image: '/public/maternity.png',
  packages: [
    {
      name: 'Maternity Basic',
      price: 'Rp 400.000',
      description: 'Paket dasar foto maternity',
      features: [
        '1 jam photoshoot',
        '1 konsep & background',
        '20 foto edited',
        'Softfile digital'
      ]
    },
    {
      name: 'Maternity Premium',
      price: 'Rp 750.000',
      description: 'Paket lengkap dengan pilihan konsep lebih banyak',
      features: [
        '2 jam photoshoot',
        '2 konsep & background',
        '40 foto edited',
        'Maternity gown tersedia',
        'Softfile digital',
        '1 cetak foto 20x30 cm'
      ]
    }
  ]
}
```

## Nomor WhatsApp

Nomor WhatsApp booking saat ini: **+62 812-3456-7890**

Untuk mengganti nomor:
1. Buka **`src/pages/ServiceDetail.tsx`**
2. Cari baris: `https://wa.me/6281234567890`
3. Ganti dengan nomor baru (format: 62xxxxxxxxxx)

## Tips

- **Slug** harus unik dan huruf kecil (gunakan dash untuk spasi)
- **Image** path harus sesuai dengan lokasi file di folder `public/`
- **Price** format bebas, tapi konsisten (misal: selalu pakai "Rp" atau "IDR")
- **Features** adalah array string, satu string = satu baris bullet point

## Troubleshooting

**Q: Layanan baru tidak muncul?**
- Pastikan sudah save file `services.ts`
- Cek console browser untuk error
- Pastikan format JSON benar (tidak ada koma berlebih/kurang)

**Q: Gambar tidak muncul?**
- Pastikan file ada di folder `public/`
- Cek path image sudah benar
- Nama file case-sensitive

**Q: Ingin ubah layout halaman pricelist?**
- Edit file **`src/pages/ServiceDetail.tsx`**
- Bagian `{/* Packages Section */}` adalah layout paket
- Saat ini menggunakan grid 2 kolom, bisa diganti sesuai kebutuhan
