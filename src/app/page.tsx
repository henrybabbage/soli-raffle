import { client } from "@/sanity/lib/client";
import { raffleItemsQuery } from "@/sanity/lib/queries";
import Image from "next/image";
import RaffleGrid from "./components/RaffleGrid";

export default async function Home() {
  const raffleItems = await client.fetch(raffleItemsQuery);

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
                  Winners drawn live 31.08.2025
                </p>
                <p className="text-xs sm:text-sm text-brand">5€ per ticket</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
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

        <RaffleGrid items={raffleItems} />
      </main>

      <footer className="bg-background h-[300px] mt-auto flex items-end">
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <p className="text-foreground text-sm">Soli-Raffle 2025</p>
        </div>
      </footer>
    </div>
  );
}
