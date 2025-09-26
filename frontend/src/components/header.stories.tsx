import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './header';

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Header />,
};

export const WithContent: Story = {
  render: () => (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Page Content</h2>
        <p className="text-muted-foreground">
          This is some example content below the header to show how it looks in context.
        </p>
      </div>
    </div>
  ),
};
