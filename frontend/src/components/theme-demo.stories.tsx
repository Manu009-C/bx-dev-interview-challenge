import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const ThemeDemo = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Theme Demo</h2>
        <ThemeToggle />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Theme-Aware Components</CardTitle>
            <CardDescription>All components automatically adapt to the current theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the theme toggle to see how all components change colors automatically.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
                <Button variant="destructive" size="sm">Destructive</Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Inputs and controls respect the theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Text Input</label>
                <input 
                  type="text" 
                  placeholder="Type something..." 
                  className="w-full mt-1 px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Select</label>
                <select className="w-full mt-1 px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="demo-checkbox" className="rounded" />
                  <label htmlFor="demo-checkbox" className="text-sm">Checkbox</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" id="demo-radio" name="demo" />
                  <label htmlFor="demo-radio" className="text-sm">Radio</label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>CSS Variables in Action</CardTitle>
          <CardDescription>These colors are controlled by CSS custom properties</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-full h-8 bg-primary rounded"></div>
              <p className="text-xs text-muted-foreground">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-8 bg-secondary rounded"></div>
              <p className="text-xs text-muted-foreground">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-8 bg-muted rounded"></div>
              <p className="text-xs text-muted-foreground">Muted</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-8 bg-destructive rounded"></div>
              <p className="text-xs text-muted-foreground">Destructive</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const meta: Meta<typeof ThemeDemo> = {
  title: 'Components/ThemeDemo',
  component: ThemeDemo,
  parameters: {
    layout: 'fullscreen',
    actions: {
      handles: ['click'],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LightTheme: Story = {};

export const DarkTheme: Story = {};
