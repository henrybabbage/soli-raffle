'use client';

import { useEffect } from 'react';
import { injectBotId } from 'botid';

export default function BotIdProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize BotID protection on the client side
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      injectBotId();
    }
  }, []);

  return <>{children}</>;
}
