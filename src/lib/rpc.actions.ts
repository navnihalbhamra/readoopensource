"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { serverFunctions as clerkFunctions } from "@/lib/clerk.functions";
import { serverFunctions as focusFunctions } from "@/lib/focus.functions";
import type { RpcContext, RpcRegistry } from "@/lib/rpc";

const registry: RpcRegistry = {
  ...focusFunctions,
  ...clerkFunctions,
};

/**
 * Generic server-action dispatcher for the app's RPC layer.
 *
 * Replaces TanStack's `createServerFn` transport: the client-side
 * `useServerFn(fn)` shim posts `(fn.name, data)` here, Clerk resolves the
 * signed-in user, and the matched handler runs with a server-only Supabase
 * client. Every handler enforces the same "must be authenticated" boundary
 * the old middleware did.
 */
export async function rpc(name: string, data?: unknown) {
  let userId: string | null;
  let sessionClaims: Record<string, unknown> | undefined;
  try {
    const authResult = await auth();
    userId = authResult.userId;
    sessionClaims = authResult.sessionClaims ?? {};
  } catch {
    throw new Error("Unauthorized");
  }
  if (!userId) throw new Error("Unauthorized");

  const def = registry[name];
  if (!def) throw new Error(`Unknown server function: ${name}`);

  const payload = def.validator ? def.validator(data) : data;
  const context: RpcContext = { userId, claims: sessionClaims, supabase: supabaseAdmin };
  return def.handler(context, payload);
}
