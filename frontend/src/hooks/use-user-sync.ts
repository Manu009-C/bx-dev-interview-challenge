import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { UserService } from '../services/user.service';

export function useUserSync() {
  const { isSignedIn, getToken } = useAuth();
  const hasAttemptedSync = useRef(false);
  const userService = useRef(new UserService());

  useEffect(() => {
    const syncUser = async () => {
      try {
        // Set up the token getter for the user service
        userService.current.setTokenGetter(getToken);
        
        // Sync the user with backend
        await userService.current.syncUser();
        console.log('User successfully synced with backend');
        
        // Mark as synced to prevent re-sync
        hasAttemptedSync.current = true;
      } catch (error) {
        console.error('Failed to sync user with backend:', error);
        // Reset the flag so we can retry on next render if needed
        hasAttemptedSync.current = false;
      }
    };

    // Only sync if user is signed in and we haven't attempted sync yet
    if (isSignedIn && !hasAttemptedSync.current) {
      syncUser();
    }
  }, [isSignedIn, getToken]);

  return {
    isUserSynced: hasAttemptedSync.current,
  };
}
