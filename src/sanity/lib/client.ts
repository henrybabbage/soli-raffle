import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// Read-only client for fetching data
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
})

// Write client for mutations (create, update, delete)
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Always use fresh data for write operations
  token: process.env.SANITY_API_WRITE_TOKEN,
})
