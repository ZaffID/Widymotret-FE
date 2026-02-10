export interface Package {
  name: string;
  price: string;
  description: string;
  features: string[];
}

export interface Service {
  slug: string;
  title: string;
  description: string;
  image: string;
  packages: Package[];
}

export const servicesData: Service[] = [
  {
    slug: 'studio',
    title: 'Studio Photoshoot',
    description: 'Layanan foto studio untuk berbagai kebutuhan, mulai dari pas foto hingga group photoshoot dengan kualitas profesional.',
    image: '/public/photography.png',
    packages: [
      {
        name: 'Pas Foto Ijazah',
        price: 'Rp 25.000',
        description: 'Pas foto profesional untuk keperluan ijazah dan dokumen resmi',
        features: [
          'Background merah, biru, atau putih',
          'Ukuran 2x3, 3x4, atau 4x6',
          'Softfile digital',
          'Professional edit'
        ]
      },
      {
        name: 'Pas Foto Couple',
        price: 'Rp 100.000',
        description: 'Paket pas foto untuk pasangan dengan konsep formal dan bebas',
        features: [
          'Background biru',
          '2 foto formal',
          '3 foto bebas',
          'Softfile digital',
          'Professional edit'
        ]
      },
      {
        name: 'Personal Photo',
        price: 'Rp 150.000',
        description: 'Sesi photoshoot personal dengan konsep pilihan Anda',
        features: [
          '1 orang',
          '20 menit photoshoot',
          '1 konsep & 1 background',
          'Hasil digital berkualitas tinggi'
        ]
      },
      {
        name: 'Mini Group',
        price: 'Rp 250.000',
        description: 'Cocok untuk foto bersama teman atau keluarga kecil',
        features: [
          '3-5 orang',
          '30 menit photoshoot',
          '1 konsep & 1 background',
          'Hasil digital untuk semua peserta'
        ]
      },
      {
        name: 'Medium Group',
        price: 'Rp 300.000',
        description: 'Paket untuk grup ukuran menengah dengan durasi lebih lama',
        features: [
          '5-10 orang',
          '30 menit photoshoot',
          '1 konsep & 1 background',
          'Hasil digital untuk semua peserta'
        ]
      },
      {
        name: 'Large Group',
        price: 'Rp 500.000',
        description: 'Ideal untuk foto organisasi atau acara grup besar',
        features: [
          '10-20 orang',
          '30 menit photoshoot',
          '1 konsep & 1 background',
          'Hasil digital untuk semua peserta'
        ]
      },
      {
        name: 'Extra Large Group',
        price: 'Rp 20.000 / orang',
        description: 'Paket fleksibel untuk grup sangat besar dengan harga per orang',
        features: [
          'Minimal 20 orang',
          'Maksimal 50 orang',
          '30 menit photoshoot',
          '1 konsep & 1 background'
        ]
      }
    ]
  },
  {
    slug: 'graduation',
    title: 'Graduation Photoshoot',
    description: 'Abadikan momen kelulusan Anda dengan foto wisuda yang profesional dan berkesan.',
    image: '/public/ceremony.png',
    packages: [
      {
        name: 'Graduation A',
        price: 'Rp 300.000',
        description: 'Paket foto wisuda untuk grup kecil',
        features: [
          'Maksimal 5 orang',
          '30 menit photoshoot',
          '1 konsep & 1 background',
          'Hasil digital berkualitas tinggi'
        ]
      },
      {
        name: 'Graduation B',
        price: 'Rp 450.000',
        description: 'Paket foto wisuda untuk grup menengah',
        features: [
          'Maksimal 10 orang',
          '30 menit photoshoot',
          '1 konsep & 1 background',
          'Hasil digital berkualitas tinggi'
        ]
      },
      {
        name: 'Graduation C',
        price: 'Rp 500.000',
        description: 'Paket foto wisuda untuk grup besar',
        features: [
          'Maksimal 15 orang',
          '30 menit photoshoot',
          '1 konsep & 1 background',
          'Hasil digital berkualitas tinggi'
        ]
      }
    ]
  },
  {
    slug: 'event',
    title: 'Event Photoshoot',
    description: 'Dokumentasi acara spesial Anda dengan konsep yang menarik dan memorable.',
    image: '/public/adawedding-design.png',
    packages: [
      {
        name: 'Birthday Party',
        price: 'Rp 350.000',
        description: 'Paket foto ulang tahun dengan konsep fun dan ceria',
        features: [
          'Maksimal 4 orang',
          '30 menit photoshoot',
          '1 konsep & 1 background space white',
          'Bebas membawa properti ulang tahun',
          'Boleh bawa kue, balon, dll'
        ]
      }
    ]
  },
  {
    slug: 'product',
    title: 'Product Photography',
    description: 'Foto produk profesional untuk kebutuhan bisnis dan promosi online Anda.',
    image: '/public/photography.png',
    packages: [
      {
        name: 'Photo Product',
        price: 'Rp 50.000 / pcs',
        description: 'Layanan foto produk dengan harga fleksibel',
        features: [
          'Harga per produk',
          'Syarat dan ketentuan berlaku',
          'Menyesuaikan jumlah produk',
          'Konsep sesuai kebutuhan',
          'Professional lighting & editing'
        ]
      }
    ]
  },
  {
    slug: 'wedding',
    title: 'Wedding Photography & Videography',
    description: 'Paket fotografi dan videografi pernikahan lengkap untuk menangkap setiap momen bahagia di hari spesial Anda.',
    image: '/landscape/landscape (1).png',
    packages: [
      {
        name: 'Photography Basic',
        price: 'Rp 2.500.000',
        description: 'Paket photography basic untuk pernikahan',
        features: [
          '1 Photographer',
          'Unlimited File (Maks 8 Hours)',
          '150+ Professional Editing',
          '1 Magnetic Album (Custom Name)',
          '120pcs 4r Print',
          'Free Flashdisk 16GB'
        ]
      },
      {
        name: 'Photography Bronze',
        price: 'Rp 3.000.000',
        description: 'Paket photography bronze dengan 2 fotografer',
        features: [
          '2 Photographer',
          'Unlimited File (Maks 8 Hours)',
          '250+ Professional Editing',
          '1 Magnetic Album (Custom Name)',
          '160pcs 4r Print',
          'Free Flashdisk 16GB'
        ]
      },
      {
        name: 'Photography Silver',
        price: 'Rp 4.000.000',
        description: 'Paket photography silver dengan album storybook',
        features: [
          '2 Photographer',
          'Unlimited File (Maks 8 Hours)',
          '300+ Professional Editing',
          '1 Storybook Album (11 Pages)',
          '1 Photobook Album (40 Photo)',
          'Free Flashdisk 32GB'
        ]
      },
      {
        name: 'Photography Silver Plus',
        price: 'Rp 4.500.000',
        description: 'Paket photography silver plus dengan durasi lebih panjang',
        features: [
          '2 Photographer',
          'Unlimited File (Maks 10 Hours)',
          '350+ Professional Editing',
          '1 Storybook Album (11 Pages)',
          '1 Photobook Album (80 Photo)',
          '1 Print 20rp (50x75cm)',
          'Free Flashdisk 32GB'
        ]
      },
      {
        name: 'Photography Gold',
        price: 'Rp 5.500.000',
        description: 'Paket photography gold dengan assistant',
        features: [
          '2 Photographer',
          '1 Assistant',
          'Unlimited File (Maks 10 Hours)',
          '400+ Professional Editing',
          '1 Storybook Album (11 Pages)',
          '1 Photobook Album (80 Photo)',
          '2 Print 20rp (50x75cm)',
          'Free Flashdisk 32GB'
        ]
      },
      {
        name: 'Photography Platinum',
        price: 'Rp 6.500.000',
        description: 'Paket photography platinum untuk dokumentasi maksimal',
        features: [
          '3 Photographer',
          'Unlimited File (Maks 12 Hours)',
          '500+ Professional Editing',
          '1 Storybook Album (11 Pages)',
          '1 Photobook Album (80 Photo)',
          '2 Print 20rp (50x75cm)',
          'Free Flashdisk 32GB'
        ]
      },
      {
        name: 'Videography Basic',
        price: 'Rp 1.200.000',
        description: 'Paket videography basic dengan cinematic teaser',
        features: [
          '1 Videographer',
          'Maks 8 Hours',
          '1 Minutes Cinematic Teaser',
          'Free to Request Song',
          'Send Via Google Drive'
        ]
      },
      {
        name: 'Videography Bronze',
        price: 'Rp 1.800.000',
        description: 'Paket videography bronze dengan cinematic clip',
        features: [
          '1 Videographer',
          'Maks 8 Hours',
          '3 Minutes Cinematic Clip',
          'Free to Request Song',
          'Send Via Google Drive'
        ]
      },
      {
        name: 'Videography Silver',
        price: 'Rp 2.500.000',
        description: 'Paket videography silver dengan teaser & clip',
        features: [
          '1 Videographer',
          'Maks 8 Hours',
          '1 Minutes Cinematic Teaser',
          '3 Minutes Cinematic Clip',
          'Free to Request Song',
          'Free Flashdisk 16GB'
        ]
      },
      {
        name: 'Videography Gold',
        price: 'Rp 3.500.000',
        description: 'Paket videography gold dengan documentary video',
        features: [
          '2 Videographer',
          'Maks 10 Hours',
          '1 Minutes Cinematic Teaser',
          '3 Minutes Cinematic Clip',
          '60-90 Minutes Documentary Video',
          'Free Sneakpeak',
          'Free to Request Song',
          'Free Flashdisk 32GB'
        ]
      },
      {
        name: 'Videography Gold (Same Day Edit)',
        price: 'Rp 4.500.000',
        description: 'Paket videography gold dengan same day edit feature',
        features: [
          '3 Videographer',
          'Same Day Edit',
          'Maks 10 Hours',
          '1 Minutes Cinematic Teaser',
          '3 Minutes Cinematic Clip',
          '60-90 Minutes Documentary Video',
          'Free Sneakpeak',
          'Free to Request Song',
          'Free Flashdisk 32GB'
        ]
      },
      {
        name: 'Photo & Video Basic',
        price: 'Rp 4.850.000',
        description: 'Paket kombinasi photo & video basic',
        features: [
          '1 Photographer',
          '1 Videographer',
          'Unlimited File (Maks 8 Hours)',
          '150+ Professional Editing',
          '1 Magnetic Album (Custom Name)',
          '120pcs 4r Print',
          '1 Minutes Cinematic Teaser',
          '3 Minutes Cinematic Clip',
          'Free to Request Song',
          'Free Flashdisk 16GB'
        ]
      },
      {
        name: 'Photo & Video Bronze',
        price: 'Rp 5.500.000',
        description: 'Paket kombinasi photo & video bronze',
        features: [
          '2 Photographer',
          '1 Videographer',
          'Unlimited File (Maks 8 Hours)',
          '250+ Professional Editing',
          '1 Magnetic Album (Custom Name)',
          '160pcs 4r Print',
          '1 Minutes Cinematic Teaser',
          '3 Minutes Cinematic Clip',
          'Free to Request Song',
          'Free Flashdisk 32GB'
        ]
      },
      {
        name: 'Photo & Video Bronze Plus',
        price: 'Rp 6.500.000',
        description: 'Paket kombinasi photo & video bronze plus dengan album premium',
        features: [
          '2 Photographer',
          '1 Videographer',
          'Unlimited File (Maks 8 Hours)',
          '350+ Professional Editing',
          '1 Storybook Album (11 Pages)',
          '1 Photobook Album (80 Photo)',
          '1 Minutes Cinematic Teaser',
          '3 Minutes Cinematic Clip',
          'Free to Request Song',
          'Free Flashdisk 32GB'
        ]
      }
    ]
  }
];
