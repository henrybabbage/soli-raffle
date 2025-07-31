"use client";

import Image from "next/image";
import { useState } from "react";
import PayPalButton from "./components/PayPalButton";

interface RaffleItem {
  id: string;
  title: string;
  description: string;
  instructor: string;
  details: string;
  value: string;
  contact: string;
  image: string;
}

// Helper function to check if image exists
const getImagePath = (item: RaffleItem): string | null => {
  const availableImages = [
    "/images/1_Lingji.jpeg",
    "/images/7_Maximillian_Juno.jpeg",
    "/images/8_Denise.jpeg",
    "/images/9_Oly.jpeg",
    "/images/11_Rachel.jpeg",
    "/images/12_Tara.jpeg",
  ];
  return availableImages.includes(item.image) ? item.image : null;
};

// Helper function to normalize links
const normalizeLinks = (contact: string): string => {
  return contact
    .split(" ")
    .map((link) => {
      // Handle Instagram links (@username)
      if (link.startsWith("@")) {
        const username = link.substring(1);
        return `https://instagram.com/${username}`;
      }

      // Handle website links that don't have protocol
      if (link.includes(".") && !link.startsWith("http")) {
        return `https://${link}`;
      }

      return link;
    })
    .join(" ");
};



const raffleItems: RaffleItem[] = [
  {
    id: "1",
    title: "Private Qigong Session",
    description:
      "Lingji will offer a 1 hour online private qigong session. This session will offer techniques for grounding and regeneration with Zhan Zhuang (qi absorption postures) to bring the body into alignment and relaxation, and Taoist breathing techniques to cleanse and circulate energy.",
    instructor:
      "Lingji Hon 韓靈芝 is a Berlin based Taiji Quan and Qigong teacher",
    details:
      "Lingji will offer a 1 hour online private qigong session. This session will offer techniques for grounding and regeneration with Zhan Zhuang (qi absorption postures) to bring the body into alignment and relaxation, and Taoist breathing techniques to cleanse and circulate energy.",
    value: "100€",
    contact: normalizeLinks("@wudongtaiji wudongtaiji.com"),
    image: "/images/1_Lingji.jpeg",
  },
  {
    id: "2",
    title: "60-Minute Private Training Session",
    description:
      "Elias offers 1 x 60min private training sessions for either boxing, strength and conditioning, self defence, and kick boxing.",
    instructor: "Elias, boxing coach and MMA practitioner",
    details:
      "Elias offers 1 x 60min private training sessions for either boxing, strength and conditioning, self defence, and kick boxing.",
    value: "100€ to 120€",
    contact: normalizeLinks("@stillelias"),
    image: "/raffle-2.jpg",
  },
  {
    id: "3",
    title: "Black and White Film Developing Workshop",
    description:
      "Queer Analog Darkroom offers a Black and White Film Developing Workshop (3 hours).",
    instructor:
      "Queer Analog Darkroom is a self-organized collective committed to a more collaborative approach to visual arts and to resisting the depoliticization of photography.",
    details:
      "Black and White Film Developing Workshop (3 hours). At the core of their work is the darkroom, which works towards the redistribution of knowledge, increasing accessibility and mutual empowerment—both spatially and through shared learning.",
    value: "65€",
    contact: normalizeLinks("@queeranalogdarkroom @jetphoto"),
    image: "/raffle-3.jpg",
  },
  {
    id: "4",
    title: "60-Minute Personal Training Session",
    description:
      "Eliza offers a 60-minute personal training session with focus on strength training fundamentals, barbell technique, and building mobility and control.",
    instructor:
      "Eliza Cumming – Personal Trainer & Biomechanics Coach. Eliza is a strength and mobility coach based in Berlin, working primarily with FLINTA clients.",
    details:
      "1 x 60-minute personal training session with Eliza. Includes a full-body strength session tailored to your goals, technique coaching, and guidance around mobility or lifting basics.",
    value: "105€",
    contact: normalizeLinks("@elizacumming"),
    image: "/raffle-4.jpg",
  },
  {
    id: "5",
    title: "Relaxing Facial Skincare Treatment",
    description:
      "A 60 minute facial skincare & relaxation treatment including cleanse, tone, exfoliate, masque and massage options.",
    instructor:
      "A trans* practitioner trained in cosmetic and massage, neurodiversity aware and ready to hear your sensory or access needs.",
    details:
      "60 minute facial skincare & relaxation treatment. Includes: cleanse, tone, exfoliate, masque + options for hand & arm, neck & shoulder massage, and a lymphatic drainage facial massage. Choice of scent: lavender, rosemary or Bergamot.",
    value: "50€",
    contact: normalizeLinks("@qttherapy"),
    image: "/raffle-5.jpg",
  },
  {
    id: "6",
    title: "90-Minute Massage Session",
    description: "Varis offers a 1.5 hour massage session.",
    instructor: "Varis",
    details: "1.5 hour massage session (more details coming soon).",
    value: "TBD",
    contact: "Contact info coming",
    image: "/raffle-6.jpg",
  },
  {
    id: "7",
    title: "Birth Chart Reading",
    description:
      "Maximilian offers a one hour long birth chart reading with focus on growth lessons and archetypal patterns.",
    instructor: "Maximilian Juno is an evolutionary astrologer & guide",
    details:
      "One hour long birth chart reading; a place of soulful conversation & engagement with one's personal birth horoscope to illuminate the deeper archetypal patterns of our psyche & life, with a focus on the growth lessons you are currently moving through.",
    value: "130€",
    contact: normalizeLinks("@skywalker.astrology www.skywalkerastrology.com"),
    image: "/images/7_Maximillian_Juno.jpeg",
  },
  {
    id: "8",
    title: "Holistic Bodywork Session",
    description:
      "Denise offers a 1.5hr session of classical swedish massage with lomi lomi influence and thai yoga massage.",
    instructor:
      "Denise is attuned to the body's energetic motions, weaving the art of touch into holistic bodywork sessions that release tension, create space for energy flow, and realign the body with mind and spirit.",
    details:
      "1.5hr session of classical swedish massage with a lomi lomi influence and thai yoga massage. She implements an intuitive approach, tuning into each client's responses and adjusting pressure and techniques accordingly.",
    value: "100€",
    contact: normalizeLinks("Deniseagua.com"),
    image: "/images/8_Denise.jpeg",
  },
  {
    id: "9",
    title: "Craniosacral Therapy Session",
    description:
      "Oly offers a 70 minute craniosacral therapy session to support nervous system regulation and healing.",
    instructor:
      "Oly McDowell (they/them) is a licensed heilpraktiker, biodynamic craniosacral therapist and acupuncturist in training.",
    details:
      "70 minute craniosacral therapy session. Cranio is a somatic touch based therapy that supports people to regulate their nervous system and tune into the healing forces of their body.",
    value: "85€",
    contact: normalizeLinks("www.beinginthebody.de"),
    image: "/images/9_Oly.jpeg",
  },
  {
    id: "10",
    title: "Online Breathwork & Meditation Session",
    description:
      "Diana offers a 1-hour online private session combining pranayama, somatic breathwork, and guided meditation.",
    instructor:
      "Diana Farhat is a Beirut-based holistic psychologist (BA Psychology), Ayurvedic therapist, and senior yoga teacher (500hr) with over 10 years of experience.",
    details:
      "1-hour online private session combining pranayama, somatic breathwork, and guided meditation. Drawing from psychology and Rebirthing Breathwork, the session supports nervous system regulation, emotional release, and deep inner clarity.",
    value: "100€",
    contact: normalizeLinks("@integratedhealingtherapy"),
    image: "/raffle-10.jpg",
  },
  {
    id: "11",
    title: "60-Minute Bodywork Session",
    description:
      "Rachel offers a 1-hour 1:1 Bodywork Session focused on mindful touch, presence, and deep listening.",
    instructor:
      "Rachel Helmbrecht is a Berlin based Bodyworker and Physiotherapist.",
    details:
      "1-hour 1:1 Bodywork Session. It is a space of mindful touch, presence, and deep listening, which can create a sense of grounding, deeper relaxation, and renewed vitality.",
    value: "90€",
    contact: normalizeLinks(
      "@rachelhelmbrecht www.körpertherapie-helmbrecht.de"
    ),
    image: "/images/11_Rachel.jpeg",
  },
  {
    id: "12",
    title: "Somatic & Bodywork Session",
    description:
      "Tara offers a 1.5 hour somatic/bodywork based session exploring your needs through hands-on techniques and somatic exercises.",
    instructor:
      "Tara is a Berlin based Bodyworker and Somatic facilitator. Her pillars of work are one-on-one and group somatic coaching, tantric bodywork, and tantric and intimacy coaching.",
    details:
      "1.5 hour somatic/bodywork based session, where we will explore your needs through various hands on techniques and somatic exercises.",
    value: "180€",
    contact: normalizeLinks(
      "@tara_embodied https://www.sensuali.com/tara-18880/"
    ),
    image: "/images/12_Tara.jpeg",
  },
];

export default function Home() {
  const [quantities, setQuantities] = useState<Record<string, number>>({
    "1": 1,
    "2": 1,
    "3": 1,
    "4": 1,
    "5": 1,
    "6": 1,
    "7": 1,
    "8": 1,
    "9": 1,
    "10": 1,
    "11": 1,
    "12": 1,
  });
  const [showPayPal, setShowPayPal] = useState<Record<string, boolean>>({
    "1": false,
    "2": false,
    "3": false,
    "4": false,
    "5": false,
    "6": false,
    "7": false,
    "8": false,
    "9": false,
    "10": false,
    "11": false,
    "12": false,
  });

  const updateQuantity = (id: string, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, prev[id] + change),
    }));
  };

  const handleBuyTicket = (item: RaffleItem) => {
    setShowPayPal((prev) => ({
      ...prev,
      [item.id]: true,
    }));
  };

  const handlePaymentSuccess = (itemId: string, details: unknown) => {
    console.log("Payment successful for item:", itemId, details);
    alert(
      `Payment successful! You have purchased ${quantities[itemId]} ticket(s).`
    );
    setShowPayPal((prev) => ({
      ...prev,
      [itemId]: false,
    }));
  };

  const handlePaymentError = (itemId: string, error: unknown) => {
    console.error("Payment error for item:", itemId, error);
    alert("Payment failed. Please try again.");
    setShowPayPal((prev) => ({
      ...prev,
      [itemId]: false,
    }));
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
          <h1 className="text-4xl sm:text-5xl font-light tracking-wide">
            Soli-Raffle
          </h1>
          <div className="flex flex-col space-y-1 text-left sm:text-right">
            <p className="text-xs sm:text-sm text-gray-600">
              Winners announced 16.08.2025
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              Contact: lilith.spink@proton.me
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
          {raffleItems.map((item) => (
            <div key={item.id} className="space-y-4">
              {/* Image */}
              <div className="aspect-[4/5] bg-gray-200 rounded-lg overflow-hidden relative">
                {getImagePath(item) ? (
                  <Image
                    src={getImagePath(item)!}
                    alt={`${item.instructor} - ${item.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-purple-600 font-medium">
                    Photo Coming Soon
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h2 className="text-base sm:text-lg font-medium">
                  {item.title}
                </h2>

                <p className="text-xs sm:text-sm text-gray-700 italic">
                  {item.instructor}
                </p>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  <span className="font-medium">What:</span> {item.details}
                </p>

                <p className="text-xs sm:text-sm text-gray-700">
                  <span className="font-medium">Value:</span> {item.value}
                </p>

                <p className="text-xs sm:text-sm text-gray-700">
                  <span className="font-medium">Links:</span>{" "}
                  {item.contact.split(" ").map((link, index, array) => {
                    const isLast = index === array.length - 1;
                    
                    // Handle Instagram links
                    if (link.startsWith("https://instagram.com/")) {
                      const username = link.replace("https://instagram.com/", "");
                      return (
                        <span key={index}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800 underline"
                          >
                            @{username}
                          </a>
                          {!isLast && " "}
                        </span>
                      );
                    }
                    
                    // Handle other links
                    if (link.startsWith("http")) {
                      return (
                        <span key={index}>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800 underline"
                          >
                            {link}
                          </a>
                          {!isLast && " "}
                        </span>
                      );
                    }
                    
                    // Handle plain text
                    return (
                      <span key={index}>
                        {link}
                        {!isLast && " "}
                      </span>
                    );
                  })}
                </p>

                {/* Purchase Controls */}
                <div className="space-y-4 pt-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {!showPayPal[item.id] ? (
                      <button
                        className="px-4 sm:px-6 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded transition-colors duration-200 text-xs sm:text-sm order-2 sm:order-1"
                        onClick={() => handleBuyTicket(item)}
                      >
                        BUY TICKET
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors duration-200 text-sm order-2 sm:order-1"
                        onClick={() =>
                          setShowPayPal((prev) => ({
                            ...prev,
                            [item.id]: false,
                          }))
                        }
                      >
                        Cancel
                      </button>
                    )}

                    <div className="flex items-center justify-center space-x-3 order-1 sm:order-2">
                      <button
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 text-lg"
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={showPayPal[item.id]}
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium text-base">
                        {quantities[item.id]}
                      </span>
                      <button
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 text-lg"
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={showPayPal[item.id]}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {showPayPal[item.id] && (
                    <div className="border-t pt-4">
                      <div className="mb-2 text-sm text-gray-600 text-center sm:text-left">
                        Total: €{(100 * quantities[item.id]).toFixed(2)}
                      </div>
                      <PayPalButton
                        amount="100"
                        itemName={item.title}
                        quantity={quantities[item.id]}
                        onSuccess={(details) =>
                          handlePaymentSuccess(item.id, details)
                        }
                        onError={(error) => handlePaymentError(item.id, error)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
