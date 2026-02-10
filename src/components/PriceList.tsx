import { Component, Show, createEffect, onCleanup } from 'solid-js';
import './PriceList.css';

interface PriceListProps {
  isOpen: () => boolean;
  onClose: () => void;
}

const PriceList: Component<PriceListProps> = (props) => {
  // Update body overflow when modal opens/closes
  createEffect(() => {
    if (props.isOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  });

  onCleanup(() => {
    document.body.style.overflow = 'auto';
  });

  return (
    <Show when={props.isOpen()}>
      <div 
        class="modal" 
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            props.onClose();
          }
        }}
      >
        <div class="modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Tombol Close (X) */}
          <span class="close-btn" onClick={props.onClose}>&times;</span>
          
          {/* Judul Popup */}
          <div class="price-header">
            <h2>Wedding Collections</h2>
            <p>Curated packages for your special day</p>
          </div>

          {/* Paket 1 */}
          <div class="package-item">
            <div class="pkg-top">
              <span class="pkg-title">Intimate Session</span>
              <span class="pkg-price">IDR 3.500k</span>
            </div>
            <p class="pkg-desc">Perfect for pre-wedding or engagement sessions.</p>
            <ul class="pkg-features">
              <li>3 Hours Coverage</li>
              <li>50 Edited Photos</li>
              <li>1 Minute Highlight Video</li>
              <li>Online Gallery</li>
            </ul>
          </div>

          {/* Paket 2 */}
          <div class="package-item">
            <div class="pkg-top">
              <span class="pkg-title">Holy Matrimony</span>
              <span class="pkg-price">IDR 8.000k</span>
            </div>
            <p class="pkg-desc">Focusing on the sacred moments of your vow.</p>
            <ul class="pkg-features">
              <li>5 Hours Coverage</li>
              <li>150 Edited Photos</li>
              <li>Same Day Edit Video</li>
              <li>1 Canvas Print (60x40)</li>
              <li>USB Flashdrive</li>
            </ul>
          </div>

          {/* Paket 3 */}
          <div class="package-item">
            <div class="pkg-top">
              <span class="pkg-title">The Grand Day</span>
              <span class="pkg-price">IDR 15.000k</span>
            </div>
            <p class="pkg-desc">Complete coverage from preparation to reception.</p>
            <ul class="pkg-features">
              <li>Full Day Coverage (12 Hours)</li>
              <li>2 Photographers + 2 Videographers</li>
              <li>All Files Returned</li>
              <li>Exclusive Wedding Album</li>
              <li>Drone Coverage</li>
            </ul>
          </div>

          {/* Tombol WA di Paling Bawah */}
          <a 
            href="https://wa.me/6281234567890?text=Halo,%20saya%20mau%20booking%20tanggal..." 
            target="_blank" 
            rel="noopener noreferrer"
            class="wa-btn"
          >
            Book a Date via WhatsApp
          </a>
        </div>
      </div>
    </Show>
  );
};

export default PriceList;
