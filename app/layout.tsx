import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import "../src/styles.css";

export const metadata: Metadata = {
  title: "Reado — distraction-free reading and highlights",
  description:
    "A quiet reader for long-form text, with imported book highlights and a periodic review digest.",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="velvet">
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
