"use client";

import { UserButton, SignInButton, useUser } from "@clerk/clerk-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { getClerkTheme } from "../lib/clerk-theme";

export function Header() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">BonusX Challenge</h1>
          </div>

          {/* Right side - Theme toggle and Auth */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <UserButton 
                    appearance={getClerkTheme()}
                  />
                ) : (
                  <SignInButton 
                    mode="modal"
                    forceRedirectUrl="/"
                    appearance={getClerkTheme()}
                  >
                    <Button variant="default" size="sm">
                      Sign In with Google
                    </Button>
                  </SignInButton>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
