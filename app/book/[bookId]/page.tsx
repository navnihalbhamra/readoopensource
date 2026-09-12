"use client";
import { BookPage } from "@/routes/book.$bookId";
import { RequireAuth } from "@/components/RequireAuth";
export default function Page() { return <RequireAuth><BookPage /></RequireAuth>; }
