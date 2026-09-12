import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";
import { clerkMiddleware } from "@clerk/tanstack-react-start/server";

import { renderErrorPage } from "./lib/error-page";
import { clerkPublishableKey } from "@/lib/clerk-config";

const errorMiddleware = createMiddleware().server(async ({ next, request }) => {
  // Lovable email routes authenticate themselves; keep them out of app guards.
  if (new URL(request.url).pathname.startsWith("/lovable/")) return next();
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) =>
    ctx.handlerType === "serverFn" &&
    !new URL(ctx.request.url).pathname.startsWith("/lovable/"),
});

export const startInstance = createStart(() => ({
  functionMiddleware: [],
  requestMiddleware: [clerkMiddleware({ publishableKey: clerkPublishableKey }), errorMiddleware, csrfMiddleware],
}));
