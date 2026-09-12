/** POST /api/public/checkout — create a Polar checkout session */
import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@clerk/tanstack-react-start/server";
import { createCheckoutSession } from "@/lib/polar.server";
import { z } from "zod";

const checkoutSchema = z.object({
  productId: z.string().min(1),
  successUrl: z.string().optional(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/public/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Verify user is authenticated with Clerk
          const { isAuthenticated, userId } = await auth();
          if (!isAuthenticated || !userId) {
            return json({ error: "Unauthorized" }, 401);
          }

          // Parse and validate request body
          let body: unknown;
          try {
            body = await request.json();
          } catch {
            return json({ error: "Invalid JSON" }, 400);
          }

          const parsed = checkoutSchema.safeParse(body);
          if (!parsed.success) {
            return json({ error: "Invalid request", details: parsed.error.flatten() }, 400);
          }

          const { productId, successUrl } = parsed.data;

          // Create checkout session with Polar
          const session = await createCheckoutSession(productId, successUrl);

          return json({
            success: true,
            checkoutUrl: session.url,
            checkoutId: session.id,
            userId,
          });
        } catch (error) {
          console.error("Checkout creation failed:", error);
          return json(
            {
              error: error instanceof Error ? error.message : "Failed to create checkout",
            },
            500,
          );
        }
      },
    },
  },
});
