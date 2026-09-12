module.exports = [
"[project]/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$routes$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/routes/index.tsx [app-ssr] (ecmascript)");
"use client";
;
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$routes$2f$index$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Landing"];
}),
"[project]/src/assets/reado-lockup.png.asset.json.[json].cjs [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "version": 1,
    "asset_id": "5a4b49d1-800f-40df-bd68-df7793b2e612",
    "project_id": "233849ac-4e0b-4791-85bf-847c7a09f92b",
    "url": "/__l5e/assets-v1/5a4b49d1-800f-40df-bd68-df7793b2e612/reado-lockup.png",
    "r2_key": "a/v1/233849ac-4e0b-4791-85bf-847c7a09f92b/5a4b49d1-800f-40df-bd68-df7793b2e612/reado-lockup.png",
    "original_filename": "reado-lockup.png",
    "size": 112706,
    "content_type": "image/png",
    "created_at": "2026-09-01T10:35:18Z"
};
}),
"[project]/src/components/Reveal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Reveal",
    ()=>Reveal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
function Reveal({ children, className = "", delay = 0, onScroll = false }) {
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!onScroll) {
            const frame = requestAnimationFrame(()=>setVisible(true));
            return ()=>cancelAnimationFrame(frame);
        }
        const node = ref.current;
        if (!node || typeof IntersectionObserver === "undefined") {
            setVisible(true);
            return;
        }
        const observer = new IntersectionObserver((entries)=>{
            if (entries.some((entry)=>entry.isIntersecting)) {
                setVisible(true);
                observer.disconnect();
            }
        }, {
            rootMargin: "0px 0px -8% 0px",
            threshold: 0.05
        });
        observer.observe(node);
        return ()=>observer.disconnect();
    }, [
        onScroll
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        style: delay ? {
            transitionDelay: `${delay}ms`
        } : undefined,
        className: `reveal ${visible ? "is-visible" : ""} ${className}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/Reveal.tsx",
        lineNumber: 40,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/next-router-compat.tsx [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Link",
    ()=>Link,
    "createFileRoute",
    ()=>createFileRoute,
    "useNavigate",
    ()=>useNavigate,
    "useParams",
    ()=>useParams,
    "useRouter",
    ()=>useRouter,
    "useSearch",
    ()=>useSearch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
;
function createFileRoute(_path) {
    return (options)=>({
            options,
            useParams
        });
}
function Link({ to, href, params, children, ...props }) {
    const target = Object.entries(params ?? {}).reduce((path, [key, value])=>path.replace(`$${key}`, value), href ?? to ?? "#");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        href: target,
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/lib/next-router-compat.tsx",
        lineNumber: 15,
        columnNumber: 10
    }, this);
}
function useNavigate() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    return ({ to, replace = false, search })=>{
        const query = search ? `?${new URLSearchParams(search).toString()}` : "";
        if (replace) router.replace(`${to}${query}`);
        else router.push(`${to}${query}`);
    };
}
function useParams() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
}
function useSearch() {
    if ("TURBOPACK compile-time truthy", 1) return {};
    //TURBOPACK unreachable
    ;
}
function useRouter() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    return {
        ...router,
        invalidate: ()=>router.refresh()
    };
}
;
}),
"[project]/src/routes/index.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Landing",
    ()=>Landing,
    "Route",
    ()=>Route
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$next$2d$router$2d$compat$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/next-router-compat.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$reado$2d$lockup$2e$png$2e$asset$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/assets/reado-lockup.png.asset.json.[json].cjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Reveal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Reveal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAuth.tsx [app-ssr] (ecmascript)");
;
;
;
;
;
;
const Route = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$next$2d$router$2d$compat$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createFileRoute"])("/")({
    head: ()=>({
            meta: [
                {
                    title: "Reado — remember every book you read"
                },
                {
                    name: "description",
                    content: "Import your Kindle and book highlights, read distraction-free, and get a handful of your best passages back by email every day."
                },
                {
                    property: "og:title",
                    content: "Reado — remember every book you read"
                },
                {
                    property: "og:description",
                    content: "Import highlights, review five a day, and actually remember what you read. Black-and-white, no clutter."
                },
                {
                    property: "og:type",
                    content: "website"
                },
                {
                    name: "twitter:card",
                    content: "summary_large_image"
                }
            ]
        }),
    component: Landing
});
const STEPS = [
    [
        "01",
        "Import in seconds",
        "Drop in a Kindle My Clippings file, a CSV export, or just paste quotes. Reado splits them into clean, separate highlights."
    ],
    [
        "02",
        "Books wire themselves up",
        "Every highlight is matched to its book — cover art, author and publication year found automatically."
    ],
    [
        "03",
        "Review five a day",
        "A quiet daily review resurfaces a handful of passages, and an email digest brings them to your inbox on your schedule."
    ]
];
const FEATURES = [
    [
        "Distraction-free reader",
        "No sidebars, no badges. Adjustable type size, line height, measure and three reading themes."
    ],
    [
        "Highlight anything",
        "Select text while reading and it's saved as a highlight, linked to the document forever."
    ],
    [
        "Your own API",
        "A personal endpoint so other tools can push highlights into Reado programmatically."
    ],
    [
        "Email digests",
        "Daily or weekly review emails, styled like the app — plain, typographic, calm."
    ]
];
function Landing() {
    const { session, loading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const primaryTo = session ? "/review" : "/auth";
    const primaryLabel = session ? "Open your review" : "Start free";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-background text-foreground",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto flex h-14 max-w-5xl items-center justify-between gap-6 px-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$next$2d$router$2d$compat$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Link"], {
                            to: "/",
                            className: "flex shrink-0 items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$assets$2f$reado$2d$lockup$2e$png$2e$asset$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].url,
                                    alt: "Reado",
                                    className: "h-6 w-auto object-contain"
                                }, void 0, false, {
                                    fileName: "[project]/src/routes/index.tsx",
                                    lineNumber: 10,
                                    columnNumber: 479
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-display text-lg font-semibold tracking-tight",
                                    children: "Reado"
                                }, void 0, false, {
                                    fileName: "[project]/src/routes/index.tsx",
                                    lineNumber: 10,
                                    columnNumber: 556
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/routes/index.tsx",
                            lineNumber: 10,
                            columnNumber: 421
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: !loading && session ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$next$2d$router$2d$compat$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Link"], {
                                        to: "/pricing",
                                        className: "chrome-btn",
                                        children: "Plans"
                                    }, void 0, false, {
                                        fileName: "[project]/src/routes/index.tsx",
                                        lineNumber: 10,
                                        columnNumber: 709
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$next$2d$router$2d$compat$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Link"], {
                                        to: "/review",
                                        className: "brass-btn",
                                        children: "Open Reado"
                                    }, void 0, false, {
                                        fileName: "[project]/src/routes/index.tsx",
                                        lineNumber: 10,
                                        columnNumber: 764
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/routes/index.tsx",
                                lineNumber: 10,
                                columnNumber: 707
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$next$2d$router$2d$compat$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Link"], {
                                        to: "/pricing",
                                        className: "chrome-btn",
                                        children: "Plans"
                                    }, void 0, false, {
                                        fileName: "[project]/src/routes/index.tsx",
                                        lineNumber: 10,
                                        columnNumber: 830
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$next$2d$router$2d$compat$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Link"], {
                                        to: "/auth",
                                        className: "chrome-btn",
                                        children: "Sign in"
                                    }, void 0, false, {
                                        fileName: "[project]/src/routes/index.tsx",
                                        lineNumber: 10,
                                        columnNumber: 885
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$next$2d$router$2d$compat$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Link"], {
                                        to: "/auth",
                                        className: "brass-btn",
                                        children: "Start free"
                                    }, void 0, false, {
                                        fileName: "[project]/src/routes/index.tsx",
                                        lineNumber: 10,
                                        columnNumber: 939
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/routes/index.tsx",
                                lineNumber: 10,
                                columnNumber: 828
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/routes/index.tsx",
                            lineNumber: 10,
                            columnNumber: 643
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/routes/index.tsx",
                    lineNumber: 10,
                    columnNumber: 336
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/routes/index.tsx",
                lineNumber: 10,
                columnNumber: 244
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Reveal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Reveal"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "mx-auto max-w-3xl px-5 pb-16 pt-20 text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "eyebrow",
                                    children: "Highlights · Reader · Daily review"
                                }, void 0, false, {
                                    fileName: "[project]/src/routes/index.tsx",
                                    lineNumber: 10,
                                    columnNumber: 1102
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "mx-auto mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl",
                                    children: "You read a lot. Remember it this time."
                                }, void 0, false, {
                                    fileName: "[project]/src/routes/index.tsx",
                                    lineNumber: 10,
                                    columnNumber: 1163
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mx-auto mt-5 max-w-xl font-body text-lg leading-relaxed text-muted-foreground",
                                    children: "Reado keeps every passage you highlight, files it under the right book, and hands a few of them back to you each day — in a black-and-white room with nothing else in it."
                                }, void 0, false, {
                                    fileName: "[project]/src/routes/index.tsx",
                                    lineNumber: 10,
                                    columnNumber: 1336
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-8 flex flex-wrap items-center justify-center gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$next$2d$router$2d$compat$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Link"], {
                                            to: primaryTo,
                                            className: "brass-btn px-5 py-3 text-[13px]",
                                            children: primaryLabel
                                        }, void 0, false, {
                                            fileName: "[project]/src/routes/index.tsx",
                                            lineNumber: 10,
                                            columnNumber: 1673
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$next$2d$router$2d$compat$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Link"], {
                                            to: "/pricing",
                                            className: "chrome-btn px-5 py-3 text-[13px]",
                                            children: "View plans"
                                        }, void 0, false, {
                                            fileName: "[project]/src/routes/index.tsx",
                                            lineNumber: 10,
                                            columnNumber: 1759
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/routes/index.tsx",
                                    lineNumber: 10,
                                    columnNumber: 1602
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80",
                                    children: "Free to start · No credit card · Import in one click"
                                }, void 0, false, {
                                    fileName: "[project]/src/routes/index.tsx",
                                    lineNumber: 10,
                                    columnNumber: 1847
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("figure", {
                                    className: "mt-14 rounded-xl border border-border bg-surface/60 p-8 text-left",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("blockquote", {
                                            className: "font-body text-xl italic leading-relaxed text-foreground/90",
                                            children: "“Attention is the rarest and purest form of generosity.”"
                                        }, void 0, false, {
                                            fileName: "[project]/src/routes/index.tsx",
                                            lineNumber: 10,
                                            columnNumber: 2074
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("figcaption", {
                                            className: "mt-4 border-t border-border/70 pt-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground",
                                            children: "The Lantern Room · Marguerite Halloway · p. 88"
                                        }, void 0, false, {
                                            fileName: "[project]/src/routes/index.tsx",
                                            lineNumber: 10,
                                            columnNumber: 2227
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/routes/index.tsx",
                                    lineNumber: 10,
                                    columnNumber: 1988
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/routes/index.tsx",
                            lineNumber: 10,
                            columnNumber: 1034
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/routes/index.tsx",
                        lineNumber: 10,
                        columnNumber: 1026
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Reveal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Reveal"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "mx-auto max-w-5xl px-5 pb-20",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "font-display text-2xl font-semibold tracking-tight",
                                    children: "How it works"
                                }, void 0, false, {
                                    fileName: "[project]/src/routes/index.tsx",
                                    lineNumber: 10,
                                    columnNumber: 2494
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
                                    className: "mt-6 grid gap-4 sm:grid-cols-3",
                                    children: STEPS.map(([step, title, body])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            className: "rounded-xl border border-border bg-surface/50 p-5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "eyebrow",
                                                    children: step
                                                }, void 0, false, {
                                                    fileName: "[project]/src/routes/index.tsx",
                                                    lineNumber: 10,
                                                    columnNumber: 2738
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "mt-3 font-display text-base font-semibold tracking-tight",
                                                    children: title
                                                }, void 0, false, {
                                                    fileName: "[project]/src/routes/index.tsx",
                                                    lineNumber: 10,
                                                    columnNumber: 2771
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-2 font-body text-[14px] leading-relaxed text-muted-foreground",
                                                    children: body
                                                }, void 0, false, {
                                                    fileName: "[project]/src/routes/index.tsx",
                                                    lineNumber: 10,
                                                    columnNumber: 2856
                                                }, this)
                                            ]
                                        }, step, true, {
                                            fileName: "[project]/src/routes/index.tsx",
                                            lineNumber: 10,
                                            columnNumber: 2661
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/routes/index.tsx",
                                    lineNumber: 10,
                                    columnNumber: 2578
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/routes/index.tsx",
                            lineNumber: 10,
                            columnNumber: 2444
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/routes/index.tsx",
                        lineNumber: 10,
                        columnNumber: 2436
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Reveal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Reveal"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "mx-auto max-w-5xl px-5 pb-20",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "font-display text-2xl font-semibold tracking-tight",
                                    children: "Everything, nothing more"
                                }, void 0, false, {
                                    fileName: "[project]/src/routes/index.tsx",
                                    lineNumber: 10,
                                    columnNumber: 3035
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "mt-6 grid gap-4 sm:grid-cols-2",
                                    children: FEATURES.map(([title, body])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            className: "rounded-xl border border-border p-5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "font-display text-base font-semibold tracking-tight",
                                                    children: title
                                                }, void 0, false, {
                                                    fileName: "[project]/src/routes/index.tsx",
                                                    lineNumber: 10,
                                                    columnNumber: 3275
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-2 font-body text-[14px] leading-relaxed text-muted-foreground",
                                                    children: body
                                                }, void 0, false, {
                                                    fileName: "[project]/src/routes/index.tsx",
                                                    lineNumber: 10,
                                                    columnNumber: 3355
                                                }, this)
                                            ]
                                        }, title, true, {
                                            fileName: "[project]/src/routes/index.tsx",
                                            lineNumber: 10,
                                            columnNumber: 3211
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/routes/index.tsx",
                                    lineNumber: 10,
                                    columnNumber: 3131
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/routes/index.tsx",
                            lineNumber: 10,
                            columnNumber: 2985
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/routes/index.tsx",
                        lineNumber: 10,
                        columnNumber: 2977
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/routes/index.tsx",
                lineNumber: 10,
                columnNumber: 1020
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "border-t border-border",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-[11px] uppercase tracking-[0.16em] text-muted-foreground",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "Reado"
                        }, void 0, false, {
                            fileName: "[project]/src/routes/index.tsx",
                            lineNumber: 10,
                            columnNumber: 3683
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$next$2d$router$2d$compat$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Link"], {
                            to: "/pricing",
                            className: "hover:text-foreground",
                            children: "Plans"
                        }, void 0, false, {
                            fileName: "[project]/src/routes/index.tsx",
                            lineNumber: 10,
                            columnNumber: 3701
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$next$2d$router$2d$compat$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Link"], {
                            to: "/auth",
                            className: "hover:text-foreground",
                            children: "Sign in"
                        }, void 0, false, {
                            fileName: "[project]/src/routes/index.tsx",
                            lineNumber: 10,
                            columnNumber: 3767
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/routes/index.tsx",
                    lineNumber: 10,
                    columnNumber: 3526
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/routes/index.tsx",
                lineNumber: 10,
                columnNumber: 3483
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/routes/index.tsx",
        lineNumber: 10,
        columnNumber: 184
    }, this);
}
}),
];

//# sourceMappingURL=_0y-sp7o._.js.map