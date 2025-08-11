"use client";

import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRaffleItems, type RaffleItem } from "../hooks/useRaffleItems";
import PayPalMeButton from "./components/PayPalMeButton";

export default function Home() {
  const { raffleItems, loading, error } = useRaffleItems();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [showPayPal, setShowPayPal] = useState<Record<string, boolean>>({});
  const [buyerInfo, setBuyerInfo] = useState<
    Record<string, { email: string; name: string }>
  >({});

  // Initialize quantities when raffle items are loaded
  useEffect(() => {
    if (raffleItems.length > 0) {
      const initialQuantities: Record<string, number> = {};
      raffleItems.forEach((item) => {
        initialQuantities[item._id] = 1;
      });
      setQuantities(initialQuantities);
    }
  }, [raffleItems]);

  const updateQuantity = (id: string, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, prev[id] + change),
    }));
  };

  const handleBuyTicket = (item: RaffleItem) => {
    setShowPayPal((prev) => ({
      ...prev,
      [item._id]: true,
    }));
  };

  const handlePaymentInitiated = (itemId: string) => {
    console.log("Payment initiated for item:", itemId);
    // Show a message that payment was initiated
    alert(
      `You're being redirected to PayPal to complete your purchase of ${quantities[itemId]} ticket(s). Please include your name and email in the PayPal notes.`
    );
    // Reset the form after a delay to allow the user to see the redirect
    setTimeout(() => {
      setShowPayPal((prev) => ({
        ...prev,
        [itemId]: false,
      }));
      // Clear buyer info for this item
      setBuyerInfo((prev) => {
        const newInfo = { ...prev };
        delete newInfo[itemId];
        return newInfo;
      });
    }, 2000);
  };

  const updateBuyerInfo = (
    itemId: string,
    field: "email" | "name",
    value: string
  ) => {
    setBuyerInfo((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
          <div className="flex items-center gap-4">
            <Image
              src="/icon-300w.svg"
              alt=""
              aria-hidden="true"
              width={301}
              height={302}
              style={{ height: "1em", width: "auto" }}
              className="align-baseline text-4xl sm:text-5xl"
              priority
            />
            <h1 className="text-4xl sm:text-5xl font-light tracking-wide italic text-foreground font-mono">
              Soli-Raffle
            </h1>
          </div>
          <div className="flex flex-col space-y-0.5 text-left sm:text-right">
            <p className="text-xs sm:text-sm text-brand">
              Winners drawn live 31.08.2025
            </p>
            <p className="text-xs sm:text-sm text-brand">5€ per ticket</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Introduction Section */}
        <div className="mb-12 text-left max-w-4xl mr-auto">
          <p className="text-sm sm:text-base text-foreground leading-relaxed mb-4">
            This online raffle runs alongside our soli-event in Berlin to raise
            support funds for the people of Sudan, Congo, and Palestine. For
            more information about where the funds will be sent visit our{" "}
            <a
              href="https://www.instagram.com/p/DM2ltiXsAC_/?igsh=bW9zMXhlNXVrNGJq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-brand no-underline hover:no-underline"
            >
              Instagram post
            </a>{" "}
            or email Lilith at lilith.spink@proton.me. We will draw the winners
            live on Instagram on the 31.08.25.
          </p>
          <p className="text-sm sm:text-base text-foreground leading-relaxed">
            You can enter the draw to win the prize(s) of your choice, simple
            select the tickets below each prize and add as many entries as you
            want. Good luck!
          </p>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="col-span-full text-center py-12">
            <div className="text-lg text-foreground">
              Loading raffle items...
            </div>
          </div>
        )}

        {error && (
          <div className="col-span-full text-center py-12">
            <div className="text-lg text-red-600">
              Error loading raffle items: {error}
            </div>
          </div>
        )}

        {!loading && !error && raffleItems.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-lg text-foreground">
              No raffle items available.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-8 lg:gap-12">
          {raffleItems.map((item) => (
            <div key={item._id} className="space-y-4">
              {/* Image */}
              <div className="aspect-[4/5] bg-gray-200 overflow-hidden relative">
                {item.image ? (
                  <Image
                    src={urlFor(item.image).url()}
                    alt={`${item.instructor} - ${item.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full uppercase bg-gradient-to-br from-brand/10 to-brand/20 flex items-center justify-center text-brand text-xs font-normal">
                    Photo Coming Soon
                  </div>
                )}
              </div>

              {/* Content */}
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

                {/* Purchase Controls */}
                <div className="space-y-4 pt-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 sm:gap-3">
                    {!showPayPal[item._id] ? (
                      <button
                        className="px-4 sm:px-6 py-2 bg-transparent border border-foreground text-foreground hover:border-brand hover:text-brand uppercase rounded transition-colors duration-200 text-xs order-2 sm:order-1"
                        onClick={() => handleBuyTicket(item)}
                      >
                        Buy Ticket
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors duration-200 text-sm order-2 sm:order-1"
                        onClick={() =>
                          setShowPayPal((prev) => ({
                            ...prev,
                            [item._id]: false,
                          }))
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
                        Total: €{(5 * quantities[item._id]).toFixed(2)}
                      </div>

                      {/* Buyer Information Form */}
                      <div className="mt-3 mb-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor={`email-${item._id}`}
                              className="block text-xs text-foreground mb-1"
                            >
                              Email *
                            </label>
                            <input
                              type="email"
                              id={`email-${item._id}`}
                              value={buyerInfo[item._id]?.email || ""}
                              onChange={(e) =>
                                updateBuyerInfo(
                                  item._id,
                                  "email",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                              placeholder="your@email.com"
                              required
                            />
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
                                updateBuyerInfo(
                                  item._id,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                              placeholder="Your Name"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {buyerInfo[item._id]?.email &&
                      buyerInfo[item._id]?.name ? (
                        <PayPalMeButton
                          key={`${item._id}-${quantities[item._id]}`}
                          amount={5}
                          itemName={item.title}
                          itemId={item._id}
                          quantity={quantities[item._id]}
                          buyerEmail={buyerInfo[item._id]?.email}
                          buyerName={buyerInfo[item._id]?.name}
                          onPaymentInitiated={() =>
                            handlePaymentInitiated(item._id)
                          }
                        />
                      ) : (
                        <div className="text-left py-4 text-sm text-gray-500">
                          Please fill in your email and name to proceed with
                          payment
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background h-[300px] flex items-end">
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <p className="text-foreground text-sm">Soli-Raffle 2025</p>
        </div>
      </footer>
    </div>
  );
}
