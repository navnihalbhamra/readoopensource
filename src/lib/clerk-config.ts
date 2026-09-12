const clerkPublishableKey = process.env["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"];

if (!clerkPublishableKey) {
  throw new Error("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. Add the Clerk publishable key to the environment.");
}

export { clerkPublishableKey };

export const clerkAppearance = {
  variables: {
    colorPrimary: "#f5f5f5",
    colorText: "#f5f5f5",
    colorTextSecondary: "#a3a3a3",
    colorBackground: "#0b0b0b",
    colorInputBackground: "#151515",
    colorInputText: "#f5f5f5",
    colorNeutral: "#a3a3a3",
    borderRadius: "0.625rem",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    card: "bg-transparent shadow-none w-full p-0",
    headerTitle: "font-display text-2xl font-semibold tracking-tight",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton: "border-border bg-surface text-foreground hover:bg-inkwash transition-colors",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground",
    formFieldLabel: "text-foreground text-sm",
    formFieldInput: "border-border bg-surface text-foreground placeholder:text-muted-foreground focus:border-foreground focus:ring-foreground/20",
    formButtonPrimary: "bg-primary text-primary-foreground hover:opacity-90 transition-opacity",
    footerActionText: "text-muted-foreground",
    footerActionLink: "text-foreground hover:text-accent",
    identityPreviewEditButton: "text-foreground hover:text-accent",
    formFieldAction: "text-muted-foreground hover:text-foreground",
  },
} as const;
