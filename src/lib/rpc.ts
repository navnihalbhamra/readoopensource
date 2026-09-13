import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

/** Server-scoped Supabase client (service role, bypasses RLS). */
export type ServerSupabase = SupabaseClient<Database>;

/** Context handed to every RPC handler by the server action. */
export interface RpcContext {
  userId: string;
  claims: Record<string, unknown>;
  supabase: ServerSupabase;
}

export interface RpcFnDef<TData = unknown, TResult = unknown> {
  /** Informational only — every call is a POST to the RPC action. */
  method?: "GET" | "POST";
  /** Optional Zod (or any) validator; receives the raw payload data. */
  validator?: (data: unknown) => TData;
  /**
   * Declared with method syntax so heterogeneous handler definitions stay
   * assignable under `satisfies RpcRegistry` (methods bivariantly check their
   * parameter types, unlike plain function properties under strict mode).
   */
  handler(context: RpcContext, data: TData): Promise<TResult>;
}

export type RpcRegistry = Record<string, RpcFnDef<unknown, unknown>>;
