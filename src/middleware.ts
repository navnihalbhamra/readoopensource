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

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
