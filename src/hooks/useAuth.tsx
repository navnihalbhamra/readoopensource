import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useAuth as useClerkAuth, useClerk, useUser } from "@clerk/nextjs";

interface AuthState {
  session: { userId: string } | null;
  user: ReturnType<typeof useUser>["user"];
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { getToken, isLoaded, isSignedIn, userId } = useClerkAuth();
  const { user } = useUser();
  const clerk = useClerk();

  // Sync Clerk emails into the profile at most once per signed-in user per tab.
  // Repeating this on every mount/render hits Clerk's rate limit (429).
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) return;
    if (syncedFor.current === userId) return;
    const storageKey = `reado:clerk-sync:${userId}`;
    if (typeof window !== "undefined" && window.sessionStorage.getItem(storageKey) === "1") {
      syncedFor.current = userId;
      return;
    }
    syncedFor.current = userId;
    if (typeof window !== "undefined") window.sessionStorage.setItem(storageKey, "1");
  }, [isLoaded, isSignedIn, userId]);

  return (
    <AuthContext.Provider
      value={{
        session: isSignedIn && userId ? { userId } : null,
        user,
        loading: !isLoaded,
        signOut: () => clerk.signOut(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
