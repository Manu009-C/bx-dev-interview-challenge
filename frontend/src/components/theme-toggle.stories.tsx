import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from './theme-toggle';

const meta: Meta<typeof ThemeToggle> = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
    actions: {
      handles: ['click'],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'theme-toggled' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InHeader: Story = {
  render: () => (
    <div className="flex items-center justify-between w-full max-w-md p-4 border rounded-lg">
      <span className="text-sm font-medium">Theme</span>
      <ThemeToggle />
    </div>
  ),
};

export const InToolbar: Story = {
  render: () => (
    <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
      <span className="text-sm">Settings</span>
      <span className="text-sm">Profile</span>
      <ThemeToggle />
    </div>
  ),
};

export const MultipleToggles: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Header Theme</span>
        <ThemeToggle />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Sidebar Theme</span>
        <ThemeToggle />
      </div>
    </div>
  ),
};

export const WithThemeAction: Story = {
  render: () => (
    <div className="p-6 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Theme Toggle with Action</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click the toggle to see the action in the Actions panel
        </p>
        <ThemeToggle />
      </div>
    </div>
  ),
  parameters: {
    actions: {
      handles: ['click'],
    },
  },
};