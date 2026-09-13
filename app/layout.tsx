import type { Metadata } from "next";
import { Providers } from "./providers";
import "@/styles.css";

export const metadata: Metadata = {
  title: "Reado — distraction-free reading and highlights",
  description: "A quiet reader for long-form text, with imported book highlights and a periodic review digest.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="velvet">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=Newsreader:ital,opsz,wght@0,6..72,300..500;1,6..72,300..500&family=Inter:wght@400;500;600&display=swap" />
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
