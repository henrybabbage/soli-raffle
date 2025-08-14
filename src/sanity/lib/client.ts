import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Create a conditional client that only initializes when not in build mode
const createConditionalClient = () => {
  // During build time, return a mock client
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    return {
      fetch: async () => [],
      create: async () => ({ _id: 'mock-id' }),
      patch: (id: string) => ({
        set: (data: Record<string, unknown>) => ({
          commit: async () => ({ _id: id, ...data })
        })
      }),
    } as unknown as ReturnType<typeof createClient>;
  }
  
  // Normal client for runtime
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
  });
};

export const client = createConditionalClient();
