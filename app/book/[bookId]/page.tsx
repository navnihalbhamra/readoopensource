"use client";
import { useParams } from "next/navigation";

import { RequireAuth } from "@/components/RequireAuth";
import { BookPage } from "@/routes/book.$bookId";

export default function Page() {
  const { bookId } = useParams<{ bookId: string }>();
  return (
    <RequireAuth>
      <BookPage bookId={bookId} />
    </RequireAuth>
  );
}
