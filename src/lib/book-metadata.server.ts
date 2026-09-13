/**
 * Book metadata lookup (server-only).
 *
 * Two keyless providers are tried in order:
 *   1. Open Library search API — covers, author, first publish year, subjects.
 *   2. Google Books volumes API — fallback when Open Library has no match.
 *
 * Nothing here throws: a failed lookup returns `null` so an import can never
 * be broken by a flaky third party.
 */

export interface BookMatch {
  title: string;
  author: string | null;
  cover_url: string | null;
  /** Alternate cover URLs to fall back on, best-first. */
  cover_candidates?: string[];

  open_library_key: string | null;
  published_year: number | null;
  description: string | null;
  subjects: string[] | null;
  match_source: "openlibrary" | "googlebooks";
}

/** Strip subtitle noise Kindle adds, e.g. "Title: A Novel (Series Book 2)". */
function normalizeTitle(raw: string): string {
  return raw
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/[":;,.!?—–-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** 0..1 token-overlap score — good enough to reject wildly wrong matches. */
function similarity(a: string, b: string): number {
  const left = new Set(normalizeTitle(a).split(" ").filter(Boolean));
  const right = new Set(normalizeTitle(b).split(" ").filter(Boolean));
  if (left.size === 0 || right.size === 0) return 0;
  let shared = 0;
  for (const token of left) if (right.has(token)) shared += 1;
  return shared / Math.max(left.size, right.size);
}

/** Shapes of the keyless API payloads we consume. */
interface OpenLibraryDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  subject?: string[];
  edition_key?: string[];
}

interface GoogleVolumeInfo {
  title?: string;
  authors?: string[];
  publishedDate?: string;
  description?: string;
  categories?: string[];
  imageLinks?: { thumbnail?: string; smallThumbnail?: string };
}

interface GoogleVolume {
  volumeInfo?: GoogleVolumeInfo;
}

async function getJson(url: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json", "user-agent": "Reado/1.0 (highlight review app)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function searchOpenLibrary(title: string, author?: string | null): Promise<BookMatch | null> {
  const params = new URLSearchParams({
    q: [title, author].filter(Boolean).join(" "),
    fields: "key,title,author_name,cover_i,first_publish_year,subject,edition_key",
    limit: "10",
  });
  const payload = await getJson(`https://openlibrary.org/search.json?${params}`);
  const docs: OpenLibraryDoc[] = Array.isArray(payload?.docs)
    ? (payload.docs as OpenLibraryDoc[])
    : [];
  if (docs.length === 0) return null;

  const authorTokens = normalizeTitle(author ?? "")
    .split(" ")
    .filter(Boolean);
  const scored = docs
    .map((doc) => {
      const names = normalizeTitle(
        (Array.isArray(doc.author_name) ? doc.author_name : []).map(String).join(" "),
      );
      // Open Library often returns the original-language title (e.g.
      // "Le città invisibili"), so an author match still counts as a hit.
      // Containment, not overlap: credited translators must not dilute it.
      const nameTokens = new Set(names.split(" ").filter(Boolean));
      const authorHit =
        authorTokens.length > 0 && authorTokens.every((token) => nameTokens.has(token));
      const titleScore = similarity(title, String(doc.title ?? ""));
      return { doc, score: Math.max(titleScore, authorHit ? 0.5 : 0) };
    })

    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best || best.score < 0.34) return null;

  // Prefer a near-equally-good edition that actually has cover art, so a
  // coverless "work" record doesn't win over the real book.
  const floor = Math.max(0.34, best.score - 0.2);
  const covered = scored.find(
    (candidate) => Boolean(candidate.doc.cover_i) && candidate.score >= floor,
  );
  const doc = (covered ?? best).doc;

  // Every plausible cover, best-first. Open Library serves a 1x1 placeholder
  // for editions with no art, so lookupBook validates these in order.
  const candidates: string[] = [];
  for (const candidate of scored) {
    // Keep every plausible edition, including original-language titles that
    // only matched on author — often they are the only ones with artwork.
    if (candidate.score < 0.34) continue;
    if (candidate.doc.cover_i) {
      candidates.push(`https://covers.openlibrary.org/b/id/${candidate.doc.cover_i}-M.jpg`);
    }
    for (const olid of (candidate.doc.edition_key ?? []).slice(0, 3)) {
      candidates.push(`https://covers.openlibrary.org/b/olid/${olid}-M.jpg`);
    }
  }

  return {
    title: String(doc.title ?? title),
    author: Array.isArray(doc.author_name) ? (doc.author_name[0] ?? null) : (author ?? null),
    cover_url: candidates[0] ?? null,
    cover_candidates: candidates,
    open_library_key: typeof doc.key === "string" ? doc.key : null,

    published_year: typeof doc.first_publish_year === "number" ? doc.first_publish_year : null,
    description: null,
    subjects: Array.isArray(doc.subject) ? doc.subject.slice(0, 6).map(String) : null,
    match_source: "openlibrary",
  };
}

async function searchGoogleBooks(title: string, author?: string | null): Promise<BookMatch | null> {
  // Join terms with a space: encodeURIComponent would turn a literal "+" into
  // %2B, which Google Books treats as part of the search text.
  const query = [`intitle:${title}`, author ? `inauthor:${author}` : ""].filter(Boolean).join(" ");
  const payload = await getJson(
    `https://www.googleapis.com/books/v1/volumes?maxResults=5&q=${encodeURIComponent(query)}`,
  );

  const items: GoogleVolume[] = Array.isArray(payload?.items)
    ? (payload.items as GoogleVolume[])
    : [];
  if (items.length === 0) return null;

  const scored = items
    .map((item) => ({ item, score: similarity(title, String(item?.volumeInfo?.title ?? "")) }))
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best || best.score < 0.34) return null;

  const info = best.item.volumeInfo ?? {};
  const thumb: string | undefined = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
  return {
    title: String(info.title ?? title),
    author: Array.isArray(info.authors) ? (info.authors[0] ?? null) : (author ?? null),
    cover_url: thumb ? thumb.replace(/^http:/, "https:") : null,
    open_library_key: null,
    published_year: /^(\d{4})/.exec(String(info.publishedDate ?? ""))
      ? Number(/^(\d{4})/.exec(String(info.publishedDate))![1])
      : null,
    description: typeof info.description === "string" ? info.description.slice(0, 1200) : null,
    subjects: Array.isArray(info.categories) ? info.categories.slice(0, 6).map(String) : null,
    match_source: "googlebooks",
  };
}

/**
 * Open Library answers 200 with a 1x1 placeholder when an edition has no art,
 * so a URL existing is not proof of a real cover — check the payload size.
 */
async function coverExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    if (!res.ok) return false;
    const bytes = (await res.arrayBuffer()).byteLength;
    return bytes > 1500;
  } catch {
    return false;
  }
}

/** Look a book up, Open Library first, Google Books as a fallback. */
export async function lookupBook(title: string, author?: string | null): Promise<BookMatch | null> {
  const clean = title.replace(/\s+/g, " ").trim();
  if (!clean) return null;

  const openLibrary = await searchOpenLibrary(clean, author);
  if (openLibrary) {
    // Walk the candidate editions until one serves real cover art.
    openLibrary.cover_url = null;
    const seen = new Set<string>();
    for (const url of (openLibrary.cover_candidates ?? []).slice(0, 8)) {
      if (seen.has(url)) continue;
      seen.add(url);
      if (await coverExists(url)) {
        openLibrary.cover_url = url;
        break;
      }
    }
  }
  if (openLibrary?.cover_url) {
    // Open Library search omits descriptions; fetch the work record for one.
    if (openLibrary.open_library_key) {
      const work = await getJson(`https://openlibrary.org${openLibrary.open_library_key}.json`);
      const raw = work?.description as string | { value?: string } | undefined;
      const text =
        typeof raw === "string" ? raw : typeof raw?.value === "string" ? raw.value : null;
      if (text) openLibrary.description = text.slice(0, 1200);
    }
    return openLibrary;
  }

  const google = await searchGoogleBooks(clean, author);
  if (google) return google;
  return openLibrary; // may be a match without a cover
}
