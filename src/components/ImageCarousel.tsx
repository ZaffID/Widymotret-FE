import { Component, createSignal, createEffect, createMemo, onCleanup, For } from 'solid-js';

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
  const [isAnimating, setIsAnimating] = createSignal(false);

  const interval = props.autoPlayInterval || 5000;
  const images = createMemo(() => props.images || []);

  // Helper function to change image with debounce
  const changeImage = (newIndex: number) => {
    if (images().length === 0) return;
    if (isAnimating()) return;
    setIsAnimating(true);
    setCurrentIndex(newIndex);
    props.onImageChange?.(newIndex);
    setTimeout(() => setIsAnimating(false), 700); // Match transition duration
  };

  // Auto-play effect
  createEffect(() => {
    if (!isAutoPlay()) return;
    if (images().length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images().length);
      props.onImageChange?.((currentIndex() + 1) % images().length);
    }, interval);

    onCleanup(() => clearInterval(timer));
  });

  // Go to specific image
  const goToImage = (index: number) => {
    if (isAnimating()) return;
    changeImage(index);
    setIsAutoPlay(true);
  };

  // Next/Prev with keyboard
  createEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (images().length === 0) return;
      if (isAnimating()) return;
      if (e.key === 'ArrowRight') {
        changeImage((currentIndex() + 1) % images().length);
        setIsAutoPlay(true);
      } else if (e.key === 'ArrowLeft') {
        changeImage((currentIndex() - 1 + images().length) % images().length);
        setIsAutoPlay(true);
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
    if (images().length === 0) return;

    const offset = dragOffset();
    const threshold = 50; // minimum drag distance

    if (Math.abs(offset) > threshold && !isAnimating()) {
      if (offset > 0) {
        // Dragged right - show previous image
        changeImage((currentIndex() - 1 + images().length) % images().length);
      } else {
        // Dragged left - show next image
        changeImage((currentIndex() + 1) % images().length);
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
    if (images().length === 0) return;

    const offset = dragOffset();
    const threshold = 50;

    if (Math.abs(offset) > threshold && !isAnimating()) {
      if (offset > 0) {
        changeImage((currentIndex() - 1 + images().length) % images().length);
      } else {
        changeImage((currentIndex() + 1) % images().length);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    setIsAutoPlay(true);
  };

  // Keep index valid when image list changes after async content load
  createEffect(() => {
    const length = images().length;
    if (length === 0) {
      setCurrentIndex(0);
      return;
    }

    if (currentIndex() >= length) {
      setCurrentIndex(0);
    }
  });

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
        <For each={images()}>
          {(image, index) => (
          <div
            class="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{
              opacity: currentIndex() === index() ? 1 : 0,
              'pointer-events': currentIndex() === index() ? 'auto' : 'none',
            }}
          >
            <img
              src={image}
              alt={`Carousel image ${index() + 1}`}
              class="w-full h-full object-cover"
              draggable={false}
            />
          </div>
          )}
        </For>
      </div>

      {/* Dark overlay */}
      <div class="absolute inset-0 bg-black/10 pointer-events-none"></div>

      {/* Navigation dots - bottom center */}
      <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        <For each={images()}>
          {(_, index) => (
          <button
            onClick={() => goToImage(index())}
            class={`transition-all duration-300 rounded-full ${
              currentIndex() === index()
                ? 'bg-white w-3 h-3'
                : 'bg-white/50 w-2 h-2 hover:bg-white/75'
            }`}
            aria-label={`Go to image ${index() + 1}`}
          />
          )}
        </For>
      </div>

    </div>
  );
};

export default ImageCarousel;
