import { Component, createSignal, createEffect, onCleanup } from 'solid-js';

interface ImageCarouselProps {
  images: string[];
  autoPlayInterval?: number;
  onImageChange?: (index: number) => void;
}

const ImageCarousel: Component<ImageCarouselProps> = (props) => {
  const [currentIndex, setCurrentIndex] = createSignal(0);
  const [isAutoPlay, setIsAutoPlay] = createSignal(true);
  const [isDragging, setIsDragging] = createSignal(false);
  const [dragStart, setDragStart] = createSignal(0);
  const [dragOffset, setDragOffset] = createSignal(0);

  const interval = props.autoPlayInterval || 5000;
  const images = props.images;

  // Auto-play effect
  createEffect(() => {
    if (!isAutoPlay()) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      props.onImageChange?.((currentIndex() + 1) % images.length);
    }, interval);

    onCleanup(() => clearInterval(timer));
  });

  // Go to specific image
  const goToImage = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(true);
    props.onImageChange?.(index);
  };

  // Next/Prev with keyboard
  createEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsAutoPlay(true);
        props.onImageChange?.((currentIndex() + 1) % images.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setIsAutoPlay(true);
        props.onImageChange?.((currentIndex() - 1 + images.length) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    onCleanup(() => window.removeEventListener('keydown', handleKeyDown));
  });

  // Mouse drag handling
  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    setIsAutoPlay(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return;
    setDragOffset(e.clientX - dragStart());
  };

  const handleMouseUp = () => {
    if (!isDragging()) return;

    const offset = dragOffset();
    const threshold = 50; // minimum drag distance

    if (Math.abs(offset) > threshold) {
      if (offset > 0) {
        // Dragged right - show previous image
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        props.onImageChange?.((currentIndex() - 1 + images.length) % images.length);
      } else {
        // Dragged left - show next image
        setCurrentIndex((prev) => (prev + 1) % images.length);
        props.onImageChange?.((currentIndex() + 1) % images.length);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    setIsAutoPlay(true);
  };

  // Touch support for mobile
  const handleTouchStart = (e: TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    setIsAutoPlay(false);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging()) return;
    setDragOffset(e.touches[0].clientX - dragStart());
  };

  const handleTouchEnd = () => {
    if (!isDragging()) return;

    const offset = dragOffset();
    const threshold = 50;

    if (Math.abs(offset) > threshold) {
      if (offset > 0) {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        props.onImageChange?.((currentIndex() - 1 + images.length) % images.length);
      } else {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        props.onImageChange?.((currentIndex() + 1) % images.length);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    setIsAutoPlay(true);
  };

  return (
    <div
      class="relative w-full h-full overflow-hidden bg-gray-900 select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        cursor: isDragging() ? 'grabbing' : 'grab',
      }}
    >
      {/* Images */}
      <div class="relative w-full h-full">
        {images.map((image, index) => (
          <div
            class="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{
              opacity: currentIndex() === index ? 1 : 0,
              'pointer-events': currentIndex() === index ? 'auto' : 'none',
            }}
          >
            <img
              src={image}
              alt={`Carousel image ${index + 1}`}
              class="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Dark overlay */}
      <div class="absolute inset-0 bg-black/10 pointer-events-none"></div>

      {/* Navigation dots - bottom center */}
      <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            onClick={() => goToImage(index)}
            class={`transition-all duration-300 rounded-full ${
              currentIndex() === index
                ? 'bg-white w-3 h-3'
                : 'bg-white/50 w-2 h-2 hover:bg-white/75'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
};

export default ImageCarousel;
