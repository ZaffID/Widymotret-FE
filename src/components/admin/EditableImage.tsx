import { createSignal, Show } from 'solid-js';
import { BiRegularPencil } from 'solid-icons/bi';

interface EditableImageProps {
  label: string;
  value: string;
  section: string;
  field: string;
  /** Aspect ratio class (default: aspect-video) */
  aspectClass?: string;
  onSave?: (newValue: string) => void;
  onError?: (error: string) => void;
  onDelete?: () => void;
  onUpload?: (file: File) => Promise<string>; // Return URL after upload
}

export const EditableImage = (props: EditableImageProps) => {
  const [isEditing, setIsEditing] = createSignal(false);
  const [currentValue, setCurrentValue] = createSignal(props.value);
  const [imgError, setImgError] = createSignal(false);
  const [isUploading, setIsUploading] = createSignal(false);
  const fileInputId = `file-input-${Math.random().toString(36).substr(2, 9)}`;

  const handleSave = () => {
    const newValue = currentValue().trim();
    if (!newValue) {
      props.onError?.('URL tidak boleh kosong');
      return;
    }
    setIsEditing(false);
    setImgError(false);
    props.onSave?.(newValue);
  };

  const handleCancel = () => {
    setCurrentValue(props.value);
    setIsEditing(false);
  };

  const handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      props.onError?.('Hanya file gambar yang diperbolehkan');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      props.onError?.('Ukuran file maksimal 5MB');
      return;
    }

    setIsUploading(true);
    try {
      if (props.onUpload) {
        // If callback provided, use it to upload
        const url = await props.onUpload(file);
        setCurrentValue(url);
        setImgError(false);
      } else {
        // Default: convert to data URL for FE-only usage
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          setCurrentValue(url);
          setImgError(false);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal upload gambar';
      props.onError?.(errorMsg);
    } finally {
      setIsUploading(false);
      input.value = '';
    }
  };

  return (
    <div class="mb-4">
      <label class="text-sm font-semibold text-gray-700 block mb-2">{props.label}</label>

      <div class="relative group">
        {/* Image Preview */}
        <div class={`${props.aspectClass || 'aspect-video'} bg-gray-100 rounded-lg overflow-hidden border border-gray-200`}>
          <Show
            when={props.value && !imgError()}
            fallback={
              <div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                <span>No image</span>
              </div>
            }
          >
            <img
              src={props.value}
              alt={props.label}
              class="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </Show>

          {/* Overlay edit button */}
          <Show when={!isEditing()}>
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
              <button
                onClick={() => setIsEditing(true)}
                class="px-3 py-2 bg-white rounded-lg shadow text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <BiRegularPencil />
                Edit
              </button>
              {props.onDelete && (
                <button
                  onClick={props.onDelete}
                  class="px-3 py-2 bg-red-500 text-white rounded-lg shadow text-sm font-medium hover:bg-red-600"
                >
                  🗑️
                </button>
              )}
            </div>
          </Show>
        </div>

        {/* Edit Mode */}
        <Show when={isEditing()}>
          <div class="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
            {/* URL Input */}
            <div>
              <label class="text-xs font-medium text-gray-600 block mb-1">Masukkan URL atau upload file</label>
              <input
                type="text"
                value={currentValue()}
                onInput={(e) => setCurrentValue(e.currentTarget.value)}
                placeholder="https://... atau file path"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#576250] focus:border-transparent"
              />
            </div>

            {/* File Upload */}
            <div>
              <input
                type="file"
                id={fileInputId}
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading()}
                class="hidden"
              />
              <button
                onClick={() => document.getElementById(fileInputId)?.click()}
                disabled={isUploading()}
                class="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:border-[#576250] hover:text-[#576250] transition disabled:opacity-50"
              >
                {isUploading() ? '⏳ Uploading...' : '📁 Upload dari file'}
              </button>
            </div>

            {/* Actions */}
            <div class="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isUploading()}
                class="px-4 py-1.5 bg-[#576250] text-white rounded-md text-sm font-medium hover:bg-[#464C43] transition disabled:opacity-50"
              >
                Simpan
              </button>
              <button
                onClick={handleCancel}
                disabled={isUploading()}
                class="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </div>
        </Show>

        {/* URL display */}
        <Show when={!isEditing()}>
          <p class="mt-1 text-xs text-gray-400 truncate">{props.value || 'Belum ada gambar'}</p>
        </Show>
      </div>
    </div>
  );
};
