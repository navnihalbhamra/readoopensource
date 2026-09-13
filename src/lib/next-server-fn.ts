"use client";

import { rpc } from "@/lib/rpc.actions";
// Type-only imports: the handler signatures flow into the client's types while
// the server modules themselves are never bundled client-side.
import type { serverFunctions as focusFunctions } from "@/lib/focus.functions";
import type { serverFunctions as clerkFunctions } from "@/lib/clerk.functions";

type RpcOptions = { data?: unknown };

type AllServerFns = typeof focusFunctions & typeof clerkFunctions;
export type ServerFnName = keyof AllServerFns & string;

type ServerFnCallable<K extends ServerFnName> = (
  ...args: unknown[]
) => Promise<Awaited<ReturnType<AllServerFns[K]["handler"]>>>;

/**
 * Client-side bridge for the RPC layer.
 *
 * Accepts the name of a registered server function and returns a callable that
 * posts the payload to the `rpc` server action.
 * The callable is deliberately permissive about its arguments: react-query
 * invokes query functions with a context object, while mutation call sites
 * pass `{ data }` — only the `data` field is ever forwarded to the server.
 * The return type is inferred from the server handler, preserving the
 * end-to-end typing the old `createServerFn` pipeline provided.
 */
export function useServerFn<K extends ServerFnName>(name: K): ServerFnCallable<K> {
  return (async (...args: unknown[]) => {
    const opts = args[0] as RpcOptions | undefined;
    const data = opts && typeof opts === "object" && "data" in opts ? opts.data : undefined;
    return rpc(name, data);
  }) as ServerFnCallable<K>;
}
