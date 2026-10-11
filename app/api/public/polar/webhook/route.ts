import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * POST /api/public/polar/webhook
 * Handles Polar webhook events to upgrade users to Founder Pass (lifetime).
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let event: Record<string, any>;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const type = event.type as string | undefined;
    const data = (event.data || {}) as Record<string, any>;

    // Handle order.created or checkout.updated
    if (type === "order.created" || type === "checkout.updated") {
      const metadata = data.metadata || data.customer_metadata || {};
      const userId = metadata.userId as string | undefined;
      const customerEmail = data.customer?.email || data.customer_email;

      if (userId) {
        await supabaseAdmin
          .from("profiles")
          .update({ plan: "lifetime", plan_source: "polar" })
          .eq("id", userId);
        console.log(`[Polar Webhook] Upgraded user ${userId} to Founder Pass`);
      } else if (customerEmail) {
        await supabaseAdmin
          .from("profiles")
          .update({ plan: "lifetime", plan_source: "polar" })
          .eq("email", customerEmail);
        console.log(`[Polar Webhook] Upgraded user with email ${customerEmail} to Founder Pass`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Polar Webhook] Error processing event:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook error" },
      { status: 500 },
    );
  }
}
