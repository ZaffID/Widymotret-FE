export interface PortfolioImage {
  id: string;
  url: string;
  category: 'portrait' | 'event' | 'editorial' | 'retouching';
  title: string;
}

export interface PortfolioCategory {
  id: string;
  name: string;
  slug: 'portrait' | 'event' | 'editorial' | 'retouching';
  description: string;
}

// Portfolio categories
export const portfolioCategories: PortfolioCategory[] = [
  {
    id: '1',
    name: 'Portrait Photography',
    slug: 'portrait',
    description: 'Professional portrait sessions dengan style natural, elegan, dan cinematic',
  },
  {
    id: '2',
    name: 'Event and Wedding Coverage',
    slug: 'event',
    description: 'Dokumentasi lengkap acara spesial Anda dari awal hingga akhir',
  },
  {
    id: '3',
    name: 'Editorial and Brand Shots',
    slug: 'editorial',
    description: 'Fotografi komersial untuk brand, produk, dan keperluan marketing',
  },
  {
    id: '4',
    name: 'Image Retouching and Editing',
    slug: 'retouching',
    description: 'Editing profesional untuk hasil foto yang sempurna dan berkesan',
  },
];

// Portfolio images - menggunakan landscape dan portrait dari public folder
export const portfolioImages: PortfolioImage[] = [
  // Portrait Photography (5 images)
  {
    id: 'p1',
    url: '/portrait/portrait (1).png',
    category: 'portrait',
    title: 'Studio Portrait Session #1',
  },
  {
    id: 'p2',
    url: '/portrait/portrait (2).png',
    category: 'portrait',
    title: 'Studio Portrait Session #2',
  },
  {
    id: 'p3',
    url: '/portrait/portrait (3).png',
    category: 'portrait',
    title: 'Studio Portrait Session #3',
  },
  {
    id: 'p4',
    url: '/portrait/portrait (4).png',
    category: 'portrait',
    title: 'Studio Portrait Session #4',
  },
  {
    id: 'p5',
    url: '/portrait/portrait (5).png',
    category: 'portrait',
    title: 'Studio Portrait Session #5',
  },

  // Event and Wedding Coverage (5 images)
  {
    id: 'e1',
    url: '/landscape/landscape (1).png',
    category: 'event',
    title: 'Wedding Ceremony Moments',
  },
  {
    id: 'e2',
    url: '/landscape/landscape (2).png',
    category: 'event',
    title: 'Reception and Celebration',
  },
  {
    id: 'e3',
    url: '/landscape/landscape (3).png',
    category: 'event',
    title: 'Couple Moments',
  },
  {
    id: 'e4',
    url: '/landscape/landscape (4).png',
    category: 'event',
    title: 'Guest Gathering',
  },
  {
    id: 'e5',
    url: '/portrait/portrait (1).png',
    category: 'event',
    title: 'Detail Shots',
  },

  // Editorial and Brand Shots (5 images)
  {
    id: 'ed1',
    url: '/landscape/landscape (1).png',
    category: 'editorial',
    title: 'Brand Campaign #1',
  },
  {
    id: 'ed2',
    url: '/landscape/landscape (2).png',
    category: 'editorial',
    title: 'Product Photography',
  },
  {
    id: 'ed3',
    url: '/portrait/portrait (2).png',
    category: 'editorial',
    title: 'Lifestyle Editorial',
  },
  {
    id: 'ed4',
    url: '/landscape/landscape (3).png',
    category: 'editorial',
    title: 'Brand Campaign #2',
  },
  {
    id: 'ed5',
    url: '/landscape/landscape (4).png',
    category: 'editorial',
    title: 'Fashion Editorial',
  },

  // Image Retouching and Editing (6 images)
  {
    id: 'r1',
    url: '/portrait/portrait (1).png',
    category: 'retouching',
    title: 'Smooth Skin Retouching',
  },
  {
    id: 'r2',
    url: '/portrait/portrait (2).png',
    category: 'retouching',
    title: 'Color Grade Editing',
  },
  {
    id: 'r3',
    url: '/portrait/portrait (3).png',
    category: 'retouching',
    title: 'Cinematic Edit',
  },
  {
    id: 'r4',
    url: '/portrait/portrait (4).png',
    category: 'retouching',
    title: 'Professional Retouching',
  },
  {
    id: 'r5',
    url: '/landscape/landscape (1).png',
    category: 'retouching',
    title: 'Landscape Enhancement',
  },
  {
    id: 'r6',
    url: '/landscape/landscape (2).png',
    category: 'retouching',
    title: 'Color Correction',
  },
];

// Helper function to get images by category
export const getImagesByCategory = (slug: string): PortfolioImage[] => {
  return portfolioImages.filter(img => img.category === slug);
};

// Helper function to get category by slug
export const getCategoryBySlug = (slug: string): PortfolioCategory | undefined => {
  return portfolioCategories.find(cat => cat.slug === slug);
};
