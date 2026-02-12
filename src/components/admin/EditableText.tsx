import { createSignal, Show } from 'solid-js';
import { BiRegularPencil } from 'solid-icons/bi';
import { updateContent } from '../../services/contentApi';
import './EditableText.css';

interface EditableTextProps {
  label: string;
  value: string;
  section: string;
  field: string;
  multiline?: boolean;
  onSave?: (newValue: string) => void;
  onError?: (error: string) => void;
}

export const EditableText = (props: EditableTextProps) => {
  const [isEditing, setIsEditing] = createSignal(false);
  const [currentValue, setCurrentValue] = createSignal(props.value);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleEdit = () => {
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setCurrentValue(props.value);
    setError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const newValue = currentValue();

    if (!newValue.trim()) {
      setError('Konten tidak boleh kosong');
      return;
    }

    if (newValue === props.value) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await updateContent(props.section, props.field, newValue);

      if (response.success && response.data) {
        setIsEditing(false);
        props.onSave?.(newValue);
      } else {
        setError(response.message || 'Gagal menyimpan konten');
        props.onError?.(response.message || 'Gagal menyimpan konten');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(errorMsg);
      props.onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="editable-text-wrapper">
      <label class="editable-text-label">{props.label}</label>

      <Show
        when={!isEditing()}
        fallback={
          <div class="editable-text-edit-mode">
            {props.multiline ? (
              <textarea
                class="editable-text-textarea"
                value={currentValue()}
                onInput={(e) => setCurrentValue(e.currentTarget.value)}
                placeholder="Masukkan teks..."
                disabled={isLoading()}
              />
            ) : (
              <input
                type="text"
                class="editable-text-input"
                value={currentValue()}
                onInput={(e) => setCurrentValue(e.currentTarget.value)}
                placeholder="Masukkan teks..."
                disabled={isLoading()}
              />
            )}

            <Show when={error()}>
              <div class="editable-text-error">{error()}</div>
            </Show>

            <div class="editable-text-actions">
              <button
                class="editable-text-btn btn-save"
                onClick={handleSave}
                disabled={isLoading()}
              >
                {isLoading() ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                class="editable-text-btn btn-cancel"
                onClick={handleCancel}
                disabled={isLoading()}
              >
                Batal
              </button>
            </div>
          </div>
        }
      >
        <div class="editable-text-display-mode">
          <div class="editable-text-content">
            {props.multiline ? (
              <p class="editable-text-multiline">{props.value}</p>
            ) : (
              <p class="editable-text-single-line">{props.value}</p>
            )}
          </div>
          <button
            class="editable-text-edit-btn"
            onClick={handleEdit}
            title="Edit"
          >
            <BiRegularPencil />
          </button>
        </div>
      </Show>
    </div>
  );
};
