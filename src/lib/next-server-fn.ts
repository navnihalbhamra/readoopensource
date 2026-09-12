export function useServerFn(fn: (...args: any[]) => any): any {
  return fn;
}

type ServerFnInput = { data?: unknown } | undefined;
type ServerFnHandler<T> = (args: { data: any; context: any }) => Promise<T> | T;

export function createServerFn(_options?: { method?: string }) {
  let validator: ((data: any) => any) | undefined;

  const builder = {
    middleware(_middleware: unknown[]) {
      return builder;
    },
    inputValidator(nextValidator: (data: any) => any) {
      validator = nextValidator;
      return builder;
    },
    handler<T>(handler: ServerFnHandler<T>) {
      return async (input?: ServerFnInput) => {
        const loadAuthMiddleware = new Function("return import('@/integrations/supabase/auth-middleware')") as () => Promise<typeof import("@/integrations/supabase/auth-middleware")>;
        const { requireSupabaseAuth } = await loadAuthMiddleware();
        const context = await requireSupabaseAuth();
        const rawData = input && typeof input === "object" && "data" in input ? input.data : input;
        const data = validator ? validator(rawData) : rawData;
        return handler({ data, context });
      };
    },
  };

  return builder;
}
