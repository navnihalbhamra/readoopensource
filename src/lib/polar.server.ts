/**
 * Polar checkout integration (Next.js route handler)
 * Uses Polar's REST API to create and manage checkouts
 */

const POLAR_API_URL = "https://api.polar.sh/v1";

export interface CheckoutSession {
  id: string;
  clientSecret: string | null;
  url: string | null;
  successUrl: string;
  productId: string;
}

/**
 * Create a Polar checkout session
 */
export async function createCheckoutSession(
  productId?: string,
  successUrl?: string,
  userId?: string,
): Promise<CheckoutSession> {
  const accessToken = process.env["POLAR_ACCESS_TOKEN"];
  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not set");
  }

  const effectiveProductId =
    productId || process.env["POLAR_PRODUCT_ID"] || "94af6917-db05-46d6-b84a-c6c6e8744ea6";

  const appUrl =
    process.env["NEXT_PUBLIC_APP_URL"] ??
    process.env["VITE_PUBLIC_APP_URL"] ??
    "https://reado.lol";

  let polarSuccessUrl =
    successUrl ||
    process.env["POLAR_SUCCESS_URL"] ||
    `${appUrl}/review?upgraded=true&checkout_id={CHECKOUT_ID}`;

  if (polarSuccessUrl.startsWith("/")) {
    polarSuccessUrl = `${appUrl}${polarSuccessUrl}`;
  }

  try {
    const payload: Record<string, unknown> = {
      product_id: effectiveProductId,
      success_url: polarSuccessUrl,
    };

    if (userId) {
      payload["metadata"] = { userId };
      payload["customer_metadata"] = { userId };
    }

    const response = await fetch(`${POLAR_API_URL}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Polar API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      clientSecret: data.client_secret ?? null,
      url: data.url ?? null,
      successUrl: data.success_url ?? polarSuccessUrl,
      productId: data.product_id ?? effectiveProductId,
    };
  } catch (error) {
    console.error("Failed to create Polar checkout:", error);
    throw error;
  }
}

/**
 * Get a checkout session by ID
 */
export async function getCheckoutSession(checkoutId: string): Promise<CheckoutSession> {
  const accessToken = process.env["POLAR_ACCESS_TOKEN"];
  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not set");
  }

  try {
    const response = await fetch(`${POLAR_API_URL}/checkouts/${checkoutId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get checkout: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get Polar checkout:", error);
    throw error;
  }
}
