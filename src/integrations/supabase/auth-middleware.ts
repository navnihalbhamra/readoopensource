import { createMiddleware } from "@tanstack/react-start";
import { auth } from "@clerk/tanstack-react-start/server";

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { userId, sessionClaims } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return next({
      context: {
        supabase: supabaseAdmin,
        userId,
        claims: sessionClaims ?? {},
      },
    });
  },
);
