import { Component, createSignal, onMount, onCleanup, createMemo, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { servicesData } from '../data/services';

interface NavbarProps {
  onPricelistClick?: () => void;
  hasWhiteBackground?: boolean; // true jika halaman bg putih
}

const Navbar: Component<NavbarProps> = (props) => {
  const [scrollY, setScrollY] = createSignal(0);
  const [showDropdown, setShowDropdown] = createSignal(false);
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

  onMount(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position
  });

  onCleanup(() => {
    window.removeEventListener('scroll', handleScroll);
    clearTimeout(dropdownTimeout);
  });

  return (
    <header 
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        'background-color': props.hasWhiteBackground 
          ? `rgba(0, 0, 0, ${bgOpacity()})`
          : scrollY() === 0 ? 'transparent' : `rgba(0, 0, 0, ${bgOpacity()})`,
        'backdrop-filter': (props.hasWhiteBackground || scrollY() > 0) ? 'blur(8px)' : 'none',
      }}
    >
      <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate('/')} class="text-white text-2xl font-bold tracking-wider hover:opacity-80 transition">
          WIDYMOTRET
        </button>
        <div class="flex gap-8 text-white items-center">
          <button onClick={() => navigate('/')} class="hover:opacity-80 transition">Home</button>
          <button onClick={() => navigate('/#about')} class="hover:opacity-80 transition">Tentang</button>
          <button onClick={() => navigate('/#portfolio')} class="hover:opacity-80 transition">Portfolio</button>
          
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
            
            {/* Dropdown Menu */}
            <div 
              class="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-200"
              classList={{
                'opacity-100 visible translate-y-0': showDropdown(),
                'opacity-0 invisible -translate-y-2': !showDropdown()
              }}
            >
              <For each={servicesData}>
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
  );
};

export default Navbar;
