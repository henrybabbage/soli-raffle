'use client';

import { useEffect } from 'react';
import { initBotId } from 'botid/client/core';

export default function BotIdProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize BotID protection on the client side
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Initialize with basic protection for all routes
      initBotId({
        protect: [
          {
            path: '/api/*',
            method: '*',
            advancedOptions: {
              checkLevel: 'basic'
            }
          },
          {
            path: '/',
            method: 'GET',
            advancedOptions: {
              checkLevel: 'basic'
            }
          }
        ]
      });
    }
  }, []);

  return <>{children}</>;
}
