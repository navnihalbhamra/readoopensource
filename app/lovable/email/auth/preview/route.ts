import * as React from "react";
import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";
import { SignupEmail } from "@/lib/email-templates/signup";
import { InviteEmail } from "@/lib/email-templates/invite";
import { MagicLinkEmail } from "@/lib/email-templates/magic-link";
import { RecoveryEmail } from "@/lib/email-templates/recovery";
import { EmailChangeEmail } from "@/lib/email-templates/email-change";
import { ReauthenticationEmail } from "@/lib/email-templates/reauthentication";

// Auth templates have heterogeneous sample prop shapes; the common registry
// type is a component that accepts arbitrary keys, so each entry is widened.
type PreviewComponent = React.ComponentType<{ [key: string]: unknown }>;

const EMAIL_TEMPLATES: Record<string, PreviewComponent> = {
  signup: SignupEmail as unknown as PreviewComponent,
  invite: InviteEmail as unknown as PreviewComponent,
  magiclink: MagicLinkEmail as unknown as PreviewComponent,
  recovery: RecoveryEmail as unknown as PreviewComponent,
  email_change: EmailChangeEmail as unknown as PreviewComponent,
  reauthentication: ReauthenticationEmail as unknown as PreviewComponent,
};

const SITE_NAME = "Reado";
const SAMPLE_PROJECT_URL = "https://readobynav.lovable.app";
const SAMPLE_EMAIL = "user@example.test";
const SAMPLE_DATA: Record<string, { [key: string]: unknown }> = {
  signup: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    recipient: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  magiclink: { siteName: SITE_NAME, confirmationUrl: SAMPLE_PROJECT_URL },
  recovery: { siteName: SITE_NAME, confirmationUrl: SAMPLE_PROJECT_URL },
  invite: { siteName: SITE_NAME, siteUrl: SAMPLE_PROJECT_URL, confirmationUrl: SAMPLE_PROJECT_URL },
  email_change: {
    siteName: SITE_NAME,
    oldEmail: SAMPLE_EMAIL,
    email: SAMPLE_EMAIL,
    newEmail: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL,
  },
  reauthentication: { token: "123456" },
};

export async function POST(request: NextRequest) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return NextResponse.json({ error: "Server configuration error" }, { status: 500 });

  const authHeader = request.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let type: string;
  try {
    const body = (await request.json()) as { type: string };
    type = body.type;
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  const EmailTemplate = EMAIL_TEMPLATES[type];
  if (!EmailTemplate)
    return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 });

  const sampleData = SAMPLE_DATA[type] ?? {};
  const html = await render(React.createElement(EmailTemplate, sampleData));
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
