import { onMount } from 'solid-js';

interface ScrollRevealOptions {
  threshold?: number; // 0-1, 0.5 = viewport center
  rootMargin?: string; // e.g., "0px 0px -50px 0px"
  duration?: number; // ms
  delay?: number; // ms per element in group
}

/**
 * Custom hook for scroll reveal animations
 * Returns a function to assign to ref
 * 
 * Usage:
 * const revealRef = useScrollReveal({ threshold: 0.3 });
 * <div ref={revealRef} class="scroll-reveal">Content</div>
 */
export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const {
    threshold = 0.5,
    rootMargin = '0px 0px -50px 0px',
    duration = 800,
    delay = 0,
  } = options;

  let element: HTMLElement | undefined;
  let isInitialized = false;

  onMount(() => {
    if (!element || isInitialized) return;
    isInitialized = true;

    // Set CSS variables for animation customization
    element.style.setProperty('--reveal-duration', `${duration}ms`);
    element.style.setProperty('--reveal-delay', `${delay}ms`);

    // Initially hide element for animation
    element.classList.add('scroll-reveal-hidden');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Element is in viewport
            entry.target.classList.remove('scroll-reveal-hidden');
            entry.target.classList.add('reveal-visible');
            // Stop observing after reveal
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  });

  return (el: HTMLElement) => {
    element = el;
  };
};

/**
 * Hook for revealing multiple child elements with stagger effect
 * 
 * Usage:
 * const groupRef = useScrollRevealGroup({ itemDelay: 100 });
 * <div ref={groupRef} class="scroll-reveal-group">
 *   <div class="scroll-reveal-item">...</div>
 *   <div class="scroll-reveal-item">...</div>
 * </div>
 */
export const useScrollRevealGroup = (options: ScrollRevealOptions & { itemDelay?: number } = {}) => {
  const {
    threshold = 0.5,
    rootMargin = '0px 0px -50px 0px',
    duration = 800,
    itemDelay = 80,
  } = options;

  let container: HTMLElement | undefined;
  let isInitialized = false;

  onMount(() => {
    console.log('[PortfolioReveal] onMount - container?', !!container);
    if (!container || isInitialized) return;
    isInitialized = true;

    const items = container.querySelectorAll('.scroll-reveal-item');
    console.log('[PortfolioReveal] Found', items.length, 'items to animate');
    items.forEach((item) => {
      item.classList.add('scroll-reveal-hidden');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          console.log('[PortfolioReveal] Scroll triggered!');
          if (entry.isIntersecting) {
            const items = entry.target.querySelectorAll('.scroll-reveal-item');
            
            // Check if any items already revealed (to avoid re-animating on scroll)
            const hasRevealedItems = Array.from(items).some(item => 
              item.classList.contains('reveal-visible')
            );
            
            if (!hasRevealedItems) {
              // Only animate if not already revealed (allows re-animation for category change)
              items.forEach((item, index) => {
                const delay = index * itemDelay;
                (item as HTMLElement).style.setProperty('--reveal-delay', `${delay}ms`);
                (item as HTMLElement).style.setProperty('--reveal-duration', `${duration}ms`);
                item.classList.remove('scroll-reveal-hidden');
                item.classList.add('reveal-visible');
              });
            }
            // Keep observing - don't unobserve, allows re-trigger on category change
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  });

  return (el: HTMLElement) => {
    console.log('[PortfolioReveal] Ref attached to:', el.className);
    container = el;
  };
};

/**
 * Hook for per-item scroll reveal animation
 * Each item animates individually as it enters viewport (not batched)
 * 
 * Usage:
 * const revealItem = useScrollRevealPerItem({ threshold: 0.2 });
 * <div ref={revealItem} class="scroll-reveal-item">...</div>
 */
export const useScrollRevealPerItem = (options: ScrollRevealOptions = {}) => {
  const {
    threshold = 0.2,
    rootMargin = '0px 0px -50px 0px',
    duration = 600,
  } = options;

  let element: HTMLElement | undefined;
  let isInitialized = false;

  onMount(() => {
    if (!element || isInitialized) return;
    isInitialized = true;

    // Set initial state
    element.classList.add('scroll-reveal-hidden');
    element.style.setProperty('--reveal-duration', `${duration}ms`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Item is in viewport - reveal it
            entry.target.classList.remove('scroll-reveal-hidden');
            entry.target.classList.add('reveal-visible');
            // Stop observing after reveal - don't re-animate
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  });

  return (el: HTMLElement) => {
    element = el;
  };
};
