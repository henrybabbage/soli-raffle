import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const config = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'aibflqfk',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
}

export const sanityClient = createClient(config)

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  return builder.image(source)
}

// GROQ queries
export const raffleItemsQuery = `
  *[_type == "raffleItem" && isActive == true] | order(order asc) {
    _id,
    title,
    description,
    instructor,
    details,
    value,
    contact,
    "image": image.asset->url,
    slug,
    order
  }
`

export const raffleItemBySlugQuery = `
  *[_type == "raffleItem" && slug.current == $slug][0] {
    _id,
    title,
    description,
    instructor,
    details,
    value,
    contact,
    "image": image.asset->url,
    slug,
    order
  }
`

export const purchasesQuery = `
  *[_type == "purchase"] | order(purchaseDate desc) {
    _id,
    buyerEmail,
    buyerName,
    quantity,
    totalAmount,
    paypalTransactionId,
    paymentStatus,
    purchaseDate,
    notes,
    "raffleItem": raffleItem->{
      _id,
      title,
      "image": image.asset->url
    }
  }
`