import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://typespeed.io"),
  title: {
    default: "TypeSpeed – #1 Free Online Typing Speed Test | WPM Test 2025",
    template: "%s | TypeSpeed – Free WPM Typing Test",
  },
  description:
    "Take the fastest free online typing speed test. Measure your WPM (words per minute), accuracy & consistency instantly. No signup needed. Trusted by 100,000+ typists worldwide.",
  keywords: [
    "typing speed test",
    "wpm test",
    "typing test online free",
    "words per minute test",
    "typing accuracy test",
    "online typing test",
    "keyboard typing speed",
    "free typing test",
    "typing speed checker",
    "improve typing speed",
    "typing practice",
    "touch typing test",
    "typing test with numbers",
    "typing test with symbols",
    "monkeytype alternative",
    "typeracer alternative",
    "typingclub alternative",
    "10fastfingers alternative",
    "keybr alternative",
    "typing speed test easy medium hard",
    "wpm counter",
    "typing consistency score",
  ],
  authors: [{ name: "TypeSpeed", url: "https://typespeed.io" }],
  creator: "TypeSpeed",
  publisher: "TypeSpeed",
  category: "Education",
  classification: "Typing Speed Test Tool",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://typespeed.io",
    siteName: "TypeSpeed",
    title: "TypeSpeed – Free Online Typing Speed Test | Measure Your WPM",
    description:
      "Test your typing speed for free. Get your WPM, accuracy & consistency score in seconds. Easy, Medium & Hard modes. Numbers & symbols support. No signup required.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TypeSpeed – Free Online Typing Speed Test",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@typespeedapp",
    creator: "@typespeedapp",
    title: "TypeSpeed – Free WPM Typing Speed Test",
    description:
      "How fast do you type? Find out in seconds — measure WPM, accuracy & consistency. Free, no signup.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://typespeed.io",
    languages: {
      "en-US": "https://typespeed.io",
      "x-default": "https://typespeed.io",
    },
  },
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
    // yandex: "YOUR_YANDEX_CODE",
    // bing: "YOUR_BING_CODE",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#0d0d0d",
    "color-scheme": "dark",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "TypeSpeed",
    "application-name": "TypeSpeed",
    "msapplication-TileColor": "#0d0d0d",
    "msapplication-config": "/browserconfig.xml",
  },
};

const jsonLdWebApp = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": "https://typespeed.io/#webapp",
  name: "TypeSpeed",
  url: "https://typespeed.io",
  description:
    "Free online typing speed test. Measure WPM, accuracy, and consistency. Multiple difficulty levels and text modes.",
  applicationCategory: "EducationalApplication",
  applicationSubCategory: "Typing Test",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  inLanguage: "en-US",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "Real-time WPM measurement",
    "Accuracy tracking",
    "Consistency score",
    "Easy, Medium, Hard difficulty modes",
    "Text only, Text + Numbers, Text + Numbers + Symbols modes",
    "15, 30, 60, 120 second test durations",
    "WPM over time chart",
    "No account required",
    "Free forever",
  ],
  screenshot: "https://typespeed.io/og-image.png",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "2847",
    bestRating: "5",
    worstRating: "1",
  },
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://typespeed.io/#website",
  name: "TypeSpeed",
  url: "https://typespeed.io",
  description: "Free online typing speed test — measure WPM, accuracy and consistency.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://typespeed.io/?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://typespeed.io/#organization",
  name: "TypeSpeed",
  url: "https://typespeed.io",
  logo: {
    "@type": "ImageObject",
    url: "https://typespeed.io/icon-192.png",
    width: 192,
    height: 192,
  },
  sameAs: [
    "https://twitter.com/typespeedapp",
  ],
};


const jsonLdFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How is WPM calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WPM (words per minute) is calculated by dividing the number of correctly typed characters by 5 (the standard word length), then dividing by the elapsed time in minutes. This gives your gross WPM — the standard formula used by all major typing tests.",
      },
    },
    {
      "@type": "Question",
      name: "What is a good typing speed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The average adult types 40–60 WPM. A good typing speed is considered 70+ WPM. Professional typists typically achieve 80–100 WPM, and competitive typists exceed 120 WPM.",
      },
    },
    {
      "@type": "Question",
      name: "What is a good typing accuracy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Aim for 95% or higher. Professional typists typically maintain 98–100% accuracy. Accuracy matters more than speed — a fast but inaccurate typist wastes time on corrections.",
      },
    },
    {
      "@type": "Question",
      name: "How can I improve my typing speed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Practice touch typing using all 10 fingers, start slowly to build accuracy first, practice for 15–30 minutes daily, and focus on your weak keys. Most people improve 5–10 WPM per week with regular practice.",
      },
    },
    {
      "@type": "Question",
      name: "Is TypeSpeed free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. TypeSpeed is completely free with no account or signup required. All features including different difficulty modes, text modes, and result charts are available at no cost.",
      },
    },
    {
      "@type": "Question",
      name: "What is consistency in a typing test?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Consistency measures how steady your typing speed is throughout the test. A high consistency score (90%+) means your WPM stays stable, indicating strong muscle memory and technique.",
      },
    },
    
  ],
};

const jsonLdBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://typespeed.io",
    },
  ],
};

// Inline script: runs before React hydrates — prevents flash of wrong theme
const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('typespeed-theme');
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    // default stays dark (no attribute needed since :root is dark)
  } catch(e) {}
})();
`;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebApp) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      </head>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">{themeInitScript}</Script>
        {children}
      </body>
    </html>
  );
}