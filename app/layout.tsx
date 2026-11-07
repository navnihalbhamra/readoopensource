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
    default: "Reado — The Reading Memory Engine | Remember What You Read",
    template: "%s | Reado",
  },
  description:
    "You spend hours reading books — only to forget almost all of it weeks later. Reado resurfaces your best highlights directly to your inbox and daily review room on your schedule. Kindle clippings & CSV import.",
  applicationName: "Reado",
  authors: [{ name: "Reado Team", url: siteUrl }],
  creator: "Reado",
  publisher: "Reado",
  category: "Productivity & Education",
  keywords: [
    "readwise alternative",
    "kindle highlights",
    "my clippings parser",
    "reading memory",
    "spaced repetition books",
    "book highlight digest",
    "remember what you read",
    "kindle email digest",
    "highlight reader",
    "book quotes reminder",
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
        "Automatic Open Library cover matching",
        "Custom email routine (Morning, Midday, Evening)",
        "Spaced repetition daily review room",
        "Distraction-free typography reader",
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
          name: "What is Reado?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Reado is a reading memory engine (similar to Readwise) that helps you remember what you read by importing book highlights from Kindle or CSV and resurfacing them in a daily review room and scheduled email digests.",
          },
        },
        {
          "@type": "Question",
          name: "How does Reado's pricing work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Reado offers a free preview for up to 5 highlights. To unlock unlimited highlights and lifetime reading memory, you can purchase the one-time $49 Founder Pass. There are no recurring monthly subscriptions.",
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
