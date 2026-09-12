"use client";
import { Settings } from "@/routes/settings";
import { RequireAuth } from "@/components/RequireAuth";
export default function Page() { return <RequireAuth><Settings /></RequireAuth>; }
