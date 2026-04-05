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
    const value = state().content.get(key)?.value || '';
    
    // If empty and is service image field, check localStorage as fallback
    if (!value && section === 'service' && field.endsWith('_image')) {
      const fallbackKey = `service_${field.replace('_image', '')}_image`;
      const cachedValue = localStorage.getItem(fallbackKey);
      if (cachedValue) {
        console.log(`[contentStore.getField] Fallback to localStorage: ${fallbackKey} => "${cachedValue}"`);
        return cachedValue;
      }
    }
    
    return value;
  };

  // Get all fields for a section from store
  const getSectionFields = (section: string): Array<{field: string; value: string}> => {
    const prefix = `${section}.`;
    const fields: Array<{field: string; value: string}> = [];
    
    state().content.forEach((item, key) => {
      if (key.startsWith(prefix)) {
        const fieldName = key.slice(prefix.length);
        fields.push({
          field: fieldName,
          value: item.value || '',
        });
      }
    });
    
    return fields.sort((a, b) => a.field.localeCompare(b.field));
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

        // Restore service images from localStorage fallback
        const serviceImageKeys = Array.from(localStorage.keys()).filter(k => k.startsWith('service_') && k.endsWith('_image'));
        console.log(`[contentStore.loadAll] Found ${serviceImageKeys.length} service images in localStorage`);
        
        serviceImageKeys.forEach(fallbackKey => {
          const value = localStorage.getItem(fallbackKey);
          if (value) {
            const field = `${fallbackKey.slice(8)}`; // Remove 'service_' prefix
            const key = `service.${field}`;
            
            // Only restore if not already in backend data
            if (!newMap.has(key)) {
              console.log(`[contentStore.loadAll] Restoring from localStorage: ${key} => "${value.substring(0, 30)}..."`);
              newMap.set(key, {
                id: key,
                section: 'service',
                field,
                value,
                updated_at: new Date().toISOString(),
              });
            }
          }
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
    
    // Also save to localStorage as fallback for service images
    if (section === 'service' && field.endsWith('_image') && value) {
      const fallbackKey = `service_${field.replace('_image', '')}_image`;
      localStorage.setItem(fallbackKey, value);
      console.log(`[contentStore.updateFieldLocal] Saved to localStorage: ${fallbackKey}`);
    }
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
    getSectionFields,
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
