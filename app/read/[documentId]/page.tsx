"use client";
import { Reader } from "@/routes/read.$documentId";
import { RequireAuth } from "@/components/RequireAuth";
export default function Page() { return <RequireAuth><Reader /></RequireAuth>; }
