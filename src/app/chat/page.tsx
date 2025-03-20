'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';

export default function ChatPage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { initialize } = useStore();

  useEffect(() => {
    const initStore = async () => {
      try {
        await initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Store initialization error:', error);
        // Continue with the app even if store initialization fails
        setIsInitialized(true);
      }
    };

    initStore();
  }, [initialize]);

  return (
    <main className="flex min-h-screen flex-col">
      {/* Your existing chat UI components */}
      <div className="flex-1">
        {/* Chat content */}
      </div>
    </main>
  );
} 