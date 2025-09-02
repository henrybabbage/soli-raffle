"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import PayPalMeButton from "./PayPalMeButton";

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
  const [buyerInfo, setBuyerInfo] = useState<
    Record<string, { email: string; name: string }>
  >({});

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
      setBuyerInfo((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }, 2000);
  }

  function updateBuyerInfo(
    itemId: string,
    field: "email" | "name",
    value: string
  ) {
    setBuyerInfo((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  }

  function isValidEmail(email: string) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
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
            <p className="text-xs sm:text-sm text-secondary-foreground">
              <span className="font-normal">Value:</span> {item.value}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="text-xs sm:text-sm text-secondary-foreground font-normal">
                Links:
              </span>
              {item.contact.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-secondary-foreground hover:text-brand transition-colors duration-200"
                >
                  {link.label}
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
                    Total: €{(5 * (quantities[item._id] || 1)).toFixed(2)}
                  </div>

                  <div className="mt-3 mb-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor={`email-${item._id}`}
                          className="block text-xs text-foreground mb-1"
                        >
                          Email *
                        </label>
                        {(() => {
                          const email = buyerInfo[item._id]?.email || "";
                          const showError =
                            email.length > 0 && !isValidEmail(email);
                          return (
                            <>
                              <input
                                type="email"
                                id={`email-${item._id}`}
                                value={email}
                                onChange={(e) =>
                                  updateBuyerInfo(
                                    item._id,
                                    "email",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 py-2 text-sm border rounded-xs focus:outline-none focus:ring-2 focus:border-transparent ${
                                  showError
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-secondary-foreground focus:ring-brand"
                                }`}
                                placeholder="Email address"
                                required
                                aria-invalid={showError}
                                autoComplete="email"
                                inputMode="email"
                                pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                              />
                              {showError && (
                                <p className="mt-1 text-xs text-red-600">
                                  Please enter a valid email address.
                                </p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      <div>
                        <label
                          htmlFor={`name-${item._id}`}
                          className="block text-xs text-foreground mb-1"
                        >
                          Name *
                        </label>
                        <input
                          type="text"
                          id={`name-${item._id}`}
                          value={buyerInfo[item._id]?.name || ""}
                          onChange={(e) =>
                            updateBuyerInfo(item._id, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 text-sm border border-secondary-foreground rounded-xs focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                          placeholder="Name"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const email = buyerInfo[item._id]?.email || "";
                    const name = buyerInfo[item._id]?.name || "";
                    const canProceed =
                      isValidEmail(email) && name.trim().length > 0;
                    return canProceed;
                  })() ? (
                    <PayPalMeButton
                      key={`${item._id}-${quantities[item._id]}`}
                      amount={5}
                      itemName={item.title}
                      itemId={item._id}
                      quantity={quantities[item._id] || 1}
                      buyerEmail={buyerInfo[item._id]?.email}
                      buyerName={buyerInfo[item._id]?.name}
                      onPaymentInitiated={() =>
                        handlePaymentInitiated(item._id)
                      }
                    />
                  ) : (
                    <div className="text-left py-4 text-sm text-secondary-foreground">
                      Please fill in your email and name to proceed with
                      payment.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
