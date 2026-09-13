// Next.js Server Actions don't need a wrapper — this file is kept for compatibility.
export function useServerFn<T extends (...args: any[]) => any>(fn: T): T {
  return fn;
}
