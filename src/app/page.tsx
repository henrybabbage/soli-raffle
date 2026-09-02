import { client } from "@/sanity/lib/client";
import { raffleAboutQuery, raffleItemsQuery } from "@/sanity/lib/queries";
import Image from "next/image";
import RaffleGrid from "./components/RaffleGrid";
import { TICKET_PRICE_EUR } from "./constants";

const defaultRaffleAbout = {
  fundraisingDetails:
    "This online raffle is raising funds for families in Gaza to help meet basic needs, including food, shelter, clothing, medicine, and hygiene products. Our goal is to raise 500€ for each of three families, for a total of 1.500€. Any additional funds raised will be distributed in 50-100€ amounts to support other families.",
  contactIntroduction:
    "If you would like to learn more about the families receiving the funds, please email Lilith at",
  contactEmail: "lilith.spink@proton.me",
  entryInstructions:
    "To enter the raffle, simply select the ticket below the prize(s) you would like to win and purchase as many entries as you wish. Each ticket costs 10€, with payment via PayPal.",
  drawIntroduction: "The winners will be drawn live on Lilith's Instagram",
  instagramHandle: "lilith__llllllll",
  instagramUrl: "https://www.instagram.com/lilith__llllllll/",
  drawConclusion: "on the 1st October using an online random name selector.",
  closingMessage: "Good luck!",
};

type RaffleAbout = Partial<typeof defaultRaffleAbout>;

export default async function Home() {
  let raffleItems;
  let raffleAbout: RaffleAbout | null;
  try {
    [raffleItems, raffleAbout] = await Promise.all([
      client.fetch(raffleItemsQuery),
      client.fetch<RaffleAbout | null>(raffleAboutQuery),
    ]);
  } catch (error) {
    console.error("Failed to fetch raffle content:", error);
    raffleItems = [];
    raffleAbout = null;
  }

  const about = { ...defaultRaffleAbout, ...raffleAbout };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 bg-background w-full">
        <div className="mx-auto w-full max-w-[82rem] border-b">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
              <div className="flex items-center gap-4">
                <Image
                  src="/icon-300w.svg"
                  alt=""
                  aria-hidden="true"
                  width={301}
                  height={302}
                  className="align-baseline h-10 w-auto sm:h-12"
                  priority
                />
                <h1 className="text-4xl sm:text-5xl font-light tracking-wide italic text-foreground font-mono">
                  Soli-Raffle
                </h1>
              </div>
              <div className="flex flex-col space-y-0.5 text-left sm:text-right">
                <p className="text-xs sm:text-sm text-brand">
                  {TICKET_PRICE_EUR}€ per ticket
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="mb-12 text-left max-w-4xl mr-auto">
          <p className="text-sm sm:text-base text-foreground leading-relaxed mb-4">
            {about.fundraisingDetails} {about.contactIntroduction}{" "}
            <a
              href={`mailto:${about.contactEmail}`}
              className="hover:text-brand transition-colors duration-200"
            >
              {about.contactEmail}
            </a>
            .
          </p>
          <p className="text-sm sm:text-base text-foreground leading-relaxed mb-4">
            {about.entryInstructions}
          </p>
          <p className="text-sm sm:text-base text-foreground leading-relaxed mb-4">
            {about.drawIntroduction}{" "}
            <a
              href={about.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand transition-colors duration-200"
            >
              {about.instagramHandle}
            </a>{" "}
            {about.drawConclusion}
          </p>
          <p className="text-sm sm:text-base text-foreground leading-relaxed">
            {about.closingMessage}
          </p>
        </div>

        <RaffleGrid items={raffleItems} isDrawn={false} />
      </main>

      <footer className="bg-background h-[300px] mt-auto flex items-end">
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <p className="text-foreground text-sm">
            Soli-Raffle {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
