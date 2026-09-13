import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

interface CheckoutResponse {
  success?: boolean;
  checkoutUrl?: string;
  checkoutId?: string;
  userId?: string;
  error?: string;
}

export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();

  const handleCheckout = async (productId: string, successUrl?: string) => {
    try {
      // Require authentication
      if (!isSignedIn) {
        toast.error("Please sign in to proceed with checkout");
        return;
      }

      setIsLoading(true);

      const response = await fetch("/api/public/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, successUrl }),
      });

      const data = (await response.json()) as CheckoutResponse;

      if (!response.ok) {
        toast.error(data.error || "Failed to create checkout");
        return;
      }

      if (data.checkoutUrl) {
        // Redirect to Polar checkout
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to initiate checkout";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleCheckout,
    isLoading,
    isAuthenticated: isSignedIn,
  };
}
