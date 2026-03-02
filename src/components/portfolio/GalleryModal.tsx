import { Component, createSignal, Show } from 'solid-js';
import { BsChevronLeft, BsChevronRight, BsXLg } from 'solid-icons/bs';
import { PortfolioImage } from '../../data/portfolio';
import './GalleryModal.css';

interface GalleryModalProps {
  isOpen: boolean;
  images: PortfolioImage[];
  initialIndex: number;
  onClose: () => void;
}

export const GalleryModal: Component<GalleryModalProps> = (props) => {
  const [currentIndex, setCurrentIndex] = createSignal(props.initialIndex);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + props.images.length) % props.images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % props.images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (!props.isOpen) return;
    
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') props.onClose();
  };

  // Add keyboard event listeners when modal opens
  const addKeylistener = () => {
    if (props.isOpen) {
      window.addEventListener('keydown', handleKeydown);
    }
    return () => window.removeEventListener('keydown', handleKeydown);
  };

  return (
    <Show when={props.isOpen}>
      <div class="gallery-modal-overlay" onClick={props.onClose}>
        <div class="gallery-modal-container" onClick={(e) => e.stopPropagation()}>
          {/* Close Button */}
          <button
            class="gallery-modal-close"
            onClick={props.onClose}
            aria-label="Close gallery"
          >
            <BsXLg />
          </button>

          {/* Main Image */}
          <div class="gallery-modal-main">
            <img
              src={props.images[currentIndex()].url}
              alt={props.images[currentIndex()].title}
              class="gallery-modal-image"
            />
          </div>

          {/* Title */}
          <div class="gallery-modal-title">
            {props.images[currentIndex()].title}
          </div>

          {/* Navigation Arrows */}
          <button
            class="gallery-modal-nav gallery-modal-nav-prev"
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            <BsChevronLeft />
          </button>

          <button
            class="gallery-modal-nav gallery-modal-nav-next"
            onClick={goToNext}
            aria-label="Next image"
          >
            <BsChevronRight />
          </button>

          {/* Bottom Section - Counter and Thumbnails */}
          <div class="gallery-modal-bottom">
            {/* Counter */}
            <div class="gallery-modal-counter">
              {currentIndex() + 1} / {props.images.length}
            </div>

            {/* Thumbnail Strip */}
            <div class="gallery-modal-thumbnails">
              {props.images.map((image, index) => (
                <button
                  class="gallery-modal-thumbnail"
                  classList={{
                    active: index === currentIndex(),
                  }}
                  onClick={() => goToImage(index)}
                  aria-label={`Go to image ${index + 1}`}
                >
                  <img src={image.url} alt={`Thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};
