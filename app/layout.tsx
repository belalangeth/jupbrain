import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SolanaProviders } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JupBrain — Behavioral Trading Intelligence on Solana",
  description:
    "Discover your trading psychology. JupBrain analyzes your on-chain Jupiter swap history to detect FOMO, panic selling, and revenge trading patterns — then gives you AI-powered coaching to trade better.",
  keywords: ["Solana", "Jupiter", "DeFi", "trading psychology", "behavioral finance", "crypto"],
  openGraph: {
    title: "JupBrain — Know Yourself, Trade Better",
    description: "The world's first behavioral trading intelligence platform on Solana.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <SolanaProviders>{children}</SolanaProviders>
      </body>
    </html>
  );
}
