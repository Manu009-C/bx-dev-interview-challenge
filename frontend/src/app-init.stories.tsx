import type { Meta, StoryObj } from '@storybook/react';
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Header } from "./components/header";
import { ThemeProvider } from "./providers/theme-provider";
import { useMemo } from "react";
import { ExampleService } from "./services/example.service";

// Storybook-specific version of AppInit without ClerkProviderWrapper
function AppInitForStorybook() {
  const exampleService = useMemo(function initExampleService() {
    return new ExampleService();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background">
        <Header />

    {/* Main Content */}
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Welcome Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Benvenuto nell'applicazione</CardTitle>
            <CardDescription className="text-lg">
              Questa è l'impostazione iniziale per l'app con Tailwind CSS e shadcn/ui
              configurato correttamente.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Funzionalità 1</CardTitle>
              <CardDescription>
                Descrizione della prima funzionalità
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Qui puoi aggiungere la tua prima funzionalità. Tailwind CSS e shadcn/ui
                sono ora configurati e funzionanti.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Scopri di più</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funzionalità 2</CardTitle>
              <CardDescription>
                Descrizione della seconda funzionalità
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Qui puoi aggiungere la tua seconda funzionalità. Tutti i
                componenti shadcn/ui sono disponibili.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                size="sm"
                onClick={async () => {
                  const { message } = await exampleService.getMessage();
                  alert(message);
                }}
              >
                Cliccami per fare una chiamata API
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Status Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Stato dell'applicazione
              <Badge variant="secondary">Aggiornato</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Tailwind CSS configurato correttamente</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>shadcn/ui componenti installati</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Design system moderno</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Layout responsivo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✅</span>
                <span>Componenti accessibili</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
      </div>
    </ThemeProvider>
  );
}

const meta: Meta<typeof AppInitForStorybook> = {
  title: 'Pages/App',
  component: AppInitForStorybook,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
