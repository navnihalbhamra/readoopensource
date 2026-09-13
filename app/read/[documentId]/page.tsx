"use client";
import { useParams } from "next/navigation";

import { RequireAuth } from "@/components/RequireAuth";
import { Reader } from "@/routes/read.$documentId";

export default function Page() {
  const { documentId } = useParams<{ documentId: string }>();
  return (
    <RequireAuth>
      <Reader documentId={documentId} />
    </RequireAuth>
  );
}
