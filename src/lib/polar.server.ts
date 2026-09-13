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
  productId: string,
  successUrl?: string,
): Promise<CheckoutSession> {
  const accessToken = process.env["POLAR_ACCESS_TOKEN"];
  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not set");
  }

  const polarSuccessUrl = successUrl || process.env["POLAR_SUCCESS_URL"];
  if (!polarSuccessUrl) {
    throw new Error("POLAR_SUCCESS_URL is not set");
  }

  try {
    const response = await fetch(`${POLAR_API_URL}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        productId,
        successUrl: polarSuccessUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Polar API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data as CheckoutSession;
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
