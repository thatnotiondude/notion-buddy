import { create } from 'zustand';

interface StoreState {
  isInitialized: boolean;
  initializeStore: () => Promise<void>;
}

export const useStore = create<StoreState>((set) => ({
  isInitialized: false,
  initializeStore: async () => {
    try {
      // Add your store initialization logic here
      // For example, loading saved chats, user preferences, etc.
      
      // Set initialized state even if there are errors
      set({ isInitialized: true });
    } catch (error) {
      console.error('Store initialization error:', error);
      // Set initialized state even on error to prevent infinite loading
      set({ isInitialized: true });
    }
  },
})); 