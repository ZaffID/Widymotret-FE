import { Component, createSignal, onMount } from 'solid-js';
import { FaSolidArrowUp } from 'solid-icons/fa';

interface ScrollToTopProps {
  showThreshold?: number; // pixels scrolled before showing button
}

const ScrollToTop: Component<ScrollToTopProps> = (props) => {
  const [isVisible, setIsVisible] = createSignal(false);
  const threshold = props.showThreshold ?? 300;

  onMount(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      class={`fixed bottom-8 right-8 w-12 h-12 bg-[#464C43] text-white rounded-full shadow-lg hover:bg-[#576250] transition-all duration-300 flex items-center justify-center z-40 ${
        isVisible()
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Scroll to top"
      title="Kembali ke atas"
    >
      <FaSolidArrowUp class="w-5 h-5" />
    </button>
  );
};

export default ScrollToTop;
