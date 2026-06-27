import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://typespeed.io"),
  title: {
    default: "TypeSpeed – Free Online Typing Speed Test | WPM Test",
    template: "%s | TypeSpeed",
  },
  description:
    "Test and improve your typing speed with TypeSpeed. Measure WPM (words per minute), accuracy, and consistency in real time. Free online typing test — no signup required.",
  keywords: [
    "typing speed test",
    "wpm test",
    "typing test online",
    "words per minute",
    "typing accuracy",
    "improve typing speed",
    "free typing test",
    "keyboard test",
    "touch typing",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://typespeed.io",
    siteName: "TypeSpeed",
    title: "TypeSpeed – Free Online Typing Speed Test",
    description:
      "Measure your WPM, accuracy, and consistency. Challenge yourself with different difficulty modes.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TypeSpeed – Online Typing Speed Test",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TypeSpeed – Free WPM Typing Test",
    description: "How fast do you type? Test your WPM and accuracy now.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://typespeed.io",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "TypeSpeed",
    url: "https://typespeed.io",
    description: metadata.description,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Real-time WPM measurement",
      "Accuracy tracking",
      "Multiple difficulty modes",
      "Consistency score",
      "No account required",
    ],
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
