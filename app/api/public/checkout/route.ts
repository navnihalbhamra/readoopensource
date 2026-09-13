/** POST /api/public/checkout — create a Polar checkout session */
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/polar.server";
import { z } from "zod";

const checkoutSchema = z.object({
  productId: z.string().min(1),
  successUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );

    const { productId, successUrl } = parsed.data;
    const session = await createCheckoutSession(productId, successUrl);

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      checkoutId: session.id,
      userId,
    });
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout" },
      { status: 500 },
    );
  }
}
