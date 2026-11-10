import * as React from "react";
import { render } from "@react-email/render";
import type { TemplateData } from "./registry";
import { TEMPLATES } from "./registry";

const SITE_NAME = "Reado";
const FROM_DOMAIN = process.env.EMAIL_FROM_DOMAIN || "reado.lol";

export class EmailAPIError extends Error {
  code?: string;
  status?: number;
  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = "EmailAPIError";
    this.code = code;
    this.status = status;
  }
}

export type SendTemplateEmailResult =
  { sent: true } | { sent: false; reason: "recipient_suppressed" | "not_configured" };

export interface SendTemplateEmailOptions {
  templateData?: TemplateData;
  idempotencyKey?: string;
  replyTo?: string;
}

/**
 * Renders a registered template and dispatches it via transactional email provider (e.g. Resend)
 * or logs cleanly in development.
 */
export async function sendTemplateEmail(
  templateName: string,
  to: string,
  options: SendTemplateEmailOptions = {},
): Promise<SendTemplateEmailResult> {
  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY;

  const template = TEMPLATES[templateName];
  if (!template) {
    throw new Error(
      `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(", ")}`,
    );
  }

  const recipient = template.to || to;
  if (!recipient) {
    throw new Error("Recipient is required (the template defines no fixed recipient)");
  }

  const templateData = options.templateData ?? {};
  const element = React.createElement(template.component, templateData);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject =
    typeof template.subject === "function" ? template.subject(templateData) : template.subject;

  if (!apiKey) {
    console.info(`[Email Dispatch - Dev/Preview Mode] To: ${recipient} | Subject: "${subject}"`);
    return { sent: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        to: [recipient],
        subject,
        html,
        text,
        reply_to: options.replyTo,
        headers: options.idempotencyKey ? { "X-Entity-Ref-ID": options.idempotencyKey } : undefined,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new EmailAPIError(`Email delivery failed with status ${res.status}: ${errText}`, "api_error", res.status);
    }

    return { sent: true };
  } catch (error) {
    if (error instanceof EmailAPIError && error.code === "recipient_suppressed") {
      return { sent: false, reason: "recipient_suppressed" };
    }
    console.error("Transactional email dispatch error:", error);
    throw error;
  }
}
