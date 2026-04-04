import { Component, onMount } from 'solid-js';

interface ScrollRevealImageProps {
  src: string;
  alt: string;
  title: string;
  onClick: () => void;
  threshold?: number;
  duration?: number;
}

/**
 * Single portfolio image with individual scroll reveal animation
 * Each image animates in as it enters the viewport
 */
export const ScrollRevealImage: Component<ScrollRevealImageProps> = (props) => {
  let imageContainer: HTMLDivElement | undefined;

  onMount(() => {
    if (!imageContainer) return;

    const threshold = props.threshold ?? 0.15;
    const duration = props.duration ?? 550;

    // Set initial state
    imageContainer.classList.add('scroll-reveal-hidden');
    imageContainer.style.setProperty('--reveal-duration', `${duration}ms`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Element is in viewport - reveal it with animation
            entry.target.classList.remove('scroll-reveal-hidden');
            entry.target.classList.add('reveal-visible');
            // Stop observing to prevent re-animation
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(imageContainer);

    return () => {
      observer.disconnect();
    };
  });

  return (
    <div 
      ref={imageContainer}
      class="group relative overflow-hidden rounded-lg cursor-pointer bg-gray-100 scroll-reveal-item w-full"
      onClick={props.onClick}
    >
      {/* Image - with natural aspect ratio, full width */}
      <img
        src={props.src}
        alt={props.alt}
        loading="lazy"
        class="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Overlay */}
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
        <div>
          <h3 class="text-white font-medium text-base line-clamp-2">
            {props.title}
          </h3>
        </div>
      </div>

      {/* Zoom Icon */}
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <svg class="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 13H7" />
        </svg>
      </div>
    </div>
  );
};
