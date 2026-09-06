"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import PayPalMeButton from "./PayPalMeButton";
import { TICKET_PRICE_EUR } from "../constants";

export interface LinkItem {
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
  validity?: string;
  location?: string;
  contact: LinkItem[];
  image: string | null;
  slug: { current: string };
  order: number;
}

interface RaffleGridProps {
  items: RaffleItem[];
  isDrawn?: boolean;
}

export default function RaffleGrid({ items, isDrawn = false }: RaffleGridProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showPayPal, setShowPayPal] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (items.length > 0) {
      const initial: Record<string, number> = {};
      items.forEach((i) => {
        initial[i._id] = 1;
      });
      setQuantities(initial);
    }
  }, [items]);

  function updateQuantity(id: string, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  }

  function handleBuyTicket(item: RaffleItem) {
    setShowPayPal((prev) => ({ ...prev, [item._id]: true }));
  }

  function handlePaymentInitiated(itemId: string) {
    setTimeout(() => {
      setShowPayPal((prev) => ({ ...prev, [itemId]: false }));
    }, 2000);
  }

  // Handle null or undefined items
  if (!items || !Array.isArray(items)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] md:min-h-[70vh]">
        <p className="text-secondary-foreground">No raffle items available at this time.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-8 lg:gap-12 min-h-[60vh] md:min-h-[70vh]">
      {items.map((item, index) => (
        <div key={item._id} className={`space-y-4 ${isDrawn ? 'opacity-60 pointer-events-none' : ''}`}>
          <div className="aspect-[4/5] bg-gray-200 overflow-hidden relative">
            {item.image ? (
              <Image
                src={item.image}
                alt={`${item.instructor} - ${item.title}`}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 384px, (min-width: 768px) 600px, 100vw"
                priority={index < 3}
              />
            ) : (
              <div className="w-full h-full uppercase bg-gradient-to-br from-brand/10 to-brand/20 flex items-center justify-center text-brand text-xs font-normal">
                Photo Coming Soon
              </div>
            )}

            <span className="absolute top-3 left-3 z-10 rounded-full bg-background/95 px-3 py-1 font-mono text-xs text-foreground">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="absolute bottom-3 right-3 z-10 rounded-full bg-accent px-3 py-1 font-mono text-xs text-white">
              value {item.value}
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-medium text-foreground font-mono">
              {item.title}
            </h2>
            <p className="text-xs sm:text-sm text-secondary-foreground italic">
              {item.instructor}
            </p>
            <p className="text-xs sm:text-sm text-secondary-foreground leading-relaxed">
              {item.details}
            </p>
            {item.location && (
              <p className="text-xs sm:text-sm text-secondary-foreground">
                <span className="font-normal">Location:</span> {item.location}
              </p>
            )}
            {item.validity && (
              <p className="text-xs sm:text-sm text-secondary-foreground">
                <span className="font-normal">Valid:</span> {item.validity}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <span className="text-xs sm:text-sm text-secondary-foreground font-normal">
                Links:
              </span>
              {item.contact && Array.isArray(item.contact) && item.contact.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-secondary-foreground hover:text-brand transition-colors duration-200"
                >
                  <span>{link.label}</span>
                  <span
                    aria-hidden="true"
                    className="ml-1 inline-block size-3 align-[-0.1em] bg-current [mask:url('/arrow.svg')_center/contain_no-repeat]"
                  />
                </a>
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 sm:gap-3">
                {!showPayPal[item._id] ? (
                  <button
                    className={`px-4 sm:px-6 py-2 bg-transparent border border-foreground text-foreground hover:border-brand hover:text-brand uppercase rounded transition-colors duration-200 text-xs order-2 sm:order-1 ${isDrawn ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => handleBuyTicket(item)}
                    disabled={isDrawn}
                  >
                    {isDrawn ? 'Raffle Drawn' : 'Buy Ticket'}
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors duration-200 text-sm order-2 sm:order-1"
                    onClick={() =>
                      setShowPayPal((prev) => ({ ...prev, [item._id]: false }))
                    }
                  >
                    Cancel
                  </button>
                )}

                <div className="flex items-center justify-center space-x-3 order-1 sm:order-2">
                  <button
                    className="w-8 h-8 rounded-full border border-foreground flex items-center justify-center hover:border-brand hover:text-brand transition-colors duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => updateQuantity(item._id, -1)}
                    disabled={showPayPal[item._id]}
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium text-base text-foreground">
                    {quantities[item._id]}
                  </span>
                  <button
                    className="w-8 h-8 rounded-full border border-foreground flex items-center justify-center hover:border-brand hover:text-brand transition-colors duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => updateQuantity(item._id, 1)}
                    disabled={showPayPal[item._id]}
                  >
                    +
                  </button>
                </div>
              </div>

              {showPayPal[item._id] && (
                <div className="border-t pt-6 md:pt-8">
                  <div className="mb-2 text-sm text-foreground text-center sm:text-left">
                    Total: €{(TICKET_PRICE_EUR * (quantities[item._id] || 1)).toFixed(2)}
                  </div>

                  <PayPalMeButton
                    key={`${item._id}-${quantities[item._id]}`}
                    amount={TICKET_PRICE_EUR}
                    itemName={item.title}
                    quantity={quantities[item._id] || 1}
                    onPaymentInitiated={() =>
                      handlePaymentInitiated(item._id)
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
