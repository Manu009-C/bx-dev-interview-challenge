import { createClerkClient } from '@clerk/clerk-sdk-node';

export const clerkConfig = {
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  jwtKey: process.env.CLERK_JWT_KEY,
};

// Initialize Clerk client with the new API
export const clerkClient = createClerkClient({
  secretKey: clerkConfig.secretKey || '',
});
