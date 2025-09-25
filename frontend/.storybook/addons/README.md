# Storybook Themes

This project uses the official `@storybook/addon-themes` for theme switching in Storybook.

## Features

- **Official Addon**: Uses Storybook's official themes addon
- **Toolbar Integration**: Theme toggle appears in the Storybook toolbar
- **Light/Dark Themes**: Switch between light and dark themes
- **Component Integration**: All components respect the selected theme
- **Clerk Integration**: Authentication components also respect the theme

## Usage

1. Start Storybook: `yarn storybook`
2. Look for the theme toggle in the Storybook toolbar (top of the page)
3. Click to switch between Light and Dark themes
4. All components will update immediately

## Configuration

The themes are configured in `.storybook/preview.tsx`:

```typescript
themes: {
  default: 'light',
  list: [
    { name: 'light', title: 'Light', color: '#ffffff' },
    { name: 'dark', title: 'Dark', color: '#000000' },
  ],
},
```

## How It Works

1. The addon provides a theme selector in the Storybook toolbar
2. The selected theme is passed to the decorator via `context.globals.theme`
3. The decorator applies the theme to the document and components
4. All components automatically respond to theme changes
