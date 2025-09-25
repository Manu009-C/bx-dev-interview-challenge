"use client";

import { ClerkProvider } from "@clerk/clerk-react";
import { getClerkTheme } from "../lib/clerk-theme";

// Get the Clerk publishable key from environment variables
const getClerkPubKey = () => {
  // In browser environment, try to get from window or use fallback
  if (typeof window !== "undefined") {
    return (window as any).ENV?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_your-key-here";
  }
  // In server environment, try process.env
  if (typeof process !== "undefined" && process.env) {
    return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_your-key-here";
  }
  // Fallback
  return "pk_test_your-key-here";
};

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const clerkPubKey = getClerkPubKey();
  
  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      appearance={getClerkTheme()}
    >
      {children}
    </ClerkProvider>
  );
}
