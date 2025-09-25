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