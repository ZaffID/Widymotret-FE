import { createSignal, createEffect, Show, createMemo } from 'solid-js';
import { BiRegularPencil } from 'solid-icons/bi';
import { FaSolidTrashAlt } from 'solid-icons/fa';
import { FiImage } from 'solid-icons/fi';
import { updateContent, uploadImage } from '../../services/contentApi';
import { resolveMediaUrl } from '../../utils/mediaUrl';

interface EditableImageProps {
  label: string;
  value: string;
  section: string;
  field: string;
  /** Aspect ratio class (default: aspect-video) */
  aspectClass?: string;
  onSave?: (newValue: string) => void | Promise<void>;
  onError?: (error: string) => void;
  onDelete?: () => void;
  onUpload?: (file: File) => Promise<string | { success?: boolean; message?: string; data?: { url?: string } }>;
}

export const EditableImage = (props: EditableImageProps) => {
  const [isEditing, setIsEditing] = createSignal(false);
  const [currentValue, setCurrentValue] = createSignal(props.value);
  const [lastPropValue, setLastPropValue] = createSignal(props.value || '');
  const [imgError, setImgError] = createSignal(false);
  const [isUploading, setIsUploading] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);
  // Generate file input ID once - stable ID for file input reference
  const fileInputId = `file-input-${props.section}-${props.field}-${Math.random().toString(36).substr(2, 9)}`;
  const previewSrc = createMemo(() => {
    const resolved = resolveMediaUrl(currentValue());
    console.log(`[DEBUG EditableImage previewSrc] currentValue="${currentValue()}" => resolved="${resolved}"`);
    return resolved;
  });

  // Keep local preview in sync with store updates from parent after save/load.
  createEffect(() => {
    const nextValue = props.value || '';
    if (nextValue !== lastPropValue()) {
      setCurrentValue(nextValue);
      setLastPropValue(nextValue);
      setImgError(false);
    }
  });

  const persistValue = async (rawValue: string, closeEditor = true) => {
    const newValue = rawValue.trim();
    if (!newValue) {
      props.onError?.('URL tidak boleh kosong');
      return false;
    }
    
    console.log(`[DEBUG EditableImage] persistValue START: section=${props.section}, field=${props.field}, value="${newValue}", closeEditor=${closeEditor}`);
    
    setIsSaving(true);
    try {
      // Save to backend via API
      const response = await updateContent(props.section, props.field, newValue);
      console.log(`[DEBUG EditableImage] updateContent response:`, response);
      
      if (response.success) {
        console.log(`[DEBUG EditableImage] persistValue SUCCESS - will closeEditor=${closeEditor}`);
        if (closeEditor) {
          setIsEditing(false);
        }
        setLastPropValue(newValue);
        setImgError(false);
        
        // Await the onSave callback in case it's async
        try {
          await Promise.resolve(props.onSave?.(newValue));
          console.log(`[DEBUG EditableImage] onSave callback completed`);
        } catch (cbError) {
          console.error(`[DEBUG EditableImage] onSave callback error:`, cbError);
          throw cbError;
        }
        return true;
      } else {
        const errorMsg = response.message || 'Gagal menyimpan gambar';
        console.log(`[DEBUG EditableImage] persistValue FAILED: ${errorMsg}`);
        props.onError?.(errorMsg);
        return false;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan';
      console.log(`[DEBUG EditableImage] persistValue EXCEPTION: ${errorMsg}`, err);
      props.onError?.(errorMsg);
      return false;
    } finally {
      setIsSaving(false);
      console.log(`[DEBUG EditableImage] persistValue END`);
    }
  };

  const handleSave = async () => {
    await persistValue(currentValue(), true);
  };

  const handleCancel = () => {
    setCurrentValue(props.value);
    setIsEditing(false);
  };

  const handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    console.log(`[DEBUG EditableImage] File selected: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      props.onError?.('❌ File harus berupa gambar (JPG, PNG, WebP, dll)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      props.onError?.(`❌ File terlalu besar: ${sizeMB}MB (maksimal 5MB)`);
      return;
    }

    setIsUploading(true);
    try {
      // Always upload to server first
      const uploadFn = props.onUpload || uploadImage;
      const response = await uploadFn(file);

      console.log(`[DEBUG EditableImage] RAW Upload response:`, response);
      console.log(`[DEBUG EditableImage] Response type:`, typeof response);
      console.log(`[DEBUG EditableImage] Response keys:`, typeof response === 'object' ? Object.keys(response || {}) : 'N/A');
      if (typeof response === 'object' && response !== null) {
        console.log(`[DEBUG EditableImage] Response.data:`, (response as any).data);
        console.log(`[DEBUG EditableImage] Response.url:`, (response as any).url);
        console.log(`[DEBUG EditableImage] Response.message:`, (response as any).message);
        console.log(`[DEBUG EditableImage] Response.success:`, (response as any).success);
      }

      // Extract URL from various response formats
      let uploadedUrl = '';
      if (typeof response === 'string') {
        uploadedUrl = response;
        console.log(`[DEBUG EditableImage] Using string response as URL: "${uploadedUrl}"`);
      } else if (response && typeof response === 'object') {
        // Try multiple possible response formats
        uploadedUrl = response?.data?.url 
          || response?.url 
          || (response as any)?.['data/url']
          || '';
        console.log(`[DEBUG EditableImage] Tried data?.url: "${response?.data?.url}"`);
        console.log(`[DEBUG EditableImage] Tried url: "${response?.url}"`);
        console.log(`[DEBUG EditableImage] Final extracted URL: "${uploadedUrl}"`);
      }

      console.log(`[DEBUG EditableImage] Final extracted URL after processing: "${uploadedUrl}"`);

      if (uploadedUrl && uploadedUrl.trim()) {
        console.log(`[DEBUG EditableImage] ✅ Valid URL found, setting currentValue to: ${uploadedUrl}`);
        
        // Test if file is accessible
        const resolvedUrl = resolveMediaUrl(uploadedUrl);
        console.log(`[DEBUG EditableImage] Testing accessibility of: ${resolvedUrl}`);
        try {
          const headResponse = await fetch(resolvedUrl, { method: 'HEAD' });
          if (!headResponse.ok) {
            console.error(`[DEBUG EditableImage] ❌ File not accessible: ${headResponse.status} ${headResponse.statusText}`);
            props.onError?.(`⚠️ File uploaded but not accessible: ${headResponse.status}. Check backend logs.`);
            setIsUploading(false);
            return;
          }
          console.log(`[DEBUG EditableImage] ✅ File is accessible: ${resolvedUrl}`);
        } catch (fetchErr) {
          console.error(`[DEBUG EditableImage] ⚠️ Could not verify file access:`, fetchErr);
          // Continue anyway - CORS or local testing might fail
        }
        
        setCurrentValue(uploadedUrl);
        setImgError(false);

        // Auto-save uploaded file path - close editor after successful save
        await persistValue(uploadedUrl, true);
      } else {
        const errorMsg = response?.message || 'Upload berhasil tapi URL tidak ditemukan';
        console.log(`[DEBUG EditableImage] ❌ Upload failed - missing URL: ${errorMsg}`);
        console.log(`[DEBUG EditableImage] Full response was:`, response);
        props.onError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal upload gambar';
      console.log(`[DEBUG EditableImage] ❌ Upload exception: ${errorMsg}`, err);
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
            when={currentValue() && !imgError()}
            fallback={
              <div class="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500 text-sm bg-gradient-to-br from-gray-50 to-gray-100">
                <FiImage size={28} class="text-gray-400" />
                <span class="font-medium">no image</span>
                <Show when={currentValue() && imgError()}>
                  <span class="text-xs text-red-500">({currentValue()?.length > 30 ? '...' + currentValue()?.slice(-30) : currentValue()})</span>
                </Show>
              </div>
            }
          >
            <img
              src={previewSrc()}
              alt={props.label}
              class="w-full h-full object-cover"
              onError={() => {
                const failedUrl = previewSrc();
                console.error(`[DEBUG EditableImage] ❌ Image failed to load`);
                console.error(`[DEBUG EditableImage] Failed URL: ${failedUrl}`);
                console.error(`[DEBUG EditableImage] Original value: ${currentValue()}`);
                console.error(`[DEBUG EditableImage] Field: ${props.field}`);
                setImgError(true);
              }}
              onLoad={() => {
                console.log(`[DEBUG EditableImage] ✅ Image loaded successfully: ${previewSrc()}`);
                setImgError(false);
              }}
            />
          </Show>

          {/* Overlay edit button */}
          <Show when={!isEditing()}>
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
              <button
                onClick={() => {
                  console.log(`[DEBUG EditableImage] Opening editor for field: ${props.field}`);
                  setIsEditing(true);
                }}
                class="px-3 py-2 bg-white rounded-lg shadow text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <BiRegularPencil />
                Edit
              </button>
              {props.onDelete && (
                <button
                  onClick={props.onDelete}
                  class="px-3 py-2 bg-red-500 text-white rounded-lg shadow text-sm font-medium hover:bg-red-600 flex items-center gap-2"
                >
                  <FaSolidTrashAlt size={14} />
                  Hapus
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
                class="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:border-[#576250] hover:text-[#576250] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading() ? (
                  <>
                    <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
                    </svg>
                    <span>Upload dari file</span>
                  </>
                )}
              </button>
            </div>

            {/* Actions */}
            <div class="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isUploading() || isSaving()}
                class="px-4 py-1.5 bg-[#576250] text-white rounded-md text-sm font-medium hover:bg-[#464C43] transition disabled:opacity-50"
              >
                {isSaving() ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isUploading() || isSaving()}
                class="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </div>
        </Show>

        {/* URL display */}
        <Show when={!isEditing()}>
          <p class="mt-1 text-xs text-gray-400 truncate">{currentValue() || 'Belum ada gambar'}</p>
        </Show>
      </div>
    </div>
  );
};
