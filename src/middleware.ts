import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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

// Until Clerk keys are configured there is nothing to authenticate against;
// invoking `auth.protect()` in that state would 500 every protected page.
const clerkConfigured = Boolean(
  process.env["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"] || process.env["CLERK_PUBLISHABLE_KEY"],
);

export default clerkMiddleware(async (auth, req) => {
  if (!clerkConfigured) return;
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
