"use client";

import { ClerkProvider } from "@clerk/clerk-react";
import { getClerkTheme } from "../lib/clerk-theme";

// Get the Clerk publishable key from environment variables
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Clerk publishable key. Please set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY or CLERK_PUBLISHABLE_KEY in your environment variables.");
}

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider 
      publishableKey={clerkPubKey as string}
      appearance={getClerkTheme()}
    >
      {children}
    </ClerkProvider>
  );
}
