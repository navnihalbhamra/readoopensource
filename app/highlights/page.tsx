"use client";
import { Highlights } from "@/routes/highlights";
import { RequireAuth } from "@/components/RequireAuth";
export default function Page() { return <RequireAuth><Highlights /></RequireAuth>; }
