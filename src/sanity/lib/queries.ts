import { groq } from "next-sanity";

export const raffleAboutQuery = groq`
  *[_id == "raffleAbout"][0] {
    fundraisingDetails,
    contactIntroduction,
    contactEmail,
    entryInstructions,
    drawIntroduction,
    instagramHandle,
    instagramUrl,
    drawConclusion,
    closingMessage
  }
`;

// Query for fetching active raffle items
export const raffleItemsQuery = groq`
  *[_type == "raffleItem" && isActive == true] | order(orderRank asc) {
    _id,
    title,
    description,
    instructor,
    details,
    value,
    validity,
    location,
    contact,
    "image": image.asset->url,
    slug,
    order
  }
`

// Query for fetching all raffle items (including inactive)
export const allRaffleItemsQuery = groq`
  *[_type == "raffleItem"] | order(orderRank asc) {
    _id,
    title,
    description,
    instructor,
    details,
    value,
    validity,
    location,
    contact,
    "image": image.asset->url,
    slug,
    order,
    isActive
  }
`;

// Query for fetching a single raffle item by ID
export const raffleItemByIdQuery = groq`
  *[_type == "raffleItem" && _id == $id][0] {
    _id,
    title,
    description,
    instructor,
    details,
    value,
    validity,
    location,
    contact,
    "image": image.asset->url,
    slug,
    order,
    isActive
  }
`

// Query for fetching a single raffle item by slug
export const raffleItemBySlugQuery = groq`
  *[_type == "raffleItem" && slug.current == $slug][0] {
    _id,
    title,
    description,
    instructor,
    details,
    value,
    validity,
    location,
    contact,
    "image": image.asset->url,
    slug,
    order,
    isActive
  }
`;
