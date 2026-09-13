"use client";

/**
 * Minimal client-side data cache — a dependency-free query/mutation layer.
 * Implements exactly what the app uses:
 *
 * - `useQuery({ queryKey, queryFn })` → `{ data, error, isLoading, isFetching, refetch }`
 * - `useMutation({ mutationFn, onSuccess, onError })` → `{ mutate, isPending }`
 * - `useQueryClient().invalidateQueries({ queryKey })` → prefix-matched,
 *   awaitable invalidation that refetches active entries and marks the rest
 *   stale for their next mount.
 *
 * Entries live in a module-level store read through `useSyncExternalStore`,
 * with a 15s staleness window, in-flight de-duplication and no fetching during
 * SSR (hydration renders the same "loading" state the server produced).
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type QueryKey = readonly unknown[];

interface CacheEntry {
  key: QueryKey;
  /** Latest queryFn, kept by the mounted observer so invalidation can refetch. */
  queryFn: (() => Promise<unknown>) | null;
  data: unknown;
  hasData: boolean;
  error: Error | null;
  fetching: boolean;
  started: boolean;
  fetchedAt: number;
  version: number;
  listeners: Set<() => void>;
}

const STALE_TIME_MS = 15_000;

const cache = new Map<string, CacheEntry>();

function entryId(key: QueryKey): string {
  return JSON.stringify(key);
}

function getEntry(key: QueryKey): CacheEntry {
  const id = entryId(key);
  let entry = cache.get(id);
  if (!entry) {
    entry = {
      key,
      queryFn: null,
      data: undefined,
      hasData: false,
      error: null,
      fetching: false,
      started: false,
      fetchedAt: 0,
      version: 0,
      listeners: new Set(),
    };
    cache.set(id, entry);
  }
  return entry;
}

function publish(entry: CacheEntry) {
  entry.version += 1;
  for (const listener of [...entry.listeners]) listener();
}

function fetchEntry(entry: CacheEntry, queryFn: () => Promise<unknown>): Promise<void> {
  return new Promise<void>((resolve) => {
    entry.fetching = true;
    publish(entry);
    Promise.resolve()
      .then(queryFn)
      .then((data) => {
        entry.data = data;
        entry.hasData = true;
        entry.error = null;
        entry.started = true;
        entry.fetchedAt = Date.now();
      })
      .catch((cause: unknown) => {
        // Existing data (if any) is kept so the UI never flashes empty.
        entry.error = cause instanceof Error ? cause : new Error(String(cause));
        entry.started = true;
      })
      .finally(() => {
        entry.fetching = false;
        publish(entry);
        resolve();
      });
  });
}

function matchesPrefix(key: QueryKey, prefix: QueryKey): boolean {
  return prefix.every((part, index) => key[index] === part);
}

export interface QueryResult<TData> {
  data: TData | undefined;
  error: Error | null;
  /** True only for the very first load — background refetches keep old data. */
  isLoading: boolean;
  /** True while any fetch (initial, refetch or invalidation) is in flight. */
  isFetching: boolean;
  refetch: () => void;
}

export function useQuery<TData = unknown>(options: {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
}): QueryResult<TData> {
  const { queryKey, queryFn } = options;
  const entry = getEntry(queryKey);

  // Re-render on every published change; the version number is the snapshot.
  useSyncExternalStore(
    (onStoreChange) => {
      entry.listeners.add(onStoreChange);
      return () => {
        entry.listeners.delete(onStoreChange);
      };
    },
    () => entry.version,
    () => 0,
  );

  // Keep the latest queryFn without retriggering the mount effect.
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;

  useEffect(() => {
    entry.queryFn = () => queryFnRef.current();
    const stale = Date.now() - entry.fetchedAt > STALE_TIME_MS;
    if (!entry.started || entry.error || stale) {
      void fetchEntry(entry, entry.queryFn);
    }
  }, [entry]);

  const refetch = useCallback(() => {
    void fetchEntry(entry, () => queryFnRef.current());
  }, [entry]);

  return {
    data: entry.hasData ? (entry.data as TData) : undefined,
    error: entry.error,
    isLoading: !entry.hasData && entry.fetching,
    isFetching: entry.fetching,
    refetch,
  };
}

export interface MutationResult<TData, TVars> {
  mutate: (variables: TVars) => void;
  isPending: boolean;
}

export function useMutation<TData = unknown, TVars = unknown>(options: {
  mutationFn: (variables: TVars) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVars) => unknown;
  onError?: (error: Error, variables: TVars) => void;
}): MutationResult<TData, TVars> {
  const [isPending, setIsPending] = useState(false);

  // `mutate` stays referentially stable; options are read at call time.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const mutate = useCallback((variables: TVars) => {
    const current = optionsRef.current;
    setIsPending(true);
    void Promise.resolve()
      .then(() => current.mutationFn(variables))
      .then(async (data) => {
        // Awaited so callers can sequence invalidations before navigating.
        await current.onSuccess?.(data, variables);
      })
      .catch((cause: unknown) => {
        const error = cause instanceof Error ? cause : new Error(String(cause));
        current.onError?.(error, variables);
      })
      .finally(() => setIsPending(false));
  }, []);

  return { mutate, isPending };
}

export interface QueryClientApi {
  invalidateQueries(options: { queryKey: QueryKey }): Promise<void>;
}

const queryClientApi: QueryClientApi = {
  invalidateQueries({ queryKey }) {
    const jobs: Promise<void>[] = [];
    for (const entry of cache.values()) {
      if (!matchesPrefix(entry.key, queryKey) || !entry.started || !entry.queryFn) continue;
      entry.fetchedAt = 0; // also stale for any future remount
      if (entry.listeners.size > 0) {
        jobs.push(fetchEntry(entry, entry.queryFn));
      }
    }
    return Promise.all(jobs).then(() => undefined);
  },
};

export function useQueryClient(): QueryClientApi {
  return queryClientApi;
}
