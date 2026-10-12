import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/review(.*)",
  "/books(.*)",
  "/book(.*)",
  "/highlights(.*)",
  "/import(.*)",
  "/settings(.*)",
  "/onboarding(.*)",
  "/read(.*)",
]);

export default clerkMiddleware(
  async (auth, req) => {
    const clerkConfigured = Boolean(
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY
    );

    if (!clerkConfigured) {
      return NextResponse.next();
    }

    if (isProtectedRoute(req)) {
      const session = await auth();
      if (!session.userId) {
        return session.redirectToSignIn();
      }
    }

    return NextResponse.next();
  },
  {
    signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in",
    signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up",
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
