/**
 * Parser for Omnivore data exports (JSON, Markdown, and CSV).
 * Handles migrated articles, user highlights, notes, and metadata.
 */

export interface OmnivoreParsedHighlight {
  text: string;
  note?: string | null;
  color?: string | null;
  createdAt?: string | null;
}

export interface OmnivoreParsedArticle {
  title: string;
  url?: string | null;
  author?: string | null;
  content: string;
  highlights: OmnivoreParsedHighlight[];
  savedAt?: string | null;
}

export interface OmnivoreImportResult {
  articles: OmnivoreParsedArticle[];
  totalHighlights: number;
}

/**
 * Parses raw text from an Omnivore export file (JSON, Markdown, or CSV).
 */
export function parseOmnivoreExport(raw: string, filename?: string): OmnivoreImportResult {
  const trimmed = raw.trim();
  const lowerName = (filename || "").toLowerCase();

  // 1. Try JSON parsing
  if (lowerName.endsWith(".json") || trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const data = JSON.parse(trimmed);
      return parseOmnivoreJson(data);
    } catch {
      // Fall through to other formats if JSON parse fails
    }
  }

  // 2. Try CSV parsing
  if (lowerName.endsWith(".csv") || trimmed.includes("Title,URL,Author") || trimmed.includes('"Title","URL"')) {
    return parseOmnivoreCsv(trimmed);
  }

  // 3. Fallback to Omnivore Markdown parsing
  return parseOmnivoreMarkdown(trimmed);
}

function parseOmnivoreJson(json: unknown): OmnivoreImportResult {
  const items: unknown[] = Array.isArray(json) ? json : typeof json === "object" && json !== null ? [json] : [];
  const articles: OmnivoreParsedArticle[] = [];
  let totalHighlights = 0;

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;

    const title = String(record.title || record.pageTitle || record.name || "Untitled Article").trim();
    const url = typeof record.url === "string" ? record.url : typeof record.originalArticleUrl === "string" ? record.originalArticleUrl : null;
    const author = typeof record.author === "string" ? record.author : typeof record.byline === "string" ? record.byline : null;
    const content = typeof record.content === "string" ? record.content : typeof record.textContent === "string" ? record.textContent : "";

    const highlights: OmnivoreParsedHighlight[] = [];
    const rawHighlights = Array.isArray(record.highlights) ? record.highlights : [];

    for (const h of rawHighlights) {
      if (!h || typeof h !== "object") continue;
      const hRecord = h as Record<string, unknown>;
      const text = String(hRecord.quote || hRecord.text || "").trim();
      if (!text) continue;

      const note = typeof hRecord.annotation === "string" ? hRecord.annotation.trim() : typeof hRecord.note === "string" ? hRecord.note.trim() : null;
      highlights.push({
        text,
        note: note || null,
        color: typeof hRecord.color === "string" ? hRecord.color : null,
        createdAt: typeof hRecord.createdAt === "string" ? hRecord.createdAt : null,
      });
      totalHighlights++;
    }

    if (title || content || highlights.length > 0) {
      articles.push({
        title,
        url,
        author,
        content: content || (highlights.map((h) => h.text).join("\n\n")),
        highlights,
        savedAt: typeof record.savedAt === "string" ? record.savedAt : typeof record.createdAt === "string" ? record.createdAt : null,
      });
    }
  }

  return { articles, totalHighlights };
}

function parseOmnivoreMarkdown(raw: string): OmnivoreImportResult {
  // Omnivore markdown format:
  // # Article Title
  // [Original URL](https://...)
  // > Highlight quote
  // ^uuid-string
  // Note: user annotation
  const lines = raw.split(/\r?\n/);
  let currentTitle = "Untitled Article";
  let currentUrl: string | null = null;
  let currentAuthor: string | null = null;
  const highlights: OmnivoreParsedHighlight[] = [];
  const contentParagraphs: string[] = [];

  let currentQuote: string[] = [];
  let currentNote: string | null = null;

  const flushQuote = () => {
    if (currentQuote.length > 0) {
      highlights.push({
        text: currentQuote.join(" ").trim(),
        note: currentNote,
      });
      currentQuote = [];
      currentNote = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Title header
    if (line.startsWith("# ") && currentTitle === "Untitled Article") {
      flushQuote();
      currentTitle = line.replace(/^#\s+/, "").trim();
      continue;
    }

    // URL link
    const urlMatch = line.match(/\[(?:Original URL|Read on Omnivore|Source)\]\((https?:\/\/[^\s)]+)\)/i);
    if (urlMatch) {
      currentUrl = urlMatch[1];
      continue;
    }

    // Author
    if (/^by\s+/i.test(line) && !currentAuthor) {
      currentAuthor = line.replace(/^by\s+/i, "").trim();
      continue;
    }

    // Blockquote highlight
    if (line.startsWith(">")) {
      const quoteText = line.replace(/^>\s*/, "").trim();
      currentQuote.push(quoteText);
      continue;
    }

    // Omnivore UUID anchor: ^0a1b2c3d
    if (line.startsWith("^")) {
      continue;
    }

    // Note line
    if (/^note:\s*/i.test(line)) {
      currentNote = line.replace(/^note:\s*/i, "").trim();
      flushQuote();
      continue;
    }

    // Normal paragraph text
    if (currentQuote.length > 0) {
      flushQuote();
    }

    if (line) {
      contentParagraphs.push(line);
    }
  }

  flushQuote();

  return {
    articles: [
      {
        title: currentTitle,
        url: currentUrl,
        author: currentAuthor,
        content: contentParagraphs.join("\n\n") || highlights.map((h) => h.text).join("\n\n"),
        highlights,
      },
    ],
    totalHighlights: highlights.length,
  };
}

function parseOmnivoreCsv(csv: string): OmnivoreImportResult {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { articles: [], totalHighlights: 0 };

  // Parse header
  const header = lines[0].toLowerCase();
  const articlesMap = new Map<string, OmnivoreParsedArticle>();
  let totalHighlights = 0;

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    // Simple CSV column splitter handling quotes
    const cols = row.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g)?.map((col) => {
      let val = col.replace(/^,/, "").trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      return val;
    }) || [];

    if (cols.length < 2) continue;

    const title = cols[0] || "Untitled Article";
    const url = cols[1]?.startsWith("http") ? cols[1] : null;
    const author = cols[2] || null;
    const highlightText = cols[3] || "";
    const note = cols[4] || null;

    if (!articlesMap.has(title)) {
      articlesMap.set(title, {
        title,
        url,
        author,
        content: "",
        highlights: [],
      });
    }

    const art = articlesMap.get(title)!;
    if (highlightText) {
      art.highlights.push({
        text: highlightText,
        note: note || null,
      });
      totalHighlights++;
    }
  }

  return {
    articles: Array.from(articlesMap.values()),
    totalHighlights,
  };
}

