import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Welcome',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome: Story = {
  render: () => (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Storybook
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          This is your component development environment for the BonusX Interview Challenge.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-3 text-blue-600">UI Components</h2>
          <p className="text-gray-600 mb-4">
            Browse and test all your shadcn/ui components including buttons, cards, and badges.
          </p>
          <div className="text-sm text-gray-500">
            Check out the &quot;UI&quot; section in the sidebar →
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-3 text-green-600">Pages</h2>
          <p className="text-gray-600 mb-4">
            View complete pages and application layouts in isolation.
          </p>
          <div className="text-sm text-gray-500">
            Check out the &quot;Pages&quot; section in the sidebar →
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-3 text-purple-600">Tailwind CSS</h2>
          <p className="text-gray-600 mb-4">
            All components are styled with Tailwind CSS utility classes.
          </p>
          <div className="text-sm text-gray-500">
            Responsive, accessible, and modern design
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-3 text-orange-600">Development</h2>
          <p className="text-gray-600 mb-4">
            Use the controls panel to interact with component props and see changes in real-time.
          </p>
          <div className="text-sm text-gray-500">
            Perfect for component development and testing
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
        <p className="text-blue-800 text-sm">
          Use the sidebar to navigate between different components and stories. 
          Each story shows a different state or variation of a component.
        </p>
      </div>
    </div>
  ),
};
