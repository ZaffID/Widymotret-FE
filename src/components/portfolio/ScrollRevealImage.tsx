import { Component } from 'solid-js';
import { FaSolidMagnifyingGlass } from 'solid-icons/fa';

interface ScrollRevealImageProps {
  src: string;
  alt: string;
  title: string;
  onClick: () => void;
  threshold?: number;
  duration?: number;
}

/**
 * Single portfolio image card without reveal animation.
 */
export const ScrollRevealImage: Component<ScrollRevealImageProps> = (props) => {
  return (
    <div 
      class="group relative overflow-hidden rounded-lg cursor-pointer bg-gray-100 w-full"
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
        <FaSolidMagnifyingGlass class="w-10 h-10 text-white drop-shadow-lg" />
      </div>
    </div>
  );
};
