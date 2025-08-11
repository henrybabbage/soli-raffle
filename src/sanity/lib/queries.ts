import { groq } from 'next-sanity';

// Query for fetching active raffle items
export const raffleItemsQuery = groq`
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
`;

// Query for fetching all raffle items (including inactive)
export const allRaffleItemsQuery = groq`
  *[_type == "raffleItem"] | order(order asc) {
    _id,
    title,
    description,
    instructor,
    details,
    value,
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
    contact,
    "image": image.asset->url,
    slug,
    order,
    isActive
  }
`;

// Query for fetching a single raffle item by slug
export const raffleItemBySlugQuery = groq`
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
    order,
    isActive
  }
`;

// Query for fetching all purchases
export const purchasesQuery = groq`
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
      instructor,
      "image": image.asset->url
    }
  }
`;

// Query for fetching purchases by status
export const purchasesByStatusQuery = groq`
  *[_type == "purchase" && paymentStatus == $status] | order(purchaseDate desc) {
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
      instructor,
      "image": image.asset->url
    }
  }
`;

// Query for fetching purchases by buyer email
export const purchasesByEmailQuery = groq`
  *[_type == "purchase" && buyerEmail == $email] | order(purchaseDate desc) {
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
      instructor,
      "image": image.asset->url
    }
  }
`;

// Query for fetching purchases for a specific raffle item
export const purchasesByRaffleItemQuery = groq`
  *[_type == "purchase" && raffleItem._ref == $raffleItemId] | order(purchaseDate desc) {
    _id,
    buyerEmail,
    buyerName,
    quantity,
    totalAmount,
    paypalTransactionId,
    paymentStatus,
    purchaseDate,
    notes
  }
`;

// Query for fetching purchase statistics
export const purchaseStatsQuery = groq`
  {
    "totalPurchases": count(*[_type == "purchase"]),
    "pendingPurchases": count(*[_type == "purchase" && paymentStatus == "pending"]),
    "completedPurchases": count(*[_type == "purchase" && paymentStatus == "completed"]),
    "failedPurchases": count(*[_type == "purchase" && paymentStatus == "failed"]),
    "refundedPurchases": count(*[_type == "purchase" && paymentStatus == "refunded"]),
    "totalRevenue": math::sum(*[_type == "purchase" && paymentStatus == "completed"].totalAmount),
    "pendingRevenue": math::sum(*[_type == "purchase" && paymentStatus == "pending"].totalAmount),
    "totalTicketsSold": math::sum(*[_type == "purchase" && paymentStatus == "completed"].quantity),
    "recentPurchases": *[_type == "purchase"] | order(purchaseDate desc) [0...5] {
      _id,
      buyerName,
      buyerEmail,
      totalAmount,
      paymentStatus,
      purchaseDate
    }
  }
`;
