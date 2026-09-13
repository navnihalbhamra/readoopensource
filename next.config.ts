import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "covers.openlibrary.org" },
      { protocol: "https", hostname: "books.google.com" },
    ],
  },
  experimental: {
    // Imported book files and pasted content can be a few MB — keep the
    // generic RPC server action able to receive them.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
