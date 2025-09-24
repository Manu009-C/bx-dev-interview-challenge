import { createClerkClient } from '@clerk/clerk-sdk-node';

export const clerkConfig = {
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey:
    process.env.CLERK_PUBLISHABLE_KEY ||
    'pk_test_Y3JlYXRpdmUtY29sdC02MC5jbGVyay5hY2NvdW50cy5kZXYk',
  jwtKey: process.env.CLERK_JWT_KEY,
};

// Initialize Clerk client with the new API
export const clerkClient = createClerkClient({
  secretKey: clerkConfig.secretKey || '',
});
