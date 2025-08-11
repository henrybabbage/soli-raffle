# Sanity Queries Documentation

This document describes all the Sanity GROQ queries available in `queries.ts`.

## Location
All queries are centralized in: `/src/sanity/lib/queries.ts`

## Available Queries

### Raffle Items Queries

#### `raffleItemsQuery`
Fetches all active raffle items ordered by their display order.
- **Filters**: Only items where `isActive == true`
- **Returns**: Basic item information including title, description, instructor, details, value, contact, image URL, slug, and order
- **Used by**: Main raffle page, API route `/api/raffle-items`

#### `allRaffleItemsQuery`
Fetches all raffle items including inactive ones.
- **Filters**: None
- **Returns**: All item fields including `isActive` status
- **Use case**: Admin panels, content management

#### `raffleItemByIdQuery`
Fetches a single raffle item by its ID.
- **Parameters**: `$id` - The Sanity document ID
- **Returns**: Single item with all fields
- **Use case**: Item detail pages, editing interfaces

#### `raffleItemBySlugQuery`
Fetches a single raffle item by its slug.
- **Parameters**: `$slug` - The URL-friendly slug
- **Returns**: Single item with all fields
- **Use case**: SEO-friendly URLs, public item pages

### Purchase Queries

#### `purchasesQuery`
Fetches all purchases ordered by most recent first.
- **Filters**: None
- **Includes**: Related raffle item data (title, instructor, image)
- **Returns**: Complete purchase information
- **Used by**: Admin dashboard, API route `/api/purchases`

#### `purchasesByStatusQuery`
Fetches purchases filtered by payment status.
- **Parameters**: `$status` - One of: 'pending', 'completed', 'failed', 'refunded'
- **Returns**: Purchases matching the specified status
- **Use case**: Payment reconciliation, status-specific reports

#### `purchasesByEmailQuery`
Fetches all purchases made by a specific email address.
- **Parameters**: `$email` - Buyer's email address
- **Returns**: All purchases by that buyer
- **Use case**: Customer service, buyer history

#### `purchasesByRaffleItemQuery`
Fetches all purchases for a specific raffle item.
- **Parameters**: `$raffleItemId` - The raffle item's Sanity ID
- **Returns**: Purchases for that item
- **Use case**: Item-specific sales reports

#### `purchaseStatsQuery`
Aggregates purchase statistics across the entire dataset.
- **Returns**: Object containing:
  - `totalPurchases`: Total number of purchases
  - `pendingPurchases`: Count of pending payments
  - `completedPurchases`: Count of completed payments
  - `failedPurchases`: Count of failed payments
  - `refundedPurchases`: Count of refunded payments
  - `totalRevenue`: Sum of completed payment amounts
  - `pendingRevenue`: Sum of pending payment amounts
  - `totalTicketsSold`: Total quantity of tickets from completed purchases
  - `recentPurchases`: Last 5 purchases with basic info
- **Use case**: Dashboard statistics, revenue reports

## Usage Examples

### In API Routes

```typescript
import { client } from '@/sanity/lib/client'
import { raffleItemsQuery, purchasesQuery } from '@/sanity/lib/queries'

// Fetch all active raffle items
const raffleItems = await client.fetch(raffleItemsQuery)

// Fetch purchases with a specific status
const completedPurchases = await client.fetch(
  purchasesByStatusQuery, 
  { status: 'completed' }
)
```

### In React Components

```typescript
import { client } from '@/sanity/lib/client'
import { raffleItemBySlugQuery } from '@/sanity/lib/queries'

const fetchItemBySlug = async (slug: string) => {
  const item = await client.fetch(
    raffleItemBySlugQuery,
    { slug }
  )
  return item
}
```

### For Statistics

```typescript
import { client } from '@/sanity/lib/client'
import { purchaseStatsQuery } from '@/sanity/lib/queries'

const stats = await client.fetch(purchaseStatsQuery)
console.log(`Total revenue: €${(stats.totalRevenue / 100).toFixed(2)}`)
console.log(`Tickets sold: ${stats.totalTicketsSold}`)
```

## Query Structure Patterns

### Image URLs
All image fields use the pattern:
```groq
"image": image.asset->url
```
This dereferences the image asset and returns the URL directly.

### References
References to other documents use the `->` operator:
```groq
"raffleItem": raffleItem->{
  _id,
  title,
  // other fields
}
```

### Ordering
Most queries include ordering:
- Raffle items: `| order(order asc)` - By display order
- Purchases: `| order(purchaseDate desc)` - Most recent first

### Filtering
Active filters use boolean checks:
```groq
*[_type == "raffleItem" && isActive == true]
```

Status filters use string comparison:
```groq
*[_type == "purchase" && paymentStatus == $status]
```

## Adding New Queries

When adding new queries:
1. Add them to `/src/sanity/lib/queries.ts`
2. Use the `groq` template literal from `next-sanity`
3. Follow existing naming patterns
4. Document parameters with comments
5. Update this documentation

## Performance Considerations

- Use projections to limit returned fields
- Add indexes for frequently queried fields in Sanity Studio
- Use the `[0]` operator for single document queries
- Limit array results with `[0...n]` syntax when appropriate
