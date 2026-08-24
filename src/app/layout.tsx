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

const siteUrl = "https://www.kochi.buzz";
const socialImageUrl = `${siteUrl}/social/kochi-buzz-preview-v2.jpg`;
const socialTitle = "Kochi Buzz — The city, by date";
const socialDescription =
  "Kochi’s live city calendar — events, people, jobs and opportunities worth showing up for.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Kochi Buzz — The Kochi Calendar",
  description:
    "The source-backed city calendar for Kochi — events, meetups, workshops, jobs and opportunities worth showing up for.",
  applicationName: "Kochi Buzz",
  category: "city guide",
  appleWebApp: {
    capable: true,
    title: "Kochi Buzz",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: socialTitle,
    description: socialDescription,
    url: siteUrl,
    siteName: "kochi.buzz",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: socialImageUrl,
        secureUrl: socialImageUrl,
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: socialTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: socialDescription,
    images: [{ url: socialImageUrl, alt: socialTitle }],
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
        <a href="#main-content" className="skip-link">Skip to the calendar</a>
        {children}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
