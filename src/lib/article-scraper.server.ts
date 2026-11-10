/**
 * Server-side web article scraper and readability extractor.
 * Extracts clean reader content (title, author, main article body, reading time)
 * from any public URL without external browser dependencies.
 */

export interface ScrapedArticle {
  title: string;
  author: string | null;
  siteName: string | null;
  content: string; // Cleaned text split by \n\n
  source: string; // The canonical or target URL
  wordCount: number;
  readingTimeMinutes: number;
  excerpt?: string;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8212;/g, "—")
    .replace(/&#8211;/g, "–")
    .replace(/&#8230;/g, "…")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => {
      try {
        return String.fromCharCode(parseInt(code, 10));
      } catch {
        return "";
      }
    });
}

function cleanExtractedText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ") // Collapse inline whitespace
    .replace(/\n\s*\n\s*\n+/g, "\n\n") // Max two consecutive linebreaks
    .trim();
}

export async function extractArticleFromUrl(targetUrl: string): Promise<ScrapedArticle> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl.trim());
    if (!/^https?:$/.test(parsedUrl.protocol)) {
      throw new Error("Invalid URL protocol. Please provide an http:// or https:// URL.");
    }
  } catch {
    throw new Error("Please enter a valid web URL (e.g. https://example.com/article).");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  let html = "";
  try {
    const res = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (compatible; ReadoBot/1.0; +https://reado.lol)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch article (HTTP ${res.status}: ${res.statusText})`);
    }

    html = await res.text();
  } catch (err: unknown) {
    if ((err as Error).name === "AbortError") {
      throw new Error("Article fetch timed out after 12 seconds. The site may be blocking crawlers.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  // 1. Extract Meta Tags
  const getMeta = (prop: string, isName = false): string | null => {
    const attr = isName ? "name" : "property";
    const regex = new RegExp(
      `<meta\\s+[^>]*${attr}=["']${prop}["'][^>]*content=["']([^"']+)["']|<meta\\s+[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${prop}["']`,
      "i"
    );
    const m = html.match(regex);
    const val = m ? m[1] || m[2] : null;
    return val ? decodeHtmlEntities(val.trim()) : null;
  };

  // 2. Extract Title
  let title =
    getMeta("og:title") ||
    getMeta("twitter:title", true) ||
    getMeta("title", true);

  if (!title) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      title = decodeHtmlEntities(titleMatch[1].trim());
    }
  }

  if (!title) {
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      title = decodeHtmlEntities(h1Match[1].replace(/<[^>]+>/g, "").trim());
    }
  }

  if (!title) {
    title = parsedUrl.pathname.split("/").filter(Boolean).pop()?.replace(/[-_]/g, " ") || "Untitled Article";
  } else {
    // Strip common site suffix like " - The Verge" or " | Hacker News"
    title = title.replace(/\s+[|\-–—]\s+[^|\-–—]+$/, "").trim();
  }

  // 3. Extract Author / Site
  const author =
    getMeta("author", true) ||
    getMeta("article:author") ||
    getMeta("twitter:creator", true) ||
    null;

  const siteName =
    getMeta("og:site_name") ||
    parsedUrl.hostname.replace(/^www\./, "");

  // 4. Clean HTML body & extract main content
  // Strip head, scripts, styles, navs, footers, forms, comments, etc.
  let cleanHtml = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, "")
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "");

  // Try to find targeted article/main block first
  const articleBlockMatch =
    cleanHtml.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i) ||
    cleanHtml.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) ||
    cleanHtml.match(/<div\b[^>]*class=["'][^"']*(?:post-content|article-body|entry-content|prose|content-body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);

  const contentSource = articleBlockMatch ? articleBlockMatch[1] : cleanHtml;

  // Convert blocks into paragraphs: extract <p>, <blockquote>, <h2>, <h3>, <li>
  const blockMatches = contentSource.match(/<(p|blockquote|h2|h3|li)\b[^>]*>([\s\S]*?)<\/\1>/gi);

  const paragraphs: string[] = [];

  if (blockMatches && blockMatches.length > 0) {
    for (const block of blockMatches) {
      // Strip inner tags
      const text = decodeHtmlEntities(block.replace(/<[^>]+>/g, " ")).trim();
      // Filter out short boilerplates or cookie notices
      if (text.length > 20 && !/cookie|privacy policy|terms of service|all rights reserved|subscribe to/i.test(text)) {
        paragraphs.push(cleanExtractedText(text));
      }
    }
  }

  // Fallback: if paragraph matcher failed or was too sparse, strip all tags
  let finalContent = paragraphs.join("\n\n");
  if (finalContent.length < 100) {
    const rawFallback = decodeHtmlEntities(contentSource.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "\n"));
    const lines = rawFallback
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 30);
    finalContent = lines.join("\n\n");
  }

  if (!finalContent || finalContent.trim().length < 50) {
    finalContent = `Could not extract readable article text from ${parsedUrl.toString()}. You can view the original article at: ${parsedUrl.toString()}`;
  }

  const words = finalContent.trim().split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.round(words / 220));

  return {
    title,
    author: author || siteName,
    siteName,
    content: finalContent,
    source: parsedUrl.toString(),
    wordCount: words,
    readingTimeMinutes,
    excerpt: paragraphs[0]?.slice(0, 200) || undefined,
  };
}

