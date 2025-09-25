# Frontend

This is the frontend application for the BonusX Interview Challenge, built with modern React technologies and a beautiful design system.

## Getting Started

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Start the development server:
   ```bash
   yarn start:dev
   ```

3. Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

## Available Scripts

- `yarn start:dev` - Start the development server
- `yarn build` - Build the application for production
- `yarn preview` - Preview the production build
- `yarn test` - Run tests
- `yarn lint` - Run ESLint
- `yarn storybook` - Start Storybook for component development
- `yarn build-storybook` - Build Storybook for production

## Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Rsbuild** - Fast, modern build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Storybook** - Component development and documentation
- **Jest** - Testing framework
- **ESLint** - Code linting

## Design System

This project uses a modern design system built on:

- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for accessible, customizable components
- **CSS Variables** for theming support
- **Responsive design** with mobile-first approach

## Component Development

We use Storybook for component development and documentation. Start it with:

```bash
yarn storybook
```

This will open Storybook at [http://localhost:6006](http://localhost:6006) where you can:
- Browse all available components
- Test different component states
- View component documentation
- Test accessibility features
- **Switch themes**: Use the theme toggle in components or try the ThemeDemo story
- **Test authentication**: See how components look with different auth states

## Clerk Themes Integration

The project uses `@clerk/themes` with the shadcn theme for consistent styling:

- **shadcn Theme**: Imported via `@clerk/themes/shadcn.css` in global styles
- **Custom Variables**: Overridden with our CSS custom properties for theme switching
- **Consistent Design**: Clerk components match the shadcn/ui design system
- **Theme Aware**: All Clerk components respect light/dark mode changes

## Styling

The project uses Tailwind CSS with a custom design system:

- **Colors**: Defined in CSS variables for easy theming
- **Typography**: Responsive typography scale
- **Spacing**: Consistent spacing system
- **Components**: Reusable shadcn/ui components

## Available Components

- **Button** - Various button styles and sizes
- **Card** - Content containers with header, content, and footer
- **Badge** - Status indicators and labels
- **More components** can be added using `npx shadcn@latest add [component-name]`

## Adding New Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

This will automatically:
- Install the component and its dependencies
- Add the component to your `src/components/ui` directory
- Update your `components.json` configuration

## Authentication Setup (Clerk)

This app uses Clerk for authentication. To set it up:

1. **Create a Clerk Account**:
   - Go to [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
   - Sign up for a free account

2. **Create a New Application**:
   - Click "Add application"
   - Choose "React" as the framework
   - Name it "BonusX Challenge"

3. **Get Your API Keys**:
   - Copy the "Publishable key" (starts with `pk_test_`)
   - Copy the "Secret key" (starts with `sk_test_`)

4. **Create Environment File**:
   ```bash
   cp env.local.example .env.local
   ```

5. **Add Your Keys to `.env.local`**:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-actual-key-here
   CLERK_SECRET_KEY=sk_test_your-actual-secret-key-here
   ```

6. **Configure Google-Only Authentication**:
   - In your Clerk Dashboard, go to "User & Authentication" → "Social Connections"
   - Enable only Google OAuth
   - Disable email/password authentication
   - Set up your Google OAuth credentials

7. **Set Up Redirect URLs**:
   - In Clerk Dashboard, go to "Paths"
   - Set Sign-in URL: `http://localhost:3001/` (for development)
   - Set Sign-up URL: `http://localhost:3001/` (for development)
   - Set After sign-in URL: `http://localhost:3001/`
   - Set After sign-up URL: `http://localhost:3001/`

## Features

- **Theme Switching**: Light/dark mode with system preference detection
- **Authentication**: Sign in/out with Clerk (Google OAuth only)
- **Clerk Themes**: Integrated with shadcn/ui design system for consistent styling
- **Responsive Design**: Works on all devices
- **Component Library**: Built with shadcn/ui and Tailwind CSS
- **Storybook**: Component development and documentation
- **TypeScript**: Full type safety