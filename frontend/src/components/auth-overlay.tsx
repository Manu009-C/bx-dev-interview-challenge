"use client";

import { useUser } from "@clerk/clerk-react";
import { SignInButton } from "@clerk/clerk-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Lock, LogIn } from "lucide-react";

interface AuthOverlayProps {
  children: React.ReactNode;
}

export function AuthOverlay({ children }: AuthOverlayProps) {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return <>{children}</>;
  }

  if (isSignedIn) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Authentication Required</h2>
              <p className="text-muted-foreground">
                To access the file management features, please sign in to your account.
              </p>
            </div>
            
            <SignInButton 
              mode="modal"
              forceRedirectUrl="/"
            >
              <Button size="lg" className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In to Continue
              </Button>
            </SignInButton>
            
            <p className="text-xs text-muted-foreground">
              You'll be able to upload, manage, and download files after signing in.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
