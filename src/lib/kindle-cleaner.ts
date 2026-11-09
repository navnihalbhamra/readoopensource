import {
  parseKindleClippings,
  type ParsedHighlight,
} from "./parse-highlights";

export interface CleanedHighlight extends ParsedHighlight {
  id: string;
}

export interface BookGroup {
  title: string;
  author: string | null;
  quotes: CleanedHighlight[];
}

export const SAMPLE_CLIPPINGS = `Meditations (Marcus Aurelius)
- Your Highlight on Location 482-484 | Added on Monday, January 1, 2024 10:14:22 AM

The impediment to action advances action. What stands in the way becomes the way.
==========
Meditations (Marcus Aurelius)
- Your Highlight on Location 612-614 | Added on Tuesday, January 2, 2024 08:30:15 AM

You have power over your mind - not outside events. Realize this, and you will find strength.
==========
Atomic Habits: An Easy & Proven Way to Build Good Habits (James Clear)
- Your Highlight on Location 1120-1122 | Added on Friday, February 9, 2024 09:45:00 AM

You do not rise to the level of your goals. You fall to the level of your systems.
==========
Atomic Habits: An Easy & Proven Way to Build Good Habits (James Clear)
- Your Highlight on Location 1450-1452 | Added on Saturday, February 10, 2024 04:12:30 PM

Every action you take is a vote for the type of person you wish to become.
==========
Deep Work: Rules for Focused Success in a Distracted World (Cal Newport)
- Your Highlight on Location 340-342 | Added on Wednesday, March 15, 2024 11:20:00 AM

The ability to perform deep work is becoming increasingly rare at exactly the same time it is becoming increasingly valuable in our economy.
==========`;

/**
 * Clean and normalize a raw string from Kindle.
 * Removes non-breaking spaces, zero-width chars, BOM, and weird linebreaks.
 */
export function sanitizeKindleString(str: string): string {
  return str
    .replace(/^\uFEFF/, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/**
 * Clean a Kindle clippings file into structured, deduplicated highlights.
 */
export function cleanKindleClippings(raw: string): {
  highlights: CleanedHighlight[];
  books: BookGroup[];
  duplicatesRemoved: number;
} {
  const parsed = parseKindleClippings(raw);
  const seen = new Set<string>();
  const cleaned: CleanedHighlight[] = [];
  let duplicates = 0;

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i]!;
    const textClean = sanitizeKindleString(item.text);
    if (!textClean || textClean.length < 3) continue;

    const dedupKey = `${item.book_title.toLowerCase().trim()}:::${textClean.toLowerCase()}`;
    if (seen.has(dedupKey)) {
      duplicates++;
      continue;
    }
    seen.add(dedupKey);

    cleaned.push({
      ...item,
      id: `kh-${i}-${Math.random().toString(36).slice(2, 7)}`,
      text: textClean,
      book_title: sanitizeKindleString(item.book_title),
      author: item.author ? sanitizeKindleString(item.author) : null,
      location: item.location ? sanitizeKindleString(item.location) : null,
      note: item.note ? sanitizeKindleString(item.note) : null,
    });
  }

  // Group by book
  const bookMap = new Map<string, BookGroup>();
  for (const h of cleaned) {
    const key = h.book_title;
    if (!bookMap.has(key)) {
      bookMap.set(key, {
        title: key,
        author: h.author,
        quotes: [],
      });
    }
    bookMap.get(key)!.quotes.push(h);
  }

  return {
    highlights: cleaned,
    books: Array.from(bookMap.values()),
    duplicatesRemoved: duplicates,
  };
}

/**
 * Convert cleaned highlights into formatted Markdown.
 * Perfect for Obsidian, Notion, Logseq, or local Markdown notes.
 */
export function highlightsToMarkdown(books: BookGroup[]): string {
  const totalQuotes = books.reduce((acc, b) => acc + b.quotes.length, 0);

  const lines: string[] = [
    `# 📚 Kindle Highlights`,
    ``,
    `*Cleaned with [Reado](https://reado.lol) — The Reading Memory Engine*`,
    ``,
    `Total: **${totalQuotes} quotes** across **${books.length} books**`,
    ``,
    `---`,
    ``,
  ];

  for (const book of books) {
    lines.push(`## ${book.title}`);
    if (book.author) {
      lines.push(`**Author:** ${book.author}`);
    }
    lines.push(``);

    for (const q of book.quotes) {
      lines.push(`> ${q.text}`);
      const meta = [q.location, q.highlighted_at ? new Date(q.highlighted_at).toLocaleDateString() : null]
        .filter(Boolean)
        .join(" · ");
      if (meta) {
        lines.push(`> — *${meta}*`);
      }
      if (q.note) {
        lines.push(``);
        lines.push(`**Note:** ${q.note}`);
      }
      lines.push(``);
    }

    lines.push(`---`);
    lines.push(``);
  }

  return lines.join("\n");
}
