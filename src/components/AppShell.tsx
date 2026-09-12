import { useState, type ReactNode } from "react";
import { Link } from "@/lib/next-router-compat";
import { usePathname, useRouter } from "next/navigation";

import logoAsset from "@/assets/reado-mark.png.asset.json";
import { Spinner } from "@/components/Spinner";
import { TypeControls } from "@/components/TypeControls";
import type { ReaderPrefs } from "@/hooks/useReaderPrefs";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  prefs: ReaderPrefs;
  update: (patch: Partial<ReaderPrefs>) => void;
  children: ReactNode;
  focus?: boolean;
  eyebrow?: string;
}

const NAV = [
  { to: "/review", label: "Review" },
  { to: "/books", label: "Books" },
  { to: "/import", label: "Import" },
  { to: "/settings", label: "Settings" },
] as const;

export function AppShell({ prefs, update, children, focus = false }: Props) {
  const [typeOpen, setTypeOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useRouter();
  const pathname = usePathname();
  const navigating = false;
  const width = { maxWidth: `${prefs.measure + 8}ch` };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!focus && (
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 items-center gap-5 px-5" style={width}>
            <Link to="/review" className="group flex shrink-0 items-center gap-2">
              <img
                src={logoAsset.url}
                alt="Reado"
                className="h-6 w-6 object-contain transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                width={24}
                height={24}
              />
              <span className="font-display text-lg font-semibold tracking-tight">Reado</span>
            </Link>
            <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
              {NAV.map((item) => {
                const active = pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    href={item.to}
                    className={`nav-link ${active ? "is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="relative flex shrink-0 items-center gap-2">
              {navigating && <Spinner className="h-3.5 w-3.5" label="Loading page" />}
              <button
                className="chrome-btn"
                onClick={() => setTypeOpen((open) => !open)}
                aria-expanded={typeOpen}
              >
                Aa
              </button>
              <button
                className="chrome-btn"
                onClick={async () => {
                  await signOut();
                  navigate.replace("/auth");
                }}
              >
                Sign out
              </button>
              {typeOpen && (
                <div className="pop-in absolute right-0 top-11 z-30">
                  <TypeControls prefs={prefs} update={update} />
                </div>
              )}
            </div>
          </div>
        </header>
      )}
      <main key={pathname} className="page-enter mx-auto px-5" style={width}>
        {children}
      </main>
    </div>
  );
}
