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
  title: "Kochi Buzz — The city, tuned in",
  description:
    "Your live guide to events, jobs, opportunities, communities and things being built across Kochi.",
  applicationName: "Kochi Buzz",
  category: "city guide",
  openGraph: {
    title: "Kochi Buzz — The city, tuned in",
    description:
      "Your live guide to events, jobs, opportunities, communities and things being built across Kochi.",
    url: "https://kochi.buzz",
    siteName: "kochi.buzz",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Kochi Buzz — The city, tuned in",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kochi Buzz — The city, tuned in",
    description:
      "Your live guide to events, jobs, opportunities, communities and things being built across Kochi.",
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
    <html lang="en">
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
