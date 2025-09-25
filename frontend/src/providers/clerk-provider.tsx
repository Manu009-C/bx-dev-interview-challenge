"use client";

import { ClerkProvider } from "@clerk/clerk-react";
import { getClerkTheme } from "../lib/clerk-theme";

// Get the Clerk publishable key from environment variables
const getClerkPubKey = () => {
  // In browser environment, try to get from window or use fallback
  if (typeof window !== "undefined") {
    return (window as any).ENV?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_Y3JlYXRpdmUtY29sdC02MC5jbGVyay5hY2NvdW50cy5kZXYk";
  }
  // In server environment, try process.env
  if (typeof process !== "undefined" && process.env) {
    return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_Y3JlYXRpdmUtY29sdC02MC5jbGVyay5hY2NvdW50cy5kZXYk";
  }
  // Fallback - use the same key that works in Storybook
  return "pk_test_Y3JlYXRpdmUtY29sdC02MC5jbGVyay5hY2NvdW50cy5kZXYk";
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
