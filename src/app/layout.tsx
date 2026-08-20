import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kochi.buzz"),
  title: "kochi.buzz — What's happening in Kochi tech",
  description:
    "Events, jobs, opportunities, communities and things being built across Kochi's technology ecosystem.",
  openGraph: {
    title: "kochi.buzz — What's happening in Kochi tech",
    description:
      "Events, jobs, opportunities, communities and things being built across Kochi's technology ecosystem.",
    url: "https://kochi.buzz",
    siteName: "kochi.buzz",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "kochi.buzz — What's happening in Kochi tech",
    description:
      "Events, jobs, opportunities, communities and things being built across Kochi's technology ecosystem.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} font-[family-name:var(--font-geist-sans)] antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
