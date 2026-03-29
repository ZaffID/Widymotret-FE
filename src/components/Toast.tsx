import { Component, Show } from 'solid-js';

interface ToastProps {
  message: string | null | undefined;
  type?: 'success' | 'error' | 'warning' | 'info';
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
        return '✕';
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
        class={`fixed top-6 right-6 max-w-sm px-6 py-4 rounded-lg shadow-lg text-white flex items-start gap-3 z-50 animate-slideInRight backdrop-blur-sm`}
        style={{
          'background-color': getComputedStyle(document.documentElement)
            .getPropertyValue(`--color-${props.type}`)
            .trim() || undefined,
        }}
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
      </div>
    </Show>
  );
};

export default Toast;
