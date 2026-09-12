import Link from "next/link";

export default function NotFound() {
  return <div className="flex min-h-screen items-center justify-center bg-background px-6"><div className="max-w-md text-center"><p className="eyebrow">Nothing here</p><h1 className="mt-3 font-display text-3xl font-semibold">This page isn&apos;t in your library</h1><p className="mt-2 text-sm text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p><Link href="/" className="brass-btn mt-6">Back to library</Link></div></div>;
}