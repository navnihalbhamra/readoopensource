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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}