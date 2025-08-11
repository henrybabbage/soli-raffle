import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { useEffect, useState } from "react";

export interface Link {
  label: string;
  href: string;
}

export interface RaffleItem {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  details: string;
  value: string;
  contact: Link[];
  image: SanityImageSource;
  slug: {
    current: string;
  };
  order: number;
}

export function useRaffleItems() {
  const [raffleItems, setRaffleItems] = useState<RaffleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRaffleItems() {
      try {
        setLoading(true);
        const response = await fetch("/api/raffle-items");

        if (!response.ok) {
          throw new Error("Failed to fetch raffle items");
        }

        const data = await response.json();
        setRaffleItems(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching raffle items:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRaffleItems();
  }, []);

  return { raffleItems, loading, error };
}
