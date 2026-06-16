import type { Metadata } from "next";
import { Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "../styles/globals.css";
import { CollabProvider } from "../lib/collab-store";

// Neutral grotesque + monospaced data — the dense "operational console" register.
const sans = Public_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Construction OS — construction transparency platform",
  description: "One live map of every site, build and conversation. Clients, contractors and PMs on the same page.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${sans.variable} ${mono.variable}`}>
      <body className="min-h-[100dvh] bg-surface-base text-fg antialiased">
        <CollabProvider>{children}</CollabProvider>
      </body>
    </html>
  );
}
