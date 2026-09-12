"use client";
import { Books } from "@/routes/books";
import { RequireAuth } from "@/components/RequireAuth";
export default function Page() { return <RequireAuth><Books /></RequireAuth>; }
