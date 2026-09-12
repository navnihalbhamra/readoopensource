"use client";
import { Review } from "@/routes/review";
import { RequireAuth } from "@/components/RequireAuth";
export default function Page() { return <RequireAuth><Review /></RequireAuth>; }
