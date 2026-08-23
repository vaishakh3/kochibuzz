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
    title: "Kochi Buzz — The Kochi Calendar",
    description:
      "The source-backed city calendar for Kochi — events, meetups, workshops, jobs and opportunities worth showing up for.",
    url: "https://kochi.buzz",
    siteName: "kochi.buzz",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Kochi Buzz — The Kochi Calendar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kochi Buzz — The Kochi Calendar",
    description:
      "The source-backed city calendar for Kochi — events, meetups, workshops, jobs and opportunities worth showing up for.",
    images: ["/og.png"],
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
