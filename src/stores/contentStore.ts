import { createSignal, createRoot } from 'solid-js';
import { EditableContent } from '../types/content';
import { getContent, getSectionContent, getAllContent } from '../services/contentApi';

interface ContentState {
  content: Map<string, EditableContent>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const createContentStore = () => {
  const [state, setState] = createSignal<ContentState>({
    content: new Map(),
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  // Get content field from store
  const getField = (section: string, field: string): string => {
    const key = `${section}.${field}`;
    return state().content.get(key)?.value || '';
  };

  // Load single content field
  const loadField = async (section: string, field: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await getContent(section, field);

      if (response.success && response.data) {
        const key = `${section}.${field}`;
        setState(prev => {
          const newMap = new Map(prev.content);
          newMap.set(key, response.data!);
          return {
            ...prev,
            content: newMap,
            lastUpdated: new Date(),
            isLoading: false,
          };
        });
      } else {
        setState(prev => ({
          ...prev,
          error: response.message,
          isLoading: false,
        }));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat konten';
      setState(prev => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
    }
  };

  // Load all content for a section
  const loadSection = async (section: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await getSectionContent(section);

      if (response.success && response.data) {
        setState(prev => {
          const newMap = new Map(prev.content);
          response.data!.forEach(item => {
            const key = `${item.section}.${item.field}`;
            newMap.set(key, item);
          });
          return {
            ...prev,
            content: newMap,
            lastUpdated: new Date(),
            isLoading: false,
          };
        });
      } else {
        setState(prev => ({
          ...prev,
          error: response.message,
          isLoading: false,
        }));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat section';
      setState(prev => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
    }
  };

  // Load all content
  const loadAll = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await getAllContent();

      if (response.success && response.data) {
        const newMap = new Map<string, EditableContent>();
        response.data.forEach(item => {
          const key = `${item.section}.${item.field}`;
          newMap.set(key, item);
        });

        setState(prev => ({
          ...prev,
          content: newMap,
          lastUpdated: new Date(),
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.message,
          isLoading: false,
        }));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat semua konten';
      setState(prev => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
    }
  };

  // Update field in state after API call
  // This is typically called by EditableText component's onSave callback
  const updateFieldLocal = (section: string, field: string, value: string) => {
    const key = `${section}.${field}`;
    setState(prev => {
      const newMap = new Map(prev.content);
      const existing = newMap.get(key);

      if (existing) {
        newMap.set(key, {
          ...existing,
          value,
          updated_at: new Date().toISOString(),
        });
      } else {
        newMap.set(key, {
          id: `${section}-${field}-${Date.now()}`,
          section,
          field,
          value,
          updated_at: new Date().toISOString(),
        });
      }

      return {
        ...prev,
        content: newMap,
        lastUpdated: new Date(),
      };
    });
  };

  // Clear error
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Clear all data
  const clear = () => {
    setState({
      content: new Map(),
      isLoading: false,
      error: null,
      lastUpdated: null,
    });
  };

  return {
    // Signals
    state,
    // Derived signals for convenience
    get isLoading() {
      return state().isLoading;
    },
    get error() {
      return state().error;
    },
    get lastUpdated() {
      return state().lastUpdated;
    },
    // Methods
    getField,
    loadField,
    loadSection,
    loadAll,
    updateFieldLocal,
    clearError,
    clear,
  };
};

// Singleton store instance
export const contentStore = createRoot(createContentStore);
