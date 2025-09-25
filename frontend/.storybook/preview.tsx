import type { Preview } from "@storybook/react-vite";
import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { ThemeProvider } from '../src/providers/theme-provider';
import { withThemeByClassName } from '@storybook/addon-themes';
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    (Story) => (
      <ClerkProvider appearance={{
        cssLayerName: 'clerk',
      }} publishableKey="pk_test_Y3JlYXRpdmUtY29sdC02MC5jbGVyay5hY2NvdW50cy5kZXYk">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="min-h-screen bg-background text-foreground">
            <Story />
          </div>
        </ThemeProvider>
      </ClerkProvider>
    ),
  ],
};

export default preview;
