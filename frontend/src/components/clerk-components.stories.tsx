import type { Meta, StoryObj } from '@storybook/react';
import { UserButton, SignInButton, useUser } from "@clerk/clerk-react";
import { Button } from './ui/button';
import { getClerkTheme } from '../lib/clerk-theme';

// Component that shows different auth states
function AuthDemo() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Authentication State</h3>
      <div className="space-y-2">
        <p><strong>Loaded:</strong> {isLoaded ? 'Yes' : 'No'}</p>
        <p><strong>Signed In:</strong> {isSignedIn ? 'Yes' : 'No'}</p>
      </div>
      
      <div className="flex items-center space-x-4">
        {isLoaded && (
          <>
            {isSignedIn ? (
              <div className="flex items-center space-x-2">
                <span>User Button:</span>
                <UserButton 
                  appearance={getClerkTheme()}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Sign In Button:</span>
                <SignInButton mode="modal" appearance={getClerkTheme()}>
                  <Button variant="default" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const meta: Meta<typeof AuthDemo> = {
  title: 'Components/Authentication',
  component: AuthDemo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SignInButtonStory: Story = {
  render: () => (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Sign In Button</h3>
      <SignInButton mode="modal" appearance={getClerkTheme()}>
        <Button variant="default" size="sm">
          Sign In
        </Button>
      </SignInButton>
    </div>
  ),
};

export const UserButtonStory: Story = {
  render: () => (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">User Button (Mock)</h3>
      <div className="text-sm text-muted-foreground mb-2">
        This shows what the user button looks like when signed in
      </div>
      <UserButton 
        appearance={{
          elements: {
            avatarBox: "w-8 h-8"
          }
        }}
      />
    </div>
  ),
};
