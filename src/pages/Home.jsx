// src/pages/Home.jsx

import { useEffect } from 'react';
import { useAuthStore } from '@stores/useAuthStore';

export default function Home() {
  const { user, initialize } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <h1 className="text-3xl font-bold text-foreground">
        Welcome{user ? `, ${user.username}` : ''}! 👋
      </h1>
      <p className="text-lg text-muted-foreground">
        Screenshot Manager Dashboard
      </p>
      <p className="text-sm text-muted-foreground/70">
        (Screenshots UI coming soon...)
      </p>
    </main>
  );
}
