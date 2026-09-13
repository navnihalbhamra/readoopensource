"use client";
import { ImportPage } from "@/routes/import";
import { RequireAuth } from "@/components/RequireAuth";
export default function Page() {
  return (
    <RequireAuth>
      <ImportPage />
    </RequireAuth>
  );
}
