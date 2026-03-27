import { Component, Show } from 'solid-js';
import { AiFillCamera } from 'solid-icons/ai';
import { RiFinanceDiamondRingFill } from 'solid-icons/ri';

interface ContactModalProps {
  isOpen: () => boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

const ContactModal: Component<ContactModalProps> = (props) => {
  const WA_STUDIO = 'https://wa.me/62895351115777';
  const WA_WEDDING = 'https://wa.me/62895632522949';

  return (
    <Show when={props.isOpen()}>
      <div 
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
        onClick={() => props.onClose()}
      >
        <div 
          class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeInScale"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <div class="flex justify-end mb-4">
            <button 
              onClick={props.onClose}
              class="text-gray-400 hover:text-gray-600 transition"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-[#464C43] mb-2">
              {props.title || 'Pilih Layanan Kami'}
            </h3>
            <p class="text-gray-600 text-sm">
              {props.subtitle || 'Hubungi tim yang sesuai dengan kebutuhan Anda'}
            </p>
          </div>

          {/* Options */}
          <div class="space-y-3">
            {/* Studio Button */}
            <a
              href={WA_STUDIO}
              target="_blank"
              rel="noopener noreferrer"
              class="w-full py-3 px-6 bg-[#464C43] hover:bg-[#576250] text-white rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-3"
            >
              <AiFillCamera size={20} />
              <div class="text-left">
                <p class="font-semibold">Studio & General</p>
                <p class="text-xs opacity-90">62895351115777</p>
              </div>
            </a>

            {/* Wedding Button */}
            <a
              href={WA_WEDDING}
              target="_blank"
              rel="noopener noreferrer"
              class="w-full py-3 px-6 mb-4 bg-[#FAFAFA] hover:bg-gray-100 border-2 border-[#576250] text-[#464C43] rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-3"
            >
              <RiFinanceDiamondRingFill size={20} />
              <div class="text-left">
                <p class="font-semibold">Wedding & PreWed</p>
                <p class="text-xs opacity-90">62895632522949</p>
              </div>
            </a>
          </div>

          {/* Divider */}
          <div class="my-6 border-b border-gray-200"></div>

          {/* Close Text Button */}
          <button
            onClick={props.onClose}
            class="w-full py-2 text-gray-600 hover:text-gray-800 font-medium transition text-sm"
          >
            Tutup
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.3s ease-out;
        }
      `}</style>
    </Show>
  );
};

export default ContactModal;
