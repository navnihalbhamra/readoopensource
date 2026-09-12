"use client";

import NextLink from "next/link";
import { useParams as useNextParams, usePathname, useRouter as useNextRouter } from "next/navigation";
import type { ReactNode } from "react";

type RouteOptions = { component?: () => ReactNode } & Record<string, unknown>;

export function createFileRoute(_path: string) {
  return (options: RouteOptions) => ({ options, useParams });
}

export function Link({ to, href, params, children, ...props }: { to?: string; href?: string; params?: Record<string, string>; children: ReactNode; [key: string]: any }) {
  const target = Object.entries(params ?? {}).reduce((path, [key, value]) => path.replace(`$${key}`, value), href ?? to ?? "#");
  return <NextLink href={target} {...props}>{children}</NextLink>;
}

export function useNavigate() {
  const router = useNextRouter();
  return ({ to, replace = false, search }: { to: string; replace?: boolean; search?: Record<string, string> }) => {
    const query = search ? `?${new URLSearchParams(search).toString()}` : "";
    if (replace) router.replace(`${to}${query}`);
    else router.push(`${to}${query}`);
  };
}

export function useParams() {
  return useNextParams<Record<string, string>>();
}

export function useSearch() {
  if (typeof window === "undefined") return {};
  return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}

export function useRouter() {
  const router = useNextRouter();
  return { ...router, invalidate: () => router.refresh() };
}

export { usePathname };