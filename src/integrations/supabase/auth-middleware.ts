export async function requireSupabaseAuth() {
  const loadAuth = new Function("return import('@clerk/nextjs/server')") as () => Promise<typeof import("@clerk/nextjs/server")>;
  const { auth } = await loadAuth();
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return {
    supabase: supabaseAdmin,
    userId,
    claims: sessionClaims ?? {},
  };
}
