(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/nextjs/dist/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAuth.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$clerk$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/clerk-config.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$nextjs$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["ClerkProvider"], {
        appearance: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$clerk$2d$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clerkAppearance"],
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
                children: children
            }, void 0, false, {
                fileName: "[project]/app/providers.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toaster"], {
                position: "bottom-center"
            }, void 0, false, {
                fileName: "[project]/app/providers.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/providers.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/useAuth.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$66XwX3F0$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__x__as__useAuth$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/react/dist/hooks-66XwX3F0.mjs [app-client] (ecmascript) <locals> <export x as useAuth>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useClerk__as__s$3e$__$3c$export__s__as__useClerk$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/shared/dist/react/index.mjs [app-client] (ecmascript) <export useClerk as s> <export s as useClerk>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useUser__as__g$3e$__$3c$export__g__as__useUser$3e$__ = __turbopack_context__.i("[project]/node_modules/@clerk/shared/dist/react/index.mjs [app-client] (ecmascript) <export useUser as g> <export g as useUser>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    session: null,
    user: null,
    loading: true,
    signOut: async ()=>{}
});
function AuthProvider({ children }) {
    _s();
    const { getToken, isLoaded, isSignedIn, userId } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$66XwX3F0$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__x__as__useAuth$3e$__["useAuth"])();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useUser__as__g$3e$__$3c$export__g__as__useUser$3e$__["useUser"])();
    const clerk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useClerk__as__s$3e$__$3c$export__s__as__useClerk$3e$__["useClerk"])();
    // Sync Clerk emails into the profile at most once per signed-in user per tab.
    // Repeating this on every mount/render hits Clerk's rate limit (429).
    const syncedFor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            if (!isLoaded || !isSignedIn || !userId) return;
            if (syncedFor.current === userId) return;
            const storageKey = `reado:clerk-sync:${userId}`;
            if (("TURBOPACK compile-time value", "object") !== "undefined" && window.sessionStorage.getItem(storageKey) === "1") {
                syncedFor.current = userId;
                return;
            }
            syncedFor.current = userId;
            if ("TURBOPACK compile-time truthy", 1) window.sessionStorage.setItem(storageKey, "1");
        }
    }["AuthProvider.useEffect"], [
        isLoaded,
        isSignedIn,
        userId
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            session: isSignedIn && userId ? {
                userId
            } : null,
            user,
            loading: !isLoaded,
            signOut: ()=>clerk.signOut()
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/hooks/useAuth.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "KkjtSB9vj/XvMzFKI7mYsWm2yEI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$react$2f$dist$2f$hooks$2d$66XwX3F0$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__$3c$export__x__as__useAuth$3e$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useUser__as__g$3e$__$3c$export__g__as__useUser$3e$__["useUser"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$clerk$2f$shared$2f$dist$2f$react$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__useClerk__as__s$3e$__$3c$export__s__as__useClerk$3e$__["useClerk"]
    ];
});
_c = AuthProvider;
function useAuth() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
}
_s1(useAuth, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/clerk-config.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clerkAppearance",
    ()=>clerkAppearance,
    "clerkPublishableKey",
    ()=>clerkPublishableKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const clerkPublishableKey = ("TURBOPACK compile-time value", "pk_live_Y2xlcmsucmVhZG8ubG9sJA");
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
;
const clerkAppearance = {
    variables: {
        colorPrimary: "#f5f5f5",
        colorText: "#f5f5f5",
        colorTextSecondary: "#a3a3a3",
        colorBackground: "#0b0b0b",
        colorInputBackground: "#151515",
        colorInputText: "#f5f5f5",
        colorNeutral: "#a3a3a3",
        borderRadius: "0.625rem",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
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
        formFieldAction: "text-muted-foreground hover:text-foreground"
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0atga0r._.js.map