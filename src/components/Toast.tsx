import { Component, Show } from 'solid-js';

interface ToastProps {
  message: string | null | undefined;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
}

const Toast: Component<ToastProps> = (props) => {
  const bgColor = () => {
    switch (props.type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  const icon = () => {
    switch (props.type) {
      case 'success':
        return '✓';
      case 'error':
        return '⚠️';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <Show when={props.message}>
      <div
        class={`fixed top-20 right-4 md:right-6 max-w-sm px-6 py-4 rounded-lg shadow-lg text-white flex items-start gap-3 z-50 animate-slideInRight backdrop-blur-sm`}
        classList={{
          'bg-green-500': props.type === 'success',
          'bg-red-500': props.type === 'error',
          'bg-yellow-500': props.type === 'warning',
          'bg-blue-500': props.type === 'info' || !props.type,
        }}
      >
        <span class="flex-shrink-0 font-bold text-lg mt-0.5 w-6 text-center">
          {icon()}
        </span>
        <span class="flex-1 text-sm font-medium leading-relaxed">
          {props.message}
        </span>
        <button
          onClick={props.onClose}
          class="flex-shrink-0 ml-4 text-white hover:opacity-80 transition-opacity p-1 focus:outline-none"
          aria-label="Close notification"
          title="Tutup"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </Show>
  );
};

export default Toast;
