import * as React from "react";

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import type { ComponentType } from "react";

import type { TemplateData, TemplateEntry } from "./registry";

interface DigestHighlight {
  text: string;
  note?: string | null;
  book_title: string;
  author?: string | null;
  location?: string | null;
}

interface DailyReviewProps {
  highlights?: DigestHighlight[];
  appUrl?: string;
}

/** Reado's daily review: 3–5 saved passages, monochrome and typographic. */
const DailyReviewEmail = ({ highlights = [], appUrl = "https://reado.lol" }: DailyReviewProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {highlights.length > 0
        ? `${highlights[0]!.text.slice(0, 90)}`
        : "Your daily review from Reado"}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>DAILY REVIEW</Text>
        <Heading style={h1}>Things worth keeping</Heading>
        <Text style={lede}>
          {highlights.length} {highlights.length === 1 ? "highlight" : "highlights"} from your
          library.
        </Text>

        {highlights.map((highlight, index) => (
          <Section key={index} style={card}>
            <Text style={quote}>{highlight.text}</Text>
            {highlight.note ? <Text style={note}>Note: {highlight.note}</Text> : null}
            <Text style={meta}>
              {highlight.book_title}
              {highlight.author ? ` · ${highlight.author}` : ""}
              {highlight.location ? ` · ${highlight.location}` : ""}
            </Text>
          </Section>
        ))}

        <Hr style={rule} />
        <Text style={footer}>
          <Link href={`${appUrl}/highlights`} style={link}>
            Open your archive in Reado
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: DailyReviewEmail as unknown as ComponentType<TemplateData>,
  subject: "Your daily review",
  displayName: "Daily review digest",
  previewData: {
    appUrl: "https://reado.lol",
    highlights: [
      {
        text: "The city, however, does not tell its past, but contains it like the lines of a hand.",
        note: "Memory is structural, not narrative.",
        book_title: "Invisible Cities",
        author: "Italo Calvino",
        location: "Location 142",
      },
      {
        text: "One must imagine Sisyphus happy.",
        book_title: "The Myth of Sisyphus",
        author: "Albert Camus",
        location: "Page 123",
      },
    ],
  },
} satisfies TemplateEntry;

export default DailyReviewEmail;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "32px 25px", maxWidth: "560px" };
const eyebrow = {
  margin: "0",
  fontSize: "11px",
  letterSpacing: "0.2em",
  color: "#8a8a8a",
};
const h1 = {
  margin: "10px 0 0",
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: "26px",
  fontWeight: 600 as const,
  color: "#000000",
};
const lede = { margin: "8px 0 26px", fontSize: "13px", color: "#6b6b6b" };
const card = {
  borderLeft: "2px solid #000000",
  paddingLeft: "16px",
  margin: "0 0 26px",
};
const quote = {
  margin: "0",
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: "17px",
  lineHeight: "1.65",
  color: "#111111",
};
const note = { margin: "10px 0 0", fontSize: "13px", lineHeight: "1.5", color: "#6b6b6b" };
const meta = { margin: "10px 0 0", fontSize: "12px", letterSpacing: "0.04em", color: "#8a8a8a" };
const rule = { borderColor: "#e4e4e4", margin: "8px 0 0" };
const footer = { margin: "16px 0 0", fontSize: "12px", color: "#6b6b6b" };
const link = { color: "#000000", textDecoration: "underline" };
