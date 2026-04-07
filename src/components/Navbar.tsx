import { Component, createSignal, onMount, onCleanup, createMemo, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { servicesData } from '../data/services';
import { AiOutlineMenu } from 'solid-icons/ai';

interface NavbarProps {
  onPricelistClick?: () => void;
  hasWhiteBackground?: boolean; // true jika halaman bg putih
}

interface NavService {
  slug: string;
  title: string;
}

const Navbar: Component<NavbarProps> = (props) => {
  const [scrollY, setScrollY] = createSignal(0);
  const [showDropdown, setShowDropdown] = createSignal(false);
  const [showMobileMenu, setShowMobileMenu] = createSignal(false);
  const [showMobileDropdown, setShowMobileDropdown] = createSignal(false);
  const [services, setServices] = createSignal<NavService[]>([]);
  const navigate = useNavigate();
  let dropdownTimeout: number | undefined;

  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  const bgOpacity = createMemo(() => {
    // Jika halaman punya bg putih, selalu solid black dengan opacity 0.9
    if (props.hasWhiteBackground) {
      return 0.7;
    }
    
    const scroll = scrollY();
    if (scroll === 0) return 0;
    // Fade in dari 0 sampai 0.7 dalam 100px scroll
    return Math.min(scroll / 100 * 0.7, 0.7);
  });

  const handleMouseEnter = () => {
    clearTimeout(dropdownTimeout);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeout = window.setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  const handleMobileNavigate = (path: string) => {
    navigate(path);
    setShowMobileMenu(false);
    setShowMobileDropdown(false);
  };

  // Load services from API
  const loadServices = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://widymotret-be-production-00a0.up.railway.app';
      const res = await fetch(`${apiUrl}/api/packages`);
      
      if (!res.ok) throw new Error(`Failed to fetch packages: ${res.status}`);
      
      const data = await res.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Build: hardcoded + unique categories from API
        const hardcodedMap = new Map(servicesData.map(s => [s.slug, { slug: s.slug, title: s.title }]));
        
        // Add API categories not in hardcoded
        data.data.forEach((pkg: any) => {
          const category = pkg.category?.toLowerCase();
          if (category && !hardcodedMap.has(category)) {
            hardcodedMap.set(category, {
              slug: category,
              title: category.charAt(0).toUpperCase() + category.slice(1)
            });
          }
        });
        
        setServices(Array.from(hardcodedMap.values()));
      } else {
        setServices(servicesData.map(s => ({ slug: s.slug, title: s.title })));
      }
    } catch (err) {
      console.error('[Navbar] Error loading services:', err);
      setServices(servicesData.map(s => ({ slug: s.slug, title: s.title })));
    }
  };

  onMount(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    loadServices();
  });

  // No need for effect, For loop will handle reactivity

  onCleanup(() => {
    window.removeEventListener('scroll', handleScroll);
    clearTimeout(dropdownTimeout);
  });

  return (
    <>
      <header 
        class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          'background-color': showMobileMenu()
            ? 'rgb(0, 0, 0)'
            : props.hasWhiteBackground 
              ? `rgba(0, 0, 0, ${bgOpacity()})`
              : scrollY() === 0 ? 'transparent' : `rgba(0, 0, 0, ${bgOpacity()})`,
          'backdrop-filter': (props.hasWhiteBackground || scrollY() > 0 || showMobileMenu()) ? 'blur(8px)' : 'none',
        }}
      >
        <nav class="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          {/* Mobile Hamburger Button - LEFT */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu())}
            class="md:hidden text-white hover:opacity-80 transition p-2"
          >
            <AiOutlineMenu size={24} />
          </button>
          
          {/* Logo - CENTER */}
          <button onClick={() => navigate('/')} class="hover:opacity-80 transition flex-shrink-0 flex-1 flex justify-center md:flex-none md:justify-start">
            <img src="/LOGO/BIGGER WM NEW PUTIH.png" alt="Widymotret" class="h-12 object-contain drop-shadow-lg" />
          </button>
          
          {/* Desktop Navigation - RIGHT */}
          <div class="hidden md:flex gap-8 text-white items-center">
            <button onClick={() => navigate('/')} class="hover:opacity-80 transition">Home</button>
            <button onClick={() => navigate('/about')} class="hover:opacity-80 transition">Tentang</button>
            <button onClick={() => navigate('/portfolio')} class="hover:opacity-80 transition">Portfolio</button>
            
            {/* Pricelist with Dropdown */}
            <div 
              class="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button class="hover:opacity-80 transition flex items-center gap-1">
                Pricelist
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu - Desktop */}
              <div 
                class="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg transition-all duration-200"
                classList={{
                  'opacity-100 visible translate-y-0': showDropdown(),
                  'opacity-0 invisible -translate-y-2': !showDropdown()
                }}
              >
                <For each={services()}>
                  {(service) => (
                    <button 
                      onClick={() => navigate(`/pricelist/${service.slug}`)}
                      class="w-full text-left px-4 py-3 text-gray-800 hover:bg-[#FAFAFA] hover:text-[#464C43] transition text-sm"
                    >
                      {service.title}
                    </button>
                  )}
                </For>
              </div>
            </div>
            
            <button onClick={() => navigate('/#contact')} class="hover:opacity-80 transition">Contact</button>
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar */}
      <div 
        class="fixed inset-0 z-40 md:hidden transition-all duration-300"
        classList={{
          'opacity-100 visible': showMobileMenu(),
          'opacity-0 invisible': !showMobileMenu()
        }}
        onClick={() => setShowMobileMenu(false)}
      >
        <div class="absolute inset-0 bg-black/50" />
      </div>

      <div 
        class="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-[#464C43] text-white shadow-lg md:hidden transition-transform duration-300 overflow-y-auto z-40"
        classList={{
          'translate-x-0': showMobileMenu(),
          '-translate-x-full': !showMobileMenu()
        }}
      >
        <div class="p-6 space-y-4">
          <button 
            onClick={() => handleMobileNavigate('/')}
            class="block w-full text-left py-3 px-4 hover:bg-white/10 rounded transition text-sm"
          >
            Home
          </button>
          
          <button 
            onClick={() => handleMobileNavigate('/about')}
            class="block w-full text-left py-3 px-4 hover:bg-white/10 rounded transition text-sm"
          >
            Tentang
          </button>
          
          <button 
            onClick={() => handleMobileNavigate('/portfolio')}
            class="block w-full text-left py-3 px-4 hover:bg-white/10 rounded transition text-sm"
          >
            Portfolio
          </button>

          {/* Mobile Pricelist Dropdown */}
          <div class="border-t border-white/20 pt-4">
            <button 
              onClick={() => setShowMobileDropdown(!showMobileDropdown())}
              class="w-full text-left py-3 px-4 hover:bg-white/10 rounded transition text-sm flex items-center justify-between"
            >
              Pricelist
              <svg 
                class="w-4 h-4 transition-transform"
                classList={{ 'rotate-180': showMobileDropdown() }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showMobileDropdown() && (
              <div class="pl-4 space-y-2 mt-2 border-l border-white/20">
                <For each={services()}>
                  {(service) => (
                    <button 
                      onClick={() => handleMobileNavigate(`/pricelist/${service.slug}`)}
                      class="block w-full text-left py-2 px-4 text-white/80 hover:text-white hover:bg-white/10 rounded transition text-xs"
                    >
                      {service.title}
                    </button>
                  )}
                </For>
              </div>
            )}
          </div>

          <button 
            onClick={() => handleMobileNavigate('/#contact')}
            class="block w-full text-left py-3 px-4 hover:bg-white/10 rounded transition text-sm border-t border-white/20"
          >
            Contact
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;

