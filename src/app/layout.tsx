import type { Metadata } from "next";
import localFont from "next/font/local";
import PayPalWrapper from "./components/PayPalWrapper";
import LenisProvider from "./components/lenis-provider";
import "./globals.css";

const quadrantText = localFont({
  src: [
    {
      path: "../../public/fonts/QuadrantText/QuadrantText-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/QuadrantText/QuadrantText-RegularItalic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-quadrant-text",
  display: "swap",
});

const quadrantTextMono = localFont({
  src: [
    {
      path: "../../public/fonts/QuadrantTextMono/QuadrantTextMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/QuadrantTextMono/QuadrantTextMono-RegularItalic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-quadrant-text-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Soli Raffle",
  description:
    "Purchase raffle tickets for exclusive Qigong and personal training sessions with Lingji Hon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${quadrantText.variable} ${quadrantTextMono.variable} antialiased`}
      >
        <LenisProvider>
          <PayPalWrapper>{children}</PayPalWrapper>
        </LenisProvider>
      </body>
    </html>
  );
}
