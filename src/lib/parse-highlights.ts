/**
 * Highlight import parsers.
 *
 * Pure functions — no database, no browser APIs — so they run identically in a
 * server function, in a public API route, or in a unit test.
 *
 * Supported inputs:
 *  1. Kindle "My Clippings.txt"  (entries separated by a line of "=")
 *  2. CSV exports (Readwise / Goodreads / generic), header-driven
 */

export interface ParsedHighlight {
  book_title: string;
  author: string | null;
  text: string;
  note: string | null;
  location: string | null;
  highlighted_at: string | null;
}

/** Split a single CSV line, honouring quoted fields and escaped quotes. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(field);
      field = "";
    } else {
      field += ch;
    }
  }
  out.push(field);
  return out.map((f) => f.trim());
}

/** Break a CSV document into rows, keeping newlines that sit inside quotes. */
function csvRows(input: string): string[] {
  const rows: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
      continue;
    }
    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && input[i + 1] === "\n") i++;
      if (current.trim()) rows.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) rows.push(current);
  return rows;
}

/** "The Lantern Room (Marguerite Halloway)" -> title + author */
function splitTitleAuthor(raw: string): { title: string; author: string | null } {
  const line = raw.replace(/^\uFEFF/, "").trim();
  const match = /^(.*)\(([^()]*)\)\s*$/.exec(line);
  if (match?.[1]?.trim()) {
    return { title: match[1].trim(), author: match[2]?.trim() || null };
  }
  // "Title - Author" fallback used by some exporters
  const dash = line.split(" - ");
  if (dash.length === 2) return { title: dash[0]!.trim(), author: dash[1]!.trim() };
  return { title: line, author: null };
}

function toIso(value: string | undefined | null): string | null {
  if (!value) return null;
  // Kindle writes "Added on Monday, 1 January 2024 10:00:00"
  const cleaned = value.replace(/^Added on\s+/i, "").replace(/^[A-Za-z]+day,\s*/i, "");
  const date = new Date(cleaned);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * Parse a Kindle "My Clippings.txt" file.
 * Each clipping is: title line, metadata line, blank line, body, then "=====".
 */
export function parseKindleClippings(input: string): ParsedHighlight[] {
  const out: ParsedHighlight[] = [];

  for (const block of input.split(/^=+\s*$/m)) {
    const lines = block.split(/\r?\n/).filter((l, i) => l.trim() !== "" || i > 1);
    const cleaned = lines.map((l) => l.trim()).filter(Boolean);
    if (cleaned.length < 2) continue;

    const { title, author } = splitTitleAuthor(cleaned[0]!);
    const meta = cleaned[1]!;
    const body = cleaned.slice(2).join("\n").trim();
    if (!body) continue;

    // Bookmarks carry no text; notes are kept as notes on their own entry.
    const isNote = /-\s*Your Note/i.test(meta);
    const location =
      /(?:page|Location|page\s+)\s*([\dxiv\-–]+)/i.exec(meta)?.[0]?.replace(/\s+/g, " ") ?? null;
    const addedOn = /Added on\s+(.+)$/i.exec(meta)?.[1] ?? null;

    out.push({
      book_title: title,
      author,
      text: body,
      note: isNote ? body : null,
      location,
      highlighted_at: toIso(addedOn),
    });
  }

  return out;
}

const HEADER_ALIASES: Record<keyof ParsedHighlight, string[]> = {
  text: ["highlight", "text", "quote", "content", "highlight text", "annotation"],
  book_title: ["book title", "title", "book", "document", "source"],
  author: ["author", "authors", "writer"],
  note: ["note", "notes", "comment", "annotation note"],
  location: ["location", "page", "location type", "position", "page number"],
  highlighted_at: ["date", "highlighted at", "date added", "added on", "timestamp", "created"],
};

function headerIndex(headers: string[], field: keyof ParsedHighlight): number {
  const lower = headers.map((h) => h.toLowerCase().replace(/^\uFEFF/, "").trim());
  for (const alias of HEADER_ALIASES[field]) {
    const idx = lower.indexOf(alias);
    if (idx !== -1) return idx;
  }
  return -1;
}

/** Parse a CSV export. Requires a header row containing a highlight/text column. */
export function parseHighlightsCsv(input: string): ParsedHighlight[] {
  const rows = csvRows(input);
  if (rows.length < 2) return [];

  const headers = splitCsvLine(rows[0]!);
  const idx = {
    text: headerIndex(headers, "text"),
    book_title: headerIndex(headers, "book_title"),
    author: headerIndex(headers, "author"),
    note: headerIndex(headers, "note"),
    location: headerIndex(headers, "location"),
    highlighted_at: headerIndex(headers, "highlighted_at"),
  };
  if (idx.text === -1) return [];

  const out: ParsedHighlight[] = [];
  for (const row of rows.slice(1)) {
    const cells = splitCsvLine(row);
    const text = (cells[idx.text] ?? "").trim();
    if (!text) continue;

    out.push({
      text,
      book_title: (idx.book_title !== -1 ? cells[idx.book_title] : "")?.trim() || "Unknown book",
      author: (idx.author !== -1 ? cells[idx.author] : "")?.trim() || null,
      note: (idx.note !== -1 ? cells[idx.note] : "")?.trim() || null,
      location: (idx.location !== -1 ? cells[idx.location] : "")?.trim() || null,
      highlighted_at: toIso(idx.highlighted_at !== -1 ? cells[idx.highlighted_at] : null),
    });
  }
  return out;
}

/**
 * Free-form paste fallback.
 *
 * Blocks are separated by blank lines. When a paste has no blank lines at all
 * (the common case: 20 quotes on 20 consecutive lines), each line that reads
 * like a standalone passage becomes its own highlight.
 *
 * Optional attribution on the last line of a block:
 *   "— Invisible Cities, Italo Calvino"  /  "- Sapiens (Yuval Noah Harari)"
 */
export function parsePlainText(input: string): ParsedHighlight[] {
  const out: ParsedHighlight[] = [];

  for (const rawBlock of input.split(/\n\s*\n/)) {
    const lines = rawBlock
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    let book_title = "Pasted highlights";
    let author: string | null = null;

    const last = lines[lines.length - 1]!;
    const bulletedList = lines.filter((l) => /^\s*(?:[-•*>]+|\d{1,3}[.)])\s+/.test(l)).length > 1;
    const attribution = bulletedList ? null : /^[-–—]{1,2}\s*(.+)$/.exec(last);
    if (attribution?.[1] && lines.length > 1) {
      lines.pop();

      const { title, author: parsedAuthor } = splitTitleAuthor(attribution[1]);
      const comma = title.split(",");
      if (!parsedAuthor && comma.length === 2) {
        book_title = comma[0]!.trim();
        author = comma[1]!.trim() || null;
      } else {
        book_title = title;
        author = parsedAuthor;
      }
    }

    const push = (raw: string) => {
      const text = cleanQuote(raw);
      if (text.length < 2) return;
      out.push({ book_title, author, text, note: null, location: null, highlighted_at: null });
    };

    if (lines.length > 1 && looksLikeSeparateQuotes(lines)) {
      for (const line of lines) push(line);
    } else {
      push(lines.join("\n"));
    }
  }

  return out;
}

/** Strip list markers and surrounding quote characters. */
function cleanQuote(raw: string): string {
  return raw
    .replace(/^\s*(?:[-•*–—>]+|\d{1,3}[.)])\s+/, "")
    .replace(/^["“'‘]+/, "")
    .replace(/["”'’]+$/, "")
    .trim();
}

/**
 * Decide whether the lines of a block are individual highlights rather than one
 * wrapped paragraph. Wrapped prose keeps flowing mid-sentence; separate quotes
 * are self-contained (terminal punctuation) or explicitly bulleted/numbered.
 */
function looksLikeSeparateQuotes(lines: string[]): boolean {
  const marked = lines.filter((l) => /^\s*(?:[-•*>]+|\d{1,3}[.)])\s+/.test(l)).length;
  if (marked >= Math.ceil(lines.length / 2)) return true;

  const selfContained = lines.filter((l) => /[.!?"”’)]\s*$/.test(l)).length;
  return selfContained >= Math.ceil(lines.length * 0.6);
}


/** Pick the right parser from the filename and the file's own shape. */
export function parseHighlightFile(filename: string, contents: string): ParsedHighlight[] {
  const looksCsv = /\.csv$/i.test(filename) || /^[^\n]*,[^\n]*\n/.test(contents.slice(0, 400));
  const looksKindle = /^=+\s*$/m.test(contents) || /-\s*Your (Highlight|Note|Bookmark)/i.test(contents);

  if (looksKindle) {
    const kindle = parseKindleClippings(contents);
    if (kindle.length > 0) return kindle;
  }
  if (looksCsv) {
    const csv = parseHighlightsCsv(contents);
    if (csv.length > 0) return csv;
  }
  // Anything else — a quote someone pasted by hand — still becomes a highlight.
  return parsePlainText(contents);
}


/** Drop empties and same-text duplicates within one import batch. */
export function dedupe(highlights: ParsedHighlight[]): ParsedHighlight[] {
  const seen = new Set<string>();
  const out: ParsedHighlight[] = [];
  for (const h of highlights) {
    const text = h.text.trim();
    if (!text || text.length < 2) continue;
    const key = `${h.book_title.toLowerCase()}::${text.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...h, text });
  }
  return out;
}
