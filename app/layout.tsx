import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import "../src/styles.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://reado.lol";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Reado — The Readwise Alternative with No Subscriptions | Remember What You Read",
    template: "%s | Reado",
  },
  description:
    "The #1 Readwise alternative with no recurring monthly subscriptions. Reado resurfaces your Kindle book highlights directly to your inbox and daily review room on your schedule. One-time $49 lifetime pass.",
  applicationName: "Reado",
  authors: [{ name: "Reado Team", url: siteUrl }],
  creator: "Reado",
  publisher: "Reado",
  category: "Productivity & Education",
  keywords: [
    "readwise alternative",
    "readwise alternative lifetime",
    "readwise alternative no subscription",
    "readwise one time payment",
    "readwise lifetime deal",
    "readwise pricing alternative",
    "readwise vs reado",
    "omnivore alternative",
    "omnivore app alternative",
    "readwise reader alternative",
    "omnivore export importer",
    "kindle highlights without subscription",
    "kindle my clippings parser",
    "kindle clippings cleaner",
    "reading memory engine",
    "spaced repetition books",
    "read it later app",
    "book highlight digest",
    "remember what you read",
    "kindle email digest",
    "founder reading archive",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/reado-mark.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/reado-mark.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Reado",
    title: "Reado — The Reading Memory Engine | Remember What You Read",
    description:
      "A quiet reader and spaced-repetition system for long-form text and Kindle book highlights. Periodic email digest, no recurring subscriptions.",
    images: [
      {
        url: "/reado-lockup.png",
        width: 1200,
        height: 630,
        alt: "Reado — Remember What You Read",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reado — The Reading Memory Engine",
    description:
      "A quiet reading room for book highlights. Spaced-repetition review room and customizable morning email digests.",
    images: ["/reado-lockup.png"],
    creator: "@reado",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteUrl}/#app`,
      name: "Reado",
      url: siteUrl,
      applicationCategory: "EducationalApplication",
      operatingSystem: "All",
      description:
        "A quiet reader and memory engine that turns Kindle book highlights into lifelong wisdom through daily spaced repetition reviews and email digests.",
      offers: {
        "@type": "Offer",
        price: "49.00",
        priceCurrency: "USD",
        category: "Lifetime Membership",
      },
      featureList: [
        "Kindle My Clippings import",
        "CSV highlight import",
        "Omnivore JSON & Markdown export migration",
        "Read-it-later web article saving and clean scraper",
        "Automatic Open Library cover matching",
        "Custom email routine (Morning, Midday, Evening)",
        "Spaced repetition daily review room",
        "Distraction-free typography reader with audio TTS",
      ],
    },
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Reado",
      url: siteUrl,
      logo: `${siteUrl}/reado-logo.png`,
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Reado and how is it a Readwise alternative?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Reado is the premier Readwise alternative designed for readers who want to remember what they read without paying recurring monthly or annual subscriptions. Reado imports your Kindle My Clippings and book notes, automatically matches book covers, and resurfaces quiet quotes in a daily review room and scheduled morning email digests for a one-time $49 lifetime pass.",
          },
        },
        {
          "@type": "Question",
          name: "Does Reado have a monthly subscription like Readwise?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No! Unlike Readwise's recurring $100+ per year subscription model, Reado offers a free 5-quote test plan followed by a single $49 one-time payment for the Founder Pass, giving you unlimited lifetime access forever with no recurring bills.",
          },
        },
        {
          "@type": "Question",
          name: "How does Reado's pricing compare to Readwise?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Readwise costs $96 to $120+ every year. Reado costs a one-time $49 fee for lifetime access. You pay once and keep your reading memory engine forever.",
          },
        },
        {
          "@type": "Question",
          name: "How do I import highlights from Kindle?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Connect your Kindle to your computer or export your clippings, then drag and drop 'My Clippings.txt' or any CSV file into Reado's Import page. Reado automatically parses quotes and enriches book covers.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="velvet">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ClerkProvider
          appearance={{
            theme: shadcn,
            variables: {
              colorBackground: "#141416",
              colorForeground: "#f5f5f5",
              colorInput: "#1f1f23",
              colorInputForeground: "#f5f5f5",
              colorNeutral: "#a1a1aa",
              colorModalBackdrop: "rgba(0, 0, 0, 0.78)",
              colorPrimary: "#f5f5f5",
              colorPrimaryForeground: "#141416",
              borderRadius: "0.75rem",
            },
            elements: {
              card: "bg-[#141416] border border-white/10 shadow-2xl rounded-xl",
              cardBox: "bg-[#141416] border border-white/10 shadow-2xl rounded-xl",
              modalContent: "bg-[#141416] border border-white/10 shadow-2xl rounded-xl",
              modalBackdrop: "backdrop-blur-md bg-black/80",
              userProfileModalContent: "bg-[#141416] border border-white/10 shadow-2xl rounded-xl",
              userProfileNavbar: "bg-[#141416] border-r border-white/10",
              userProfilePage: "bg-[#141416]",
              userButtonPopoverCard: "bg-[#141416] border border-white/10 shadow-2xl rounded-xl",
            },
          }}
          signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in"}
          signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up"}
          signInFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "/review"}
          signUpFallbackRedirectUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "/onboarding"}
        >
          <Providers>{children}</Providers>
          <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}
