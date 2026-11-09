import { decodeEntities, stripTags, countWords } from "../util";

/**
 * Minimal, dependency-free HTML analysis used by the website crawler and the
 * five-layer GEO engine. It is intentionally tolerant: the target site is
 * hand-authored static HTML, so we parse structure (headings, sections, links,
 * JSON-LD, meta) rather than building a full DOM.
 */

export interface Heading {
  level: number;
  text: string;
  index: number;
}

export interface Link {
  href: string;
  text: string;
  rel: string;
}

export interface Section {
  ordinal: number;
  level: number;
  heading: string;
  anchor: string | null;
  text: string;
  firstParagraph: string;
  listItems: number;
  tables: number;
  paragraphs: number;
  questions: number;
  hasDirectAnswer: boolean;
  wordCount: number;
  duplicateOf: number | null;
}

export interface ParsedDoc {
  title: string;
  metaDescription: string;
  canonical: string | null;
  robots: string | null;
  lang: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  h1: string[];
  headings: Heading[];
  links: Link[];
  jsonld: string[];
  images: { src: string; alt: string | null }[];
  text: string;
  sections: Section[];
  wordCount: number;
}

const HEADING_RE = /<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  if (!m) return null;
  return decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
}

// Structure parsing must ignore script/style contents, otherwise anchors and
// heading-like text embedded in JS or JSON-LD are read as real markup.
export function stripNonContent(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ");
}

export function parseDocument(html: string, baseUrl = ""): ParsedDoc {
  const headMatch = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  const head = headMatch ? headMatch[1] : html;

  const titleM = head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleM ? decodeEntities(stripTags(titleM[1])) : "";

  const metaTags = head.match(/<meta\b[^>]*>/gi) ?? [];
  let metaDescription = "";
  let robots: string | null = null;
  let ogTitle: string | null = null;
  let ogDescription: string | null = null;
  for (const t of metaTags) {
    const name = (attr(t, "name") || attr(t, "property") || "").toLowerCase();
    const content = attr(t, "content") || "";
    if (name === "description") metaDescription = content;
    else if (name === "robots") robots = content.toLowerCase();
    else if (name === "og:title") ogTitle = content;
    else if (name === "og:description") ogDescription = content;
  }

  const linkTags = head.match(/<link\b[^>]*>/gi) ?? [];
  let canonical: string | null = null;
  for (const t of linkTags) {
    if ((attr(t, "rel") || "").toLowerCase().includes("canonical")) canonical = attr(t, "href");
  }

  const htmlTag = html.match(/<html\b[^>]*>/i);
  const lang = htmlTag ? attr(htmlTag[0], "lang") : null;

  const jsonld: string[] = [];
  const ldRe = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let lm: RegExpExecArray | null;
  while ((lm = ldRe.exec(html))) jsonld.push(lm[1].trim());

  // Structure parsing must ignore script/style contents, otherwise anchors and
  // heading-like text embedded in JS or JSON-LD are read as real markup.
  const structural = stripNonContent(html);

  const headings: Heading[] = [];
  const h1: string[] = [];
  HEADING_RE.lastIndex = 0;
  let hm: RegExpExecArray | null;
  while ((hm = HEADING_RE.exec(structural))) {
    const level = parseInt(hm[1], 10);
    const text = decodeEntities(stripTags(hm[3]));
    if (!text) continue;
    headings.push({ level, text, index: hm.index });
    if (level === 1) h1.push(text);
  }

  const links: Link[] = [];
  const aRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let am: RegExpExecArray | null;
  while ((am = aRe.exec(structural))) {
    const href = attr(am[1], "href");
    if (!href) continue;
    links.push({
      href: resolveUrl(href, baseUrl),
      text: decodeEntities(stripTags(am[2])),
      rel: attr(am[1], "rel") || "",
    });
  }

  const images: { src: string; alt: string | null }[] = [];
  const imgRe = /<img\b([^>]*)>/gi;
  let im: RegExpExecArray | null;
  while ((im = imgRe.exec(structural))) {
    const src = attr(im[1], "src");
    if (!src) continue;
    images.push({ src, alt: attr(im[1], "alt") });
  }

  const bodyMatch = structural.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : structural;
  const text = stripTags(body);

  const sections = extractSections(structural, headings);

  return {
    title,
    metaDescription,
    canonical,
    robots,
    lang,
    ogTitle,
    ogDescription,
    h1,
    headings,
    links,
    jsonld,
    images,
    text,
    sections,
    wordCount: countWords(text),
  };
}

export function resolveUrl(href: string, base: string): string {
  if (!href) return "";
  if (/^(https?:)?\/\//i.test(href)) return href.startsWith("//") ? "https:" + href : href;
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return href;
  if (!base) return href;
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function extractSections(html: string, headings: Heading[]): Section[] {
  const sections: Section[] = [];
  if (headings.length === 0) {
    const text = stripTags(html);
    return [
      {
        ordinal: 0,
        level: 0,
        heading: "(no heading)",
        anchor: null,
        text,
        firstParagraph: firstSentence(text),
        listItems: (html.match(/<li\b/gi) ?? []).length,
        tables: (html.match(/<table\b/gi) ?? []).length,
        paragraphs: (html.match(/<p\b/gi) ?? []).length,
        questions: 0,
        hasDirectAnswer: false,
        wordCount: countWords(text),
        duplicateOf: null,
      },
    ];
  }

  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];
    const start = h.index;
    const end = i + 1 < headings.length ? headings[i + 1].index : html.length;
    const chunk = html.slice(start, end);
    const anchorMatch = chunk.match(/<h[1-6]\b[^>]*\bid\s*=\s*("([^"]*)"|'([^']*)')/i);
    const anchor = anchorMatch ? anchorMatch[2] ?? anchorMatch[3] ?? null : null;
    const bodyHtml = chunk.replace(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/i, " ");
    const text = stripTags(bodyHtml);
    const paragraphs = (bodyHtml.match(/<p\b[^>]*>([\s\S]*?)<\/p>/gi) ?? []).map((p) => stripTags(p));
    const firstPara = paragraphs.find((p) => countWords(p) > 0) ?? "";
    const listItems = (bodyHtml.match(/<li\b/gi) ?? []).length;
    const tables = (bodyHtml.match(/<table\b/gi) ?? []).length;
    const questions =
      (h.text.match(/\?/g) ?? []).length +
      (bodyHtml.match(/<dt\b[^>]*>[\s\S]*?\?/gi) ?? []).length;
    sections.push({
      ordinal: i,
      level: h.level,
      heading: h.text,
      anchor,
      text,
      firstParagraph: firstPara,
      listItems,
      tables,
      paragraphs: paragraphs.length,
      questions,
      hasDirectAnswer: isDirectAnswer(firstPara),
      wordCount: countWords(text),
      duplicateOf: null,
    });
  }

  const sentenceSets = sections.map((s) => new Set(sentences(s.text)));
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].wordCount < 25) continue;
    for (let j = 0; j < sections.length; j++) {
      if (i === j) continue;
      if (sentenceSets[i].size === 0 || sentenceSets[j].size === 0) continue;
      let shared = 0;
      for (const s of sentenceSets[i]) if (sentenceSets[j].has(s)) shared++;
      if (shared / sentenceSets[i].size >= 0.7) {
        sections[i].duplicateOf = sections[j].ordinal;
        break;
      }
    }
  }

  return sections;
}

export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim().toLowerCase().replace(/\s+/g, " "))
    .filter((s) => s.length > 25);
}

function firstSentence(text: string): string {
  const m = text.match(/^[\s\S]{0,240}?[.!?](\s|$)/);
  return m ? m[0].trim() : text.slice(0, 200);
}

/**
 * A "direct answer" is a short, declarative lead paragraph right under the
 * heading — the pattern AI answer engines most reliably extract.
 */
export function isDirectAnswer(paragraph: string): boolean {
  const w = countWords(paragraph);
  if (w === 0 || w > 65) return false;
  if (/^(click|call us|contact|learn more|get started)\b/i.test(paragraph.trim())) return false;
  return /[.!?]/.test(paragraph);
}

export function schemaTypes(jsonld: string[]): string[] {
  const types = new Set<string>();
  for (const block of jsonld) {
    try {
      walkTypes(JSON.parse(block), types);
    } catch {
      const m = block.match(/"@type"\s*:\s*"([^"]+)"/g) ?? [];
      for (const t of m) types.add(t.replace(/.*"([^"]+)"$/, "$1"));
    }
  }
  return [...types];
}

function walkTypes(node: unknown, out: Set<string>): void {
  if (Array.isArray(node)) {
    for (const n of node) walkTypes(n, out);
    return;
  }
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const t = obj["@type"];
    if (typeof t === "string") out.add(t);
    else if (Array.isArray(t)) for (const x of t) if (typeof x === "string") out.add(x);
    for (const v of Object.values(obj)) walkTypes(v, out);
  }
}

/** Detect heading-level skips (h1 -> h3) that break outline extraction. */
export function headingSkips(headings: Heading[]): number {
  let skips = 0;
  let prev = 0;
  for (const h of headings) {
    if (prev > 0 && h.level > prev + 1) skips += h.level - prev - 1;
    prev = h.level;
  }
  return skips;
}
