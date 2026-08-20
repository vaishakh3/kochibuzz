import type { Metadata, Viewport } from "next";
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
  title: "Kochi Buzz — Kochi is on air",
  description:
    "Tune into real events, people, jobs, opportunities and things being built across Kochi.",
  applicationName: "Kochi Buzz",
  category: "city guide",
  appleWebApp: {
    capable: true,
    title: "Kochi Buzz",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "Kochi Buzz — Kochi is on air",
    description:
      "Tune into real events, people, jobs, opportunities and things being built across Kochi.",
    url: "https://kochi.buzz",
    siteName: "kochi.buzz",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "Kochi Buzz — Kochi is on air",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kochi Buzz — Kochi is on air",
    description:
      "Tune into real events, people, jobs, opportunities and things being built across Kochi.",
    images: ["/og"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0b12",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} font-[family-name:var(--font-geist-sans)] antialiased`}
      >
        <a href="#main-content" className="skip-link">Skip to the buzz</a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
